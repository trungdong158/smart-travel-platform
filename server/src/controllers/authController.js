const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users, saveUsers } = require('../config/data');

const JWT_SECRET = process.env.JWT_SECRET || 'smarttour_super_secret_key_2026_jwt';

/**
 * Đăng ký tài khoản Khách hàng mới (Customer)
 */
const register = (req, res) => {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ: Họ tên, Email và Mật khẩu!'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanFullName = fullName.trim();
  const cleanPhone = phone ? phone.trim() : '';
  const cleanPassword = password.toString();

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Địa chỉ email không đúng định dạng hợp lệ!'
    });
  }

  // Kiểm tra độ dài mật khẩu
  if (cleanPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu phải có độ dài từ 6 ký tự trở lên!'
    });
  }

  // Kiểm tra nếu số điện thoại là chữ hoặc có chữ trong đó
  if (cleanPhone) {
    if (/[a-zA-ZÀ-ỹ]/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập số điện thoại đúng định dạng.'
      });
    }
  }

  // Kiểm tra trùng email - Mỗi email chỉ được đăng ký một tài khoản
  const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email này đã tồn tại tài khoản'
    });
  }

  // Tạo tài khoản mới với mật khẩu mã hóa an toàn bcrypt
  const newUser = {
    id: Date.now(),
    fullName: cleanFullName,
    email: cleanEmail,
    phone: cleanPhone,
    avatar: '',
    passwordHash: bcrypt.hashSync(cleanPassword, 10),
    role: 'CUSTOMER',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  // Lưu bền vững xuống đĩa cứng (Persistence) để không bao giờ bị mất khi khởi động lại máy chủ
  saveUsers();

  // Ký JWT Token thời hạn 7 ngày
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.fullName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    success: true,
    message: 'Đăng ký tài khoản thành viên thành công!',
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      avatar: newUser.avatar || '',
      role: newUser.role,
      createdAt: newUser.createdAt
    }
  });
};

/**
 * Đăng nhập hệ thống (Guest / Customer / Admin)
 */
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ Email và Mật khẩu!'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.toString();

  // Tìm kiếm tài khoản theo email (không phân biệt chữ hoa thường)
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Email hoặc mật khẩu không chính xác!'
    });
  }

  // So sánh mật khẩu bằng bcrypt
  const isMatch = bcrypt.compareSync(cleanPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Email hoặc mật khẩu không chính xác!'
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: 'Đăng nhập thành công! Chào mừng ' + user.fullName,
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      role: user.role,
      createdAt: user.createdAt
    }
  });
};

/**
 * Lấy thông tin tài khoản hiện tại
 */
const getProfile = (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tài khoản!' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      role: user.role,
      createdAt: user.createdAt
    }
  });
};

/**
 * Cập nhật thông tin cá nhân (Profile)
 */
const updateProfile = (req, res) => {
  const { fullName, phone, avatar } = req.body;
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Người dùng không tồn tại!' });
  }

  if (fullName) user.fullName = fullName.trim();
  if (phone !== undefined) {
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
    if (cleanPhone) {
      if (/[a-zA-ZÀ-ỹ]/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập số điện thoại đúng định dạng.'
        });
      }
    }
    user.phone = cleanPhone;
  }
  if (avatar !== undefined) user.avatar = typeof avatar === 'string' ? avatar.trim() : '';

  saveUsers(); // Lưu bền vững

  return res.json({
    success: true,
    message: 'Cập nhật thông tin cá nhân thành công!',
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || '',
      role: user.role,
      createdAt: user.createdAt
    }
  });
};

/**
 * Đổi mật khẩu
 */
const changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'Người dùng không tồn tại!' });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu cũ và mới!' });
  }

  const isMatch = bcrypt.compareSync(currentPassword.toString(), user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng!' });
  }

  // Kiểm tra nếu mật khẩu mới trùng với mật khẩu hiện tại
  if (currentPassword.toString() === newPassword.toString() || bcrypt.compareSync(newPassword.toString(), user.passwordHash)) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.' });
  }

  if (newPassword.toString().length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự!' });
  }

  user.passwordHash = bcrypt.hashSync(newPassword.toString(), 10);
  saveUsers(); // Lưu bền vững mật khẩu mới

  return res.json({ success: true, message: 'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới.' });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
