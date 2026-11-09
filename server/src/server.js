/**
 * SMART TRAVEL & EXPERIENCE BOOKING PLATFORM
 * Backend RESTful API Server
 * 
 * Nhóm sinh viên thực hiện:
 * 1. Lê Phan Trung Đông - MSSV: 6651071016
 * 2. Ngô Thuận Dương - MSSV: 6651071010
 * 3. Trần Thanh Huy - MSSV: 6651071027
 * 4. Đặng Quốc Vương - MSSV: 6651071096
 * 5. Nguyễn Quốc Đạt - MSSV: 6651071014
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const tourRoutes = require('./routes/tourRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Root Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'Smart Travel & Experience Booking Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi hệ thống trên máy chủ!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Khi chạy cục bộ (Node.js thông thường) thì khởi chạy HTTP server; khi chạy trên Vercel Serverless thì không gọi listen()
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 SoulTrip Backend API đang hoạt động tại port: ${PORT}`);
    console.log(`🔗 API Local:   http://localhost:${PORT}/api`);
    console.log(`🔗 API Network: http://0.0.0.0:${PORT}/api (Hỗ trợ truy cập từ điện thoại/tablet)`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
