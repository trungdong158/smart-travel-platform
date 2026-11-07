# 🌟 NỀN TẢNG ĐẶT TOUR DU LỊCH VÀ TRẢI NGHIỆM THÔNG MINH
### Smart Travel & Experience Booking Platform (SmartTour 2026)

> **Đồ án môn học:** Xây Dựng Website Thực Tế  
> **Thang điểm hướng đến:** Giỏi (8.5 – 10.0)  
> **Hình thức:** Đồ án nhóm (5 sinh viên)

---

## 👥 THÀNH VIÊN NHÓM THỰC HIỆN

| STT | Họ và Tên | Mã Số Sinh Viên (MSSV) | Vai Trò & Phân Công Nhiệm Vụ |
| :---: | :--- | :---: | :--- |
| **1** | **Lê Phan Trung Đông** | **6651071016** | **Trưởng nhóm** - Thiết kế kiến trúc tổng thể, Backend RESTful API, Cơ chế bảo mật JWT, Phân quyền (RBAC), Middleware. |
| **2** | **Ngô Thuận Dương** | **6651071010** | **Thành viên** - Phân hệ Bảng điều khiển Quản trị viên (Admin Dashboard), Thống kê KPI doanh thu, Quản lý CRUD Tour, Quản trị Người dùng. |
| **3** | **Trần Thanh Huy** | **6651071027** | **Thành viên** - Phân hệ Khách hàng thành viên (Customer), Quy trình Đặt chỗ (Booking Engine), Theo dõi Lịch sử giao dịch, Hủy đơn, Quản lý Hồ sơ cá nhân (Profile). |
| **4** | **Đặng Quốc Vương** | **6651071096** | **Thành viên** - Phân hệ Khách vãng lai (Guest), Thiết kế UI/UX theo Design Tokens, Bộ lọc tìm kiếm đa tiêu chí, Trang chi tiết tour (Timeline lịch trình), Danh sách Yêu thích (Wishlist), Responsive Design. |
| **5** | **Nguyễn Quốc Đạt** | **6651071014** | **Thành viên** - Tính năng Sáng tạo: Trợ lý AI du lịch thông minh (Smart Concierge), Dự toán chi phí & Voucher giảm giá, Đánh giá & Review sao tương tác, Kiểm thử & Tối ưu hiệu suất. |

---

## 🎯 CÁC NHÓM NGƯỜI DÙNG & TÍNH NĂNG THEO ĐỀ TÀI

### 1. Khách Vãng Lai (Guest)
- **Duyệt xem nội dung:** Trang chủ hiện đại với banner động, điểm đến nổi bật 3 miền Bắc - Trung - Nam, các tour thịnh hành.
- **Tìm kiếm thông minh:** Tìm nhanh theo từ khóa tên tour, danh thắng, thành phố.
- **Lọc đa tiêu chí:** Lọc theo vùng miền (Bắc, Trung, Nam), phân loại tour (Nghỉ dưỡng, Biển đảo, Khám phá núi, Sinh thái, Di sản), khoảng giá ngân sách linh hoạt bằng thanh kéo slider.
- **Sắp xếp linh hoạt:** Giá tăng dần, Giá giảm dần, Đánh giá cao nhất.
- **Chi tiết tour đầy đủ:** Hình ảnh chất lượng cao, Điểm nổi bật (Highlights), Lịch trình chi tiết từng ngày (Interactive Day-by-Day Timeline), Chính sách dịch vụ bao gồm & không bao gồm.
- **Trợ lý AI Smart Concierge:** Chatbot AI phân tích nhu cầu tự nhiên, đề xuất 2 hành trình khớp nhất kèm đường dẫn đặt tour trực tiếp.

### 2. Khách Hàng Thành Viên (Customer)
- **Đăng ký / Đăng nhập:** Xác thực qua JWT Token, lưu phiên làm việc an toàn.
- **Thao tác đặt chỗ (Booking):**
  - Tự động điền trước thông tin từ tài khoản cá nhân.
  - Chọn ngày khởi hành, số lượng vé người lớn kèm kiểm tra số chỗ khả dụng thời gian thực.
  - Áp dụng mã Voucher giảm giá thông minh (`SMART2026`, `SMARTWELCOME`), tự động chiết khấu và hiển thị hóa đơn minh bạch.
