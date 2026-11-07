import axios from 'axios';

// Tự động nhận diện hostname để hỗ trợ chạy mượt mà trên cả máy tính lẫn điện thoại di động trong mạng LAN
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    // Nếu truy cập từ thiết bị di động / máy tính bảng qua IP mạng nội bộ (Wi-Fi)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5000/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Tự động đính kèm JWT token từ localStorage vào header Authorization
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Quản lý kho tài khoản dự phòng trên Trình duyệt (LocalStorage Mirror)
const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem('smarttour_client_users');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [
    {
      id: 1,
      fullName: 'Quản Trị Viên Hệ Thống',
      email: 'admin@smarttour.vn',
      password: 'admin123',
      role: 'ADMIN',
      phone: '0901888999',
      avatar: '',
      createdAt: '2026-01-15T08:00:00.000Z'
    }
  ];
};

const saveLocalUsers = (users) => {
  try {
    localStorage.setItem('smarttour_client_users', JSON.stringify(users));
  } catch {
    // ignore
  }
};

// 1. Dịch vụ Xác thực người dùng (Auth Service)
export const authService = {
  login: async (credentials) => {
    try {
      const res = await apiClient.post('/auth/login', credentials);
      return res.data;
    } catch (err) {
      // Nếu máy chủ backend phản hồi lỗi cụ thể (như sai mật khẩu), re-throw lỗi nguyên bản từ server
      if (err.response) throw err;

      // Dự phòng nếu máy chủ chưa bật hoặc mất kết nối mạng
      const localUsers = getLocalUsers();
      const cleanEmail = credentials.email.trim().toLowerCase();
      const user = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!user || user.password !== credentials.password) {
        const customErr = new Error('Email hoặc mật khẩu không chính xác!');
        customErr.response = { data: { message: 'Email hoặc mật khẩu không chính xác!' } };
        throw customErr;
      }

      return {
        success: true,
        token: 'local_jwt_token_' + Date.now(),
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || '',
          avatar: user.avatar || '',
          role: user.role,
          createdAt: user.createdAt
        }
      };
    }
  },

  register: async (userData) => {
    try {
      const res = await apiClient.post('/auth/register', userData);
      // Tự động sao lưu bản ghi tài khoản vào local mirror
      const localUsers = getLocalUsers();
      const cleanEmail = userData.email.trim().toLowerCase();
      if (!localUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
        localUsers.push({
          id: res.data.user.id,
          fullName: userData.fullName.trim(),
          email: cleanEmail,
          password: userData.password,
          phone: userData.phone || '',
          role: 'CUSTOMER',
          createdAt: new Date().toISOString()
        });
        saveLocalUsers(localUsers);
      }
      return res.data;
    } catch (err) {
      // Nếu máy chủ backend phản hồi (ví dụ: trùng email), re-throw lỗi từ server
      if (err.response) throw err;

      // Dự phòng nếu máy chủ chưa bật: kiểm tra trùng email cục bộ
      const localUsers = getLocalUsers();
      const cleanEmail = userData.email.trim().toLowerCase();

      if (localUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
        const customErr = new Error('Email này đã tồn tại tài khoản');
        customErr.response = { data: { message: 'Email này đã tồn tại tài khoản' } };
        throw customErr;
      }

      const newUser = {
        id: Date.now(),
        fullName: userData.fullName.trim(),
        email: cleanEmail,
        password: userData.password,
        phone: userData.phone || '',
        role: 'CUSTOMER',
        createdAt: new Date().toISOString()
      };

      localUsers.push(newUser);
      saveLocalUsers(localUsers);

      return {
        success: true,
        token: 'local_jwt_token_' + Date.now(),
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      };
    }
  },

  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    try {
      const res = await apiClient.put('/auth/profile', profileData);
      // Đồng bộ mirror cục bộ nếu có
      const localUsers = getLocalUsers();
      const uIdx = localUsers.findIndex((u) => u.id === res.data.user.id || u.email?.toLowerCase() === res.data.user.email?.toLowerCase());
      if (uIdx !== -1) {
        localUsers[uIdx] = { ...localUsers[uIdx], ...res.data.user };
        saveLocalUsers(localUsers);
      }
      return res.data;
    } catch (err) {
      if (err.response) throw err;
      // Dự phòng offline mirror:
      const localUsers = getLocalUsers();
      const savedUserStr = localStorage.getItem('user');
      const currentUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          ...(profileData.fullName ? { fullName: profileData.fullName.trim() } : {}),
          ...(profileData.phone !== undefined ? { phone: profileData.phone.trim() } : {}),
          ...(profileData.avatar !== undefined ? { avatar: profileData.avatar.trim() } : {}),
        };
        const uIdx = localUsers.findIndex((u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email?.toLowerCase());
        if (uIdx !== -1) {
          localUsers[uIdx] = { ...localUsers[uIdx], ...updatedUser };
          saveLocalUsers(localUsers);
        }
        return { success: true, message: 'Cập nhật thông tin thành công!', user: updatedUser };
      }
      throw err;
    }
  },

  changePassword: async (passwordData) => {
    const res = await apiClient.put('/auth/change-password', passwordData);
    return res.data;
  },
};

// 2. Dịch vụ Quản lý Tour du lịch (Tour Service)
export const tourService = {
  getAllTours: async (params = {}) => {
    const res = await apiClient.get('/tours', { params });
    return res.data.data || res.data;
  },
  getTourById: async (id) => {
    const res = await apiClient.get(`/tours/${id}`);
    return res.data.data || res.data;
  },
  createTour: async (tourData) => {
    const res = await apiClient.post('/tours', tourData);
    return res.data.data || res.data;
  },
  updateTour: async (id, tourData) => {
    const res = await apiClient.put(`/tours/${id}`, tourData);
    return res.data.data || res.data;
  },
  deleteTour: async (id) => {
    const res = await apiClient.delete(`/tours/${id}`);
    return res.data;
  },
  checkVoucher: async (code, totalPrice) => {
    const res = await apiClient.post('/tours/check-voucher', { code, totalPrice });
    return res.data;
  },
  addReview: async (tourId, reviewData) => {
    const res = await apiClient.post(`/tours/${tourId}/reviews`, reviewData);
    return res.data;
  },
};

// 3. Dịch vụ Quản lý Đặt chỗ (Booking Service)
export const bookingService = {
  getAllBookings: async (params = {}) => {
    const res = await apiClient.get('/bookings', { params });
    return res.data.data || res.data;
  },
  createBooking: async (bookingData) => {
    const res = await apiClient.post('/bookings', bookingData);
    return res.data.data || res.data;
  },
  updateStatus: async (id, status) => {
    const res = await apiClient.patch(`/bookings/${id}`, { status });
    return res.data.data || res.data;
  },
  cancelBooking: async (id) => {
    const res = await apiClient.patch(`/bookings/${id}/cancel`);
    return res.data;
  },
  confirmPayment: async (id, paymentData = {}) => {
    const res = await apiClient.patch(`/bookings/${id}/pay`, paymentData);
    return res.data.data || res.data;
  },
};

// 4. Dịch vụ Quản lý Người dùng (User Service - Admin)
export const userService = {
  getAllUsers: async () => {
    const res = await apiClient.get('/users');
    return res.data.data || res.data;
  },
  updateRole: async (id, role) => {
    const res = await apiClient.patch(`/users/${id}/role`, { role });
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
};
