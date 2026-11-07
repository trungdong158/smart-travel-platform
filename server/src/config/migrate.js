/**
 * Script khởi tạo Schema Database cho PostgreSQL (tùy chọn)
 * Dành cho đồ án khi kết nối cơ sở dữ liệu thật PostgreSQL
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smart_tour_db',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const schemaSQL = `
-- 1. Bảng Người dùng (Users)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'CUSTOMER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Tour du lịch (Tours)
CREATE TABLE IF NOT EXISTS tours (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  category_name VARCHAR(100),
  destination_name VARCHAR(100) NOT NULL,
  region VARCHAR(20) NOT NULL,
  duration_days INT NOT NULL DEFAULT 3,
  base_price NUMERIC(12, 2) NOT NULL,
  featured_image TEXT,
  available_seats INT NOT NULL DEFAULT 10,
  rating NUMERIC(3, 1) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  itinerary_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Yêu cầu đặt tour (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  tour_id INT REFERENCES tours(id) ON DELETE CASCADE,
  tour_title VARCHAR(255),
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL,
  departure_date DATE,
  seats INT NOT NULL DEFAULT 1,
  total_price NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  voucher_code VARCHAR(50),
  note TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function migrate() {
  console.log('🔄 Đang kết nối PostgreSQL và khởi tạo bảng dữ liệu...');
  try {
    const client = await pool.connect();
    await client.query(schemaSQL);
    console.log('✅ Khởi tạo Schema thành công!');
    client.release();
    process.exit(0);
  } catch (error) {
    console.warn('⚠️ Lưu ý: PostgreSQL cục bộ chưa khởi chạy, hệ thống đang dùng In-Memory Store mặc định.');
    console.error('Chi tiết lỗi kết nối DB:', error.message);
    process.exit(0);
  }
}

migrate();
