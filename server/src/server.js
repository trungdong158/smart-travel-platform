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

const app = require('./app');

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 SmartTour Backend API đang hoạt động tại port: ${PORT}`);
    console.log(`🔗 API Local:   http://localhost:${PORT}/api`);
    console.log(`🔗 API Network: http://0.0.0.0:${PORT}/api (Hỗ trợ truy cập từ điện thoại/tablet)`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
