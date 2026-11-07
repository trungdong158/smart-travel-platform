const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Công khai / Khách hàng đặt tour
router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);

// Khách hàng tự hủy đơn của chính mình khi chờ xử lý
router.patch('/:id/cancel', bookingController.cancelBookingByCustomer);

// Khách hàng xác nhận thanh toán chuyển khoản VietQR / MoMo mô phỏng
router.patch('/:id/pay', bookingController.confirmPaymentByCustomer);

// Admin duyệt / cập nhật trạng thái đơn hàng
router.patch('/:id', authenticateToken, requireAdmin, bookingController.updateBookingStatus);

module.exports = router;
