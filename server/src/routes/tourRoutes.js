const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middlewares/authMiddleware');

// Công khai (Public)
router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTourById);
router.post('/check-voucher', tourController.checkVoucher);
router.post('/:id/reviews', optionalAuth, tourController.addTourReview);

// Dành cho Admin (Protected)
router.post('/', authenticateToken, requireAdmin, tourController.createTour);
router.put('/:id', authenticateToken, requireAdmin, tourController.updateTour);
router.delete('/:id', authenticateToken, requireAdmin, tourController.deleteTour);

module.exports = router;
