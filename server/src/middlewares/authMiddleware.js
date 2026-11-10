const jwt = require('jsonwebtoken');
const { users } = require('../config/data');

const JWT_SECRET = process.env.JWT_SECRET || 'smarttour_super_secret_key_2026_jwt';

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
      message: 'Vui lòng đăng ký/đăng nhập tài khoản.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'
      });
    }
    const found = users.find(
      (u) =>
        String(u.id) === String(user.id) ||
        (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
    );
    req.user = {
      ...user,
      fullName: found ? found.fullName : user.fullName,
      avatar: found && found.avatar ? found.avatar : '',
      role: found ? found.role : user.role
    };
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

/**
 * Middleware tùy chọn nhận diện user nếu có token (không bắt buộc)
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      const found = users.find(
        (u) =>
          String(u.id) === String(user.id) ||
          (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
      );
      req.user = {
        ...user,
        fullName: found ? found.fullName : user.fullName,
        avatar: found && found.avatar ? found.avatar : '',
        role: found ? found.role : user.role
      };
    } else {
      req.user = null;
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
