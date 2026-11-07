const { users, saveUsers } = require('../config/data');

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
  getAllUsers,
  updateUserRole,
  deleteUser
};
