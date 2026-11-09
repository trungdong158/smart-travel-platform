const bcrypt = require('bcryptjs');
const { users, saveUsers } = require('../config/data');
const { isValidEmail, isValidVietnamesePhone } = require('../utils/validation');

/**
 * Tạo tài khoản quản trị viên mới (Chỉ dành cho Admin hiện tại)
 */
const createAdminUser = (req, res) => {
  const { fullName, email, password, phone } = req.body;

  if (typeof fullName !== 'string' || !fullName.trim() || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ: Họ tên, Email và Mật khẩu!'
    });
  }

  const cleanFullName = fullName.trim();
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
  const cleanPassword = password.toString();

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Địa chỉ email không đúng định dạng hợp lệ!'
    });
  }

  if (cleanPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu phải có độ dài từ 6 ký tự trở lên!'
    });
  }

  if (cleanPhone && !isValidVietnamesePhone(cleanPhone)) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập số điện thoại Việt Nam hợp lệ (ví dụ: 0912 345 678).'
    });
  }

  const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email đã tồn tại trong hệ thống. Vui lòng dùng email khác!'
    });
  }

  const newAdmin = {
    id: Date.now(),
    fullName: cleanFullName,
    email: cleanEmail,
    phone: cleanPhone,
    avatar: '',
    passwordHash: bcrypt.hashSync(cleanPassword, 10),
    role: 'ADMIN',
    createdAt: new Date().toISOString()
  };

  users.push(newAdmin);
  saveUsers();

  return res.status(201).json({
    success: true,
    message: `Đã tạo tài khoản quản trị viên mới cho ${newAdmin.fullName}!`,
    data: {
      id: newAdmin.id,
      fullName: newAdmin.fullName,
      email: newAdmin.email,
      phone: newAdmin.phone,
      role: newAdmin.role,
      createdAt: newAdmin.createdAt
    }
  });
};

/**
 * Lấy danh sách tất cả người dùng trong hệ thống (Chỉ dành cho Admin)
 */
const getAllUsers = (req, res) => {
  const safeUsers = users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone || '',
    avatar: u.avatar || '',
    role: u.role,
    createdAt: u.createdAt
  }));

  return res.json({ success: true, count: safeUsers.length, data: safeUsers });
};

/**
 * Cập nhật vai trò người dùng (Admin)
 */
const updateUserRole = (req, res) => {
  const id = Number(req.params.id);
  const { role } = req.body;

  if (!['ADMIN', 'CUSTOMER'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Vai trò người dùng không hợp lệ!' });
  }

  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
  }

  user.role = role;
  saveUsers(); // Lưu xuống file disk

  return res.json({
    success: true,
    message: `Đã cập nhật vai trò của ${user.fullName} thành ${role}`,
    data: { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
  });
};

/**
 * Xóa người dùng (Admin)
 */
const deleteUser = (req, res) => {
  const id = Number(req.params.id);

  if (req.user && req.user.id === id) {
    return res.status(400).json({
      success: false,
      message: 'Bạn không thể tự xóa tài khoản của chính mình khi đang đăng nhập!'
    });
  }

  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng cần xóa!' });
  }

  users.splice(index, 1);
  saveUsers(); // Lưu xuống file disk

  return res.json({ success: true, message: 'Đã xóa người dùng thành công!' });
};

module.exports = {
  createAdminUser,
  getAllUsers,
  updateUserRole,
  deleteUser
};
