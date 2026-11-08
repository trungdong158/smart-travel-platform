import axios from 'axios';

const API_BASE_URL = '/api';

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

// 1. Dịch vụ Xác thực người dùng (Auth Service)
export const authService = {
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },

  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await apiClient.put('/auth/profile', profileData);
    return res.data;
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