- **Quản lý danh sách yêu thích (Wishlist):** Thả tim lưu các tour quan tâm, trang quản lý Wishlist riêng biệt để dễ dàng xem lại và đặt tour.
- **Theo dõi lịch sử giao dịch (My Bookings):**
  - Hiển thị danh sách các đơn đã đặt với trạng thái trực quan: **Chờ duyệt (Pending)**, **Đã duyệt (Confirmed)**, **Đã hủy (Cancelled)**.
  - Cho phép khách hàng chủ động hủy yêu cầu giữ chỗ khi đơn đang ở trạng thái Chờ duyệt.
- **Quản lý thông tin cá nhân (Profile):** Cập nhật họ tên, số điện thoại, đổi mật khẩu an toàn.

### 3. Quản Trị Viên (Admin)
- **Bảng điều khiển riêng biệt (Admin Dashboard):**
  - Thống kê thời gian thực: Tổng doanh thu đã duyệt, Tổng số đơn đặt tour (đơn chờ duyệt), Số lượng tour đang mở bán, Tổng thành viên hệ thống.
  - Bảo vệ phân quyền nghiêm ngặt: Chặn truy cập nếu không phải tài khoản vai trò `ADMIN`.
- **Theo dõi & Xử lý đơn đặt tour:**
  - Bộ lọc đơn hàng: Tất cả / Chờ duyệt / Đã duyệt / Đã hủy.
  - Xem thông tin khách hàng, số điện thoại, email, số vé, tổng tiền, ghi chú, mã voucher.
  - **Duyệt đơn (CONFIRMED):** Tự động trừ số ghế khả dụng của tour.
  - **Hủy đơn (CANCELLED):** Tự động hoàn lại số ghế khả dụng cho tour.
- **Quản lý Tour du lịch (CRUD đầy đủ):**
  - Thêm tour mới (Modal form chuyên nghiệp với đầy đủ thông tin: tên, ảnh, giá, số chỗ, vùng miền, danh mục, tóm tắt).
  - Sửa thông tin tour du lịch.
  - Xóa tour du lịch (Có Modal cảnh báo xác nhận an toàn).
- **Quản lý Danh sách Người dùng (User Management):**
  - Xem danh sách người dùng, vai trò (ADMIN / CUSTOMER), ngày tạo tài khoản.
  - Chuyển đổi vai trò người dùng (ADMIN <-> CUSTOMER).
  - Xóa tài khoản người dùng (ngăn chặn tự xóa tài khoản đang đăng nhập).

---

## ⚡ TÀI KHOẢN THỬ NGHIỆM ĐỂ CHẤM ĐIỂM NHANH

Trong giao diện Đăng nhập, hệ thống đã tích hợp sẵn **nút click 1 chạm** để điền nhanh:

| Vai Trò | Email Đăng Nhập | Mật Khẩu | Quyền Hạn |
| :--- | :--- | :---: | :--- |
| 👑 **Quản Trị Viên (Admin)** | `admin@smarttour.vn` | `admin123` | Toàn quyền Dashboard, Quản lý Tour, Quản lý User, Duyệt đơn |
| 👤 **Khách Hàng (Customer)** | `khachhang@gmail.com` | `123456` | Đặt tour, Quản lý Wishlist, Lịch sử đặt vé cá nhân, Hồ sơ |

---

## 🛠️ CÔNG NGHỆ & KIẾN TRÚC MÃ NGUỒN

### Frontend (Client)
- **Framework:** React 19 + Vite 8 (Tốc độ khởi động siêu tốc, HMR tức thì).
- **Styling:** Tailwind CSS (Đạt chuẩn Design Tokens về màu sắc, typography, spacing).
- **Routing:** React Router v7.
- **Icons:** Lucide React hiện đại.
- **State Management:** React Context API (AuthContext, ToastContext, WishlistContext).
- **HTTP Client:** Axios (Tự động gắn JWT Interceptor).
- **Code Quality:** ESLint chuẩn React Hooks & Refresh (0 lỗi, 0 cảnh báo).

### Backend (Server)
- **Runtime:** Node.js + Express 5.
- **Architecture:** Mô hình MVC (Model - View/Config - Controller - Routes - Middlewares).
- **Bảo mật:** `bcryptjs` (mã hóa mật khẩu 10 salt rounds), `jsonwebtoken` (JWT xác thực phiên).
- **CORS & Environment:** Cấu hình chuẩn bảo mật CORS và file môi trường `.env`.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Yêu cầu môi trường
- Đã cài đặt **Node.js** (khuyến nghị từ phiên bản v18 trở lên).
- Trình duyệt hiện đại: Chrome, Edge, Firefox, Safari.

