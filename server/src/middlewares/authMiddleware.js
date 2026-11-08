const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/jwt');

/**
 * Middleware xác thực JSON Web Token (JWT)
 * Đảm bảo người dùng đã đăng nhập hợp lệ
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để thực hiện chức năng này.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'
      });
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware phân quyền Quản Trị Viên (ADMIN)
 * Chỉ cho phép người dùng có vai trò ADMIN truy cập tài nguyên
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Từ chối truy cập: Chức năng này chỉ dành cho Quản trị viên (Admin).'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};
