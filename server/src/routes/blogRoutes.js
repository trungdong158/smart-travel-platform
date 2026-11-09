const express = require('express');
const router = express.Router();
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  addComment,
  toggleLike,
  getMyBlogs,
  getPendingBlogs,
  getBlogApprovalSetting,
  updateBlogApprovalSetting,
  updateBlogStatus,
  deleteBlog
} = require('../controllers/blogController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middlewares/authMiddleware');

// Lấy danh sách blog (Hỗ trợ Infinite Scroll 2 bài/lần)
router.get('/', optionalAuth, getAllBlogs);

// Lấy bài viết của chính người dùng đăng nhập
router.get('/user/me', authenticateToken, getMyBlogs);

// Lấy các bài viết đang chờ duyệt (Admin)
router.get('/admin/pending', authenticateToken, requireAdmin, getPendingBlogs);

// Cài đặt duyệt bài blog (Admin)
router.get('/admin/approval-setting', authenticateToken, requireAdmin, getBlogApprovalSetting);
router.patch('/admin/approval-setting', authenticateToken, requireAdmin, updateBlogApprovalSetting);

// Chi tiết 1 bài viết
router.get('/:id', optionalAuth, getBlogById);

// Đăng bài viết mới (Bắt buộc đăng nhập)
router.post('/', authenticateToken, createBlog);

// Bình luận vào bài viết (Hỗ trợ cả đã đăng nhập hoặc khách)
router.post('/:id/comments', optionalAuth, addComment);

// Thả tim bài viết
router.post('/:id/like', optionalAuth, toggleLike);

// Duyệt / từ chối bài viết (Admin)
router.patch('/:id/status', authenticateToken, requireAdmin, updateBlogStatus);

// Xóa bài viết (Chính chủ hoặc Admin)
router.delete('/:id', authenticateToken, deleteBlog);

module.exports = router;
