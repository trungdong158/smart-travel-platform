const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Chỉ dành cho Admin
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.patch('/:id/role', authenticateToken, requireAdmin, userController.updateUserRole);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

module.exports = router;