### 2. Khởi chạy dự án (Khuyến nghị 1 lệnh duy nhất)
Tại thư mục gốc `Smart-travel-platform`, mở terminal và chạy:

```bash
npm run dev
```

Lệnh trên sẽ đồng thời khởi động:
- **Backend API Server:** `http://localhost:5000`
- **Frontend Web Client:** `http://localhost:5173`

*(Hoặc có thể chạy riêng lẻ: `npm run dev:server` và `npm run dev:client`)*

### 3. Kiểm tra chất lượng mã nguồn & Build
```bash
# Kiểm tra linting (Đảm bảo 0 lỗi)
npm run lint

# Build bản đóng gói production
npm run build
```

---

## 📂 CẤU TRÚC THƯ MỤC CHUẨN

```text
Smart-travel-platform/
├── package.json               # Script chạy đồng thời client + server
├── .gitignore                 # Cấu hình bỏ qua file rác và node_modules
├── README.md                  # Hướng dẫn chi tiết dự án
├── BAO_CAO_DO_AN_CUOI_KY.md   # Tài liệu báo cáo đồ án nộp chấm điểm
│
├── server/                    # Phân hệ Backend API (Mô hình MVC)
│   ├── .env                   # Cấu hình PORT=5000, JWT_SECRET
│   ├── package.json
│   └── src/
│       ├── server.js          # Entry point server Express
│       ├── config/
│       │   ├── data.js        # Dữ liệu tour, voucher, user mẫu khởi tạo
│       │   └── migrate.js     # Script khởi tạo PostgreSQL schema (tùy chọn)
│       ├── controllers/
│       │   ├── authController.js     # Logic đăng ký, đăng nhập, đổi mật khẩu
│       │   ├── tourController.js     # CRUD tour, voucher, đánh giá review
│       │   ├── bookingController.js  # Tạo đơn, duyệt, hủy đơn
│       │   └── userController.js     # Quản lý danh sách tài khoản
│       ├── middlewares/
│       │   └── authMiddleware.js     # Xác thực JWT & phân quyền Admin
│       └── routes/
│           ├── authRoutes.js
│           ├── tourRoutes.js
│           ├── bookingRoutes.js
│           └── userRoutes.js
│
└── client/                    # Phân hệ Frontend Web (React + Vite)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx           # Entry point React DOM
        ├── App.jsx            # Định tuyến Router & bọc Contexts
        ├── index.css          # Tailwind CSS directives
        ├── mockTours.js       # Dữ liệu tour dự phòng khi offline
        ├── utils/
        │   └── format.js      # Hàm format tiền VND chuẩn
        ├── services/
        │   └── api.js         # Axios client gọi REST API
        ├── context/
        │   ├── AuthContext.jsx      # Quản lý phiên đăng nhập & phân quyền
        │   ├── ToastContext.jsx     # Hệ thống thông báo toast notification
        │   └── WishlistContext.jsx  # Quản lý danh sách yêu thích
        ├── components/
        │   ├── Navbar.jsx           # Header responsive + Drawer mobile
        │   ├── Footer.jsx           # Chân trang đầy đủ thông tin nhóm
        │   ├── TourCard.jsx         # Card hiển thị tour với rating, badge
        │   ├── SmartConcierge.jsx   # Trợ lý AI du lịch thông minh
        │   ├── AuthModal.jsx        # Modal Đăng nhập / Đăng ký
        │   └── ConfirmModal.jsx     # Modal xác nhận thao tác quan trọng
        └── pages/
            ├── HomePage.jsx             # Trang chủ (Hero, Điểm đến, Ưu đãi)
            ├── TourListingPage.jsx      # Danh sách & Bộ lọc đa tiêu chí
            ├── TourDetailPage.jsx       # Chi tiết tour, Timeline, Đặt vé + Voucher
            ├── WishlistPage.jsx         # Quản lý tour yêu thích
            ├── CustomerBookingsPage.jsx # Lịch sử giao dịch cá nhân
            ├── CustomerProfilePage.jsx  # Hồ sơ người dùng & Đổi mật khẩu
            ├── AdminDashboardPage.jsx   # Bảng điều khiển Quản trị viên
            └── NotFoundPage.jsx         # Trang 404 thân thiện
```

---
*© 2026 SmartTour Platform - Đồ án môn học Xây dựng Website Thực tế. Nhóm 5 SV.*
