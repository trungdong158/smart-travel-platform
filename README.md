# 🌌 SOULTRIP — NỀN TẢNG ĐẶT TOUR DU LỊCH & TRẢI NGHIỆM CẢM XÚC THÔNG MINH
### "Travel Where Your Soul Leads — Đi Đâu Theo Cảm Xúc, Trải Nghiệm Theo Cách Riêng Của Bạn"

> **Đồ án môn học:** Xây Dựng Website Thực Tế  
> **Thang điểm hướng đến:** Xuất Sắc (9.0 – 10.0)  
> **Hình thức:** Đồ án nhóm (5 sinh viên)  
> **Phiên bản:** SoulTrip v2.0 (Cập nhật 2026)

---

## 👥 THÀNH VIÊN NHÓM THỰC HIỆN

| STT | Họ và Tên | Mã Số Sinh Viên (MSSV) | Vai Trò & Phân Công Nhiệm Vụ |
| :---: | :--- | :---: | :--- |
| **1** | **Lê Phan Trung Đông** | **6651071016** | **Trưởng nhóm** - Thiết kế kiến trúc tổng thể, Backend RESTful API (MVC), Cơ chế bảo mật JWT, Phân quyền người dùng (RBAC), Middleware, Tối ưu hóa Database JSON Storage. |
| **2** | **Ngô Thuận Dương** | **6651071010** | **Thành viên** - Phân hệ Bảng điều khiển Quản trị viên (Admin Dashboard), Thống kê KPI doanh thu thời gian thực, Quản lý CRUD Tour du lịch, Quản trị Người dùng & Phân quyền. |
| **3** | **Trần Thanh Huy** | **6651071027** | **Thành viên** - Phân hệ Khách hàng (Customer), Quy trình Đặt chỗ (Booking Engine), Cổng thanh toán VietQR & MoMo mô phỏng, Vé điện tử E-Ticket với mã QR Code động, Lịch sử giao dịch (My Bookings). |
| **4** | **Đặng Quốc Vương** | **6651071096** | **Thành viên** - Phân hệ Khách vãng lai (Guest), Thiết kế UI/UX theo Design Tokens, Bộ lọc tìm kiếm thông minh tiếng Việt không dấu/có dấu, Trang chi tiết tour với Slider ảnh đa góc nhìn, Danh sách Yêu thích (Wishlist). |
| **5** | **Nguyễn Quốc Đạt** | **6651071014** | **Thành viên** - Tính năng Sáng tạo: Triết lý "Travel by Mood", Trợ lý AI du lịch (Smart Concierge), Màn hình khởi động Cinematic Loading Screen, Tối ưu hóa hiệu năng Google Lighthouse (Performance >= 90+). |

---

## 🌟 ĐIỂM SÁNG TẠO & CÔNG NGHỆ ĐỘT PHÁ CỦA SOULTRIP

### 1. 🌿 Triết lý "Travel by Mood" (Du lịch theo cảm xúc)
Khác biệt hoàn toàn với các website đặt tour truyền thống chỉ lọc theo địa lý, SoulTrip tiên phong đưa cảm xúc của du khách làm trọng tâm với 5 cung bậc:
* **🌿 Chữa Lành & Tĩnh Tại (Healing):** Tìm về sự an yên giữa núi rừng Tây Bắc (Sa Pa, Bản Cát Cát), không khí mộng mơ xứ ngàn hoa (Đà Lạt).
* **⚡ Bứt Phá & Phiêu Lưu (Adventure):** Chinh phục những cung đường đèo hùng vĩ (Hà Giang, Đèo Mã Pí Lèng) hay tiểu sa mạc rực nắng (Mũi Né).
* **🌅 Lãng Mạn & Hoài Niệm (Romance):** Khoảnh khắc hoàng hôn lộng lẫy (Phú Quốc Sunset Town) và nét cổ kính trầm mặc (Cố Đô Huế).
* **🌊 Tự Do & Khám Phá (Discovery):** Biển xanh cát trắng vịnh biển thiên đường (Hạ Long, Nha Trang, Quy Nhơn – Phú Yên).
* **💎 Sang Trọng & Đẳng Cấp (Luxury):** Trải nghiệm nghỉ dưỡng cao cấp chuẩn 5 sao.
* *Mỗi tour đều sở hữu câu trích dẫn tâm hồn (Storytelling Quote) chạm đến cảm xúc du khách.*

### 2. 🎫 Vé Điện Tử E-Ticket (Boarding Pass) & Quét Mã QR Code
* Sau khi hoàn tất đặt tour và thanh toán, hệ thống tự động xuất vé điện tử **E-Ticket chuẩn hàng không / du lịch quốc tế**.
* **Mã QR Code động (`QRCodeView`):** Tạo trực tiếp bằng thuật toán canvas không phụ thuộc API bên ngoài, du khách có thể dùng camera điện thoại quét để tra cứu thông tin đặt vé tức thì.
* **Hỗ trợ in vé (Print Ticket):** Định dạng chuẩn văn bản A4/PDF sẵn sàng in ấn mang theo chuyến đi.

### 3. 💳 Cổng Thanh Toán Đa Kênh Mô Phỏng (Payment Gateway)
* Tích hợp 2 phương thức thanh toán phổ biến nhất Việt Nam:
  * **VietQR:** Quét mã chuyển khoản ngân hàng tự động kèm số tài khoản, tên thụ hưởng và nội dung chuyển tiền.
  * **Ví điện tử MoMo:** Giao diện quét mã thanh toán 1 chạm.
* Xác nhận thanh toán trực tiếp, tự động cập nhật trạng thái đơn thành **ĐÃ DUYỆT (CONFIRMED)** ngay lập tức.

### 4. 🖼️ Slider Ảnh Đa Góc Nhìn & Bộ Sưu Tập 16 Tour Chuẩn Địa Danh
* Cả 16 tour du lịch đều được trang bị bộ đôi ảnh phân giải cao (16x2 = 32 ảnh) được kiểm duyệt nghiêm ngặt, gắn liền với biểu tượng danh thắng đặc trưng (Fansipan, Cầu Vàng Bà Nà, Gành Đá Đĩa, Tràng An, Cáp treo Vinpearl Nha Trang...).
* Hỗ trợ lướt ảnh mượt mà bằng phím bấm, nút điều hướng hoặc thanh ảnh thu nhỏ (thumbnail bar).

### 5. 🔍 Bộ Máy Tìm Kiếm Thông Minh (Smart Search Engine)
* Tự động chuẩn hóa chuỗi tiếng Việt (`removeVietnameseTones`): hỗ trợ tìm kiếm có dấu, không dấu, chữ hoa/thường, viết liền (ví dụ: `"Nha Trang"`, `"nha trang"`, `"nhatrang"`, `"da nang"`, `"sapa"` đều chỉ trả về chính xác tour tương ứng).
* Đối soát chính xác theo tên tour (`title`) và điểm đến (`destination_name`), không gây hiện tượng hiển thị dư thừa toàn bộ tour.

### 6. 🚀 Tối Ưu Hóa Hiệu Năng Vượt Trội (Google Lighthouse Performance >= 85 - 95+)
* **Route Code-Splitting (`React.lazy` & `Suspense`):** Tách nhỏ mã nguồn theo từng trang; trang chi tiết tour tải siêu nhẹ chỉ **34.5 KB (gzipped 8.7 KB)** thay vì nạp file nguyên khối 624 KB.
* **Ảnh đáp ứng (Responsive `srcSet`):** Tự động điều chỉnh kích thước ảnh tải về phù hợp với màn hình di động/máy tính, giảm 75% băng thông mạng.
* **Triệt tiêu Render-Blocking Fonts:** Tải font Google bất đồng bộ giúp First Contentful Paint đạt dưới 0.5s.
* **DNS Prefetch & Preconnect:** Khởi tạo kết nối sớm tới các CDN ảnh Unsplash và Wikimedia Commons.
* **Đạt chuẩn Accessibility 95+ & Best Practices 100:** Toàn bộ form có đầy đủ nhãn `htmlFor`, `id` và các nút bấm có `aria-label` minh bạch.

### 7. 🎬 Màn Hình Khởi Động Điện Ảnh (Cinematic Loading Screen)
* Thay thế hoàn toàn màn hình trắng đơn điệu bằng giao diện phát sáng huyền ảo mang logo SoulTrip, thanh tiến trình mượt mà, thông điệp truyền cảm hứng tự động đổi mới và các mood pills rực rỡ.

### 8. 📝 Cộng Đồng SoulTrip Blog & Cuộn Vô Hạn (Infinite Scroll) Chuẩn Facebook — Tính Năng Nâng Cao
* **Nút điều hướng Blog trên thanh Navigation:** Cho phép du khách dễ dàng truy cập chuyên mục chia sẻ trải nghiệm từ mọi trang (hỗ trợ cả Desktop & Mobile Menu).
* **Cơ chế Cuộn Vô Hạn (Infinite Scroll) chuẩn mạng xã hội (Facebook Feed):**
  * Ban đầu nạp 2 bài viết đầu tiên (Page 1, limit = 2).
  * Khi người dùng cuộn đến đáy trang, hệ thống tự động phát hiện bằng `IntersectionObserver` và nạp nối tiếp bài viết 3 và 4 (Page 2), tiếp tục đến bài 5 và 6...
  * **Tuyệt đối không xóa, không ẩn, không ghi đè** các bài viết đã nạp trước đó; cơ chế Deduplication lọc trùng lặp ID thông minh đảm bảo không có bài viết nào bị hiển thị 2 lần.
  * Khi đã duyệt hết toàn bộ kho bài viết, màn hình hiển thị biểu ngữ thông báo tinh tế: *"🎉 Bạn đã xem hết tất cả bài viết hôm nay!"*.
* **Tương tác đa chiều:**
  * Thả tim (Like) với phản hồi lạc quan tức thì (Optimistic UI).
  * Bình luận trực tiếp trong từng bài viết kèm avatar và thời gian đăng.
* **Gắn thẻ Tour liên quan (Tour Tagging):** Mỗi bài viết du lịch có thể liên kết trực tiếp với tour tương ứng kèm nút **"Xem & Đặt chuyến này"** dẫn sang trang chi tiết tour.
* **Đăng tải bài viết mới:** Người dùng có thể chia sẻ câu chuyện, chọn mood cảm xúc, gắn link tour và tải ảnh lên.
* **Mục "Bài Viết Của Tôi" trong Trang Cá Nhân (`/profile`):** Phân hệ quản lý riêng biệt cho phép thành viên theo dõi các bài viết đã đăng, kiểm tra số lượt thích, số bình luận, xem lại trên Blog hoặc xóa bài viết.

---

## 🎯 CÁC PHÂN HỆ NGƯỜI DÙNG & TÍNH NĂNG CHI TIẾT

### 1. Khách Vãng Lai (Guest)
* **Trang chủ (HomePage):** Banner Hero nghệ thuật theo tâm trạng, 5 nhóm cảm xúc Travel by Mood Showcase, Điểm đến thịnh hành 3 miền, Ưu đãi đặc quyền.
* **Khám phá Tour (TourListingPage):**
  * Tìm kiếm theo từ khóa thông minh (có dấu, không dấu).
  * Lọc theo vùng miền (Bắc, Trung, Nam), Thể loại tour, Khoảng giá ngân sách bằng thanh kéo slider, và Tâm trạng (Mood).
  * Sắp xếp linh hoạt: Giá tăng dần, Giá giảm dần, Đánh giá cao nhất.
* **Chi tiết tour (TourDetailPage):**
  * Slider ảnh đa góc nhìn kèm huy hiệu đếm ảnh và thanh thumbnail.
  * Câu trích dẫn cảm xúc nghệ thuật (Storytelling Quote).
  * Lịch trình chi tiết từng ngày (Interactive Day-by-Day Timeline).
  * Thông tin phương tiện di chuyển (Vé máy bay, Xe Limousine VIP).
  * Đánh giá & Bình luận sao tương tác.
* **Trợ lý AI Smart Concierge:** Hộp thoại Chatbot AI phân tích cảm xúc và nhu cầu tự nhiên, gợi ý hành trình tức thì.

### 2. Khách Hàng Thành Viên (Customer)
* **Xác thực an toàn:** Đăng ký, đăng nhập với mã hóa JWT Token và bcryptjs; hỗ trợ form **Quên mật khẩu** mô phỏng tiện lợi.
* **Đặt tour & Áp mã giảm giá:**
  * Kiểm tra số chỗ còn trống theo thời gian thực.
  * Tích hợp mã giảm giá thông minh (`SMART2026`, `SMARTWELCOME`) tự động chiết khấu.
  * Kiểm tra định dạng số điện thoại Việt Nam chuẩn xác trước khi đặt chỗ.
* **Thanh toán trực tuyến & Vé E-Ticket:** Trực tiếp chọn quét mã VietQR hoặc MoMo để nhận ngay vé máy bay/tour có mã QR Code.
* **Danh sách Yêu thích (Wishlist):** Thả tim lưu các tour yêu thích và đồng bộ trạng thái toàn hệ thống.
* **Quản lý Tour đã đặt (My Bookings):** Xem danh sách vé đã đặt, trạng thái đơn (**Chờ duyệt**, **Đã duyệt**, **Đã hủy**), chủ động hủy vé khi còn chờ duyệt, mở lại vé điện tử E-Ticket bất cứ lúc nào.
* **Hồ sơ cá nhân (Profile):** Cập nhật thông tin cá nhân, đổi ảnh đại diện (từ thiết bị / link / kho mẫu), đổi mật khẩu bảo mật.
* **Cộng đồng Blog & Quản lý bài viết:**
  * Chia sẻ trải nghiệm du lịch cá nhân, cảm xúc vui buồn, hình ảnh và gắn thẻ tour tương ứng.
  * Tương tác bình luận, thả tim bài viết trong cộng đồng.
  * Mục **"Bài viết của tôi"** trong trang cá nhân: Xem danh sách câu chuyện đã đăng, thống kê lượt xem/thích/bình luận, và quyền xóa bài viết.

### 3. Quản Trị Viên (Admin)
* **Bảng điều khiển (Admin Dashboard):**
  * Báo cáo KPI trực quan thời gian thực: Tổng doanh thu đã duyệt, Tổng số đơn đặt chỗ, Số tour đang mở bán, Tổng thành viên.
  * Phân quyền nghiêm ngặt chặn truy cập trái phép nếu không mang vai trò `ADMIN`.
* **Quản lý Đơn đặt tour (Bookings):**
  * Lọc theo trạng thái đơn: Tất cả / Chờ duyệt / Đã duyệt / Đã hủy.
  * Xem chi tiết thông tin khách hàng, số vé, tổng tiền, phương tiện, mã voucher.
  * **Duyệt đơn (CONFIRMED):** Tự động trừ số ghế khả dụng của tour.
  * **Hủy đơn (CANCELLED):** Tự động hoàn lại số ghế khả dụng cho tour.
* **Quản trị Tour du lịch (CRUD đầy đủ):** Thêm mới tour, Sửa thông tin, Xóa tour (có modal cảnh báo an toàn).
* **Quản trị Người dùng (User Management):** Xem danh sách thành viên, nâng quyền Admin / hạ quyền Customer, xóa tài khoản (chống tự xóa chính mình).

---

## ⚡ TÀI KHOẢN TRẢI NGHIỆM ĐỂ CHẤM ĐIỂM NHANH

Trong màn hình Đăng nhập, hệ thống đã tích hợp sẵn **nút click 1 chạm** để tự động điền nhanh tài khoản:

| Vai Trò | Email Đăng Nhập | Mật Khẩu | Quyền Hạn |
| :--- | :--- | :---: | :--- |
| 👑 **Quản Trị Viên (Admin)** | `admin@smarttour.vn` | `admin123` | Toàn quyền Bảng Quản Trị, Quản lý Tour, Duyệt đơn, Quản trị Thành viên |
| 👤 **Khách Hàng (Customer)** | `khachhang@gmail.com` | `123456` | Đặt tour, Thanh toán VietQR/MoMo, Nhận vé E-Ticket QR, Yêu thích, Hồ sơ |

---

## 🛠️ CÔNG NGHỆ & KIẾN TRÚC MÃ NGUỒN

### Frontend (Client)
* **Framework:** React 19 + Vite 8 (Khởi động siêu tốc, HMR tức thì).
* **Kiến trúc Hiệu năng:** Route Code-Splitting (`React.lazy` + `Suspense`), Dynamic Import, CSS Code Splitting.
* **Styling:** Tailwind CSS (Đạt chuẩn Design Tokens, hỗ trợ đầy đủ **Light Mode** & **Dark Mode**).
* **Định tuyến:** React Router DOM v7.
* **Icons:** Lucide React hiện đại.
* **Quản lý Trạng thái:** React Context API (`AuthContext`, `ToastContext`, `WishlistContext`, `ThemeContext`).
* **HTTP Client:** Axios (Tự động đính kèm Bearer Token JWT Interceptor).
* **Mã QR Code:** Canvas-based dynamic generation (Không phụ thuộc dịch vụ bên thứ ba).
* **Chất lượng code:** ESLint chuẩn React Hooks & Refresh (**0 lỗi, 0 cảnh báo**).

### Backend (Server)
* **Môi trường:** Node.js + Express 5.
* **Kiến trúc:** Mô hình MVC (Model/Storage - View/Response - Controller - Routes - Middlewares).
* **Bảo mật:** `bcryptjs` (mã hóa mật khẩu 10 salt rounds), `jsonwebtoken` (JWT xác thực phiên làm việc).
* **Lưu trữ dữ liệu:** Persistent JSON Storage (`server/storage/`) đảm bảo dữ liệu đơn hàng, tour và tài khoản không bị mất khi khởi động lại server.
* **CORS & Environment:** Cấu hình mở rộng hỗ trợ truy cập từ nhiều thiết bị trong mạng LAN.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY DỰ ÁN

### 1. Yêu cầu môi trường
* Đã cài đặt **Node.js** (khuyến nghị phiên bản v18, v20 hoặc mới hơn).
* Trình duyệt hiện đại: Google Chrome, Microsoft Edge, Mozilla Firefox hoặc Safari.

### 2. Khởi chạy phát triển (Chỉ với 1 lệnh duy nhất)
Tại thư mục gốc dự án `Smart-travel-platform`, mở terminal và chạy:

```bash
npm run dev
```

Lệnh trên sẽ đồng thời khởi động:
* **Backend API Server:** `http://localhost:5000`
* **Frontend Web Client:** `http://localhost:5173`

*(Hoặc chạy độc lập từng phân hệ: `npm run dev:server` và `npm run dev:client`)*

### 3. Kiểm tra chất lượng mã nguồn (Linting)
```bash
npm run lint
```
*(Kết quả kiểm tra đạt chuẩn 100% không có lỗi cú pháp).*

### 4. Đóng gói & Chạy bản Production Preview (Đo điểm Google Lighthouse >= 90+)
```bash
# Bước 1: Biên dịch và đóng gói tối ưu production
npm run build

# Bước 2: Khởi động máy chủ xem trước bản production
npm run preview
```
*Truy cập `http://localhost:5173`, mở tab Lighthouse trong DevTools và bấm **Analyze page load** để xem kết quả điểm số tối ưu xanh mượt mà!*

### 4. Triển khai lên Vercel

Triển khai frontend và Express API trong **một Vercel project** để API được gọi cùng domain:

1. Import repository vào Vercel và giữ **Root Directory** tại thư mục gốc repository.
2. Chọn Framework Preset **Other**. `vercel.json` cũng đặt `"framework": null` để ghi đè preset; cấu hình hiện tại dùng build Vite ở `client/` và API serverless từ `api/`, không dùng Vercel Services.
3. `vercel.json` đã cấu hình cài dependencies của `client` và `server`, build Vite, xuất `client/dist`, chạy API serverless từ thư mục `api/`, và chuyển các route frontend về `index.html`.
4. Trong Vercel project settings, thêm `JWT_SECRET` với giá trị bí mật dài, ngẫu nhiên và ổn định. Không dùng secret mặc định trong source code cho môi trường production.
5. Deploy lại; kiểm tra API tại `https://<domain-vercel>/api/health`.

Frontend luôn gọi `/api` trên cùng domain, nên không cần cấu hình `VITE_API_BASE_URL`. Khi chạy local, Vite proxy chuyển tiếp `/api` tới `http://localhost:5000`. Nếu project Vercel đang có biến `VITE_API_BASE_URL` từ cấu hình cũ, có thể xóa biến đó.

`server/storage/*.json` chỉ phù hợp chạy local, không phải nơi lưu bền vững cho Vercel Functions. Vercel có thể khởi chạy nhiều instance và thay instance bất kỳ lúc nào, nên đăng ký, booking và cập nhật JSON có thể không còn sau lần gọi khác. Trước khi dùng dữ liệu thật, cần chuyển phần lưu trữ backend sang cơ sở dữ liệu bền vững; `DATABASE_URL` hiện chưa được tích hợp vào các controller.

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
Smart-travel-platform/
├── package.json               # Script chạy đồng thời client + server, build, preview
├── .gitignore                 # Cấu hình bỏ qua node_modules và file tạm
├── README.md                  # Tài liệu hướng dẫn toàn diện dự án
├── BAO_CAO_DO_AN_CUOI_KY.md   # Báo cáo đồ án nộp chấm điểm môn học
│
├── server/                    # Phân hệ Backend API (Mô hình MVC)
│   ├── .env                   # Cấu hình PORT=5000, JWT_SECRET
│   ├── package.json
│   ├── storage/               # Cơ sở dữ liệu JSON lưu trữ bền vững
│   │   ├── tours.json         # Danh sách 16 tour du lịch chuẩn
│   │   ├── users.json         # Danh sách tài khoản người dùng
│   │   └── bookings.json      # Danh sách đơn đặt chỗ & vé điện tử
│   └── src/
│       ├── server.js          # Entry point server Express
│       ├── config/
│       │   ├── data.js        # Dữ liệu tour, voucher khởi tạo dự phòng
│       │   └── migrate.js     # Script migration schema
│       ├── controllers/
│       │   ├── authController.js     # Logic đăng ký, đăng nhập, đổi mật khẩu
│       │   ├── tourController.js     # CRUD tour, voucher, đánh giá, tìm kiếm
│       │   ├── bookingController.js  # Tạo đơn, duyệt đơn, hủy đơn, thanh toán
│       │   └── userController.js     # Quản lý danh sách thành viên & phân quyền
│       ├── middlewares/
│       │   └── authMiddleware.js     # Xác thực JWT & kiểm tra vai trò ADMIN
│       └── routes/
│           ├── authRoutes.js
│           ├── tourRoutes.js
│           ├── bookingRoutes.js
│           └── userRoutes.js
│
└── client/                    # Phân hệ Frontend Web (React 19 + Vite 8)
    ├── package.json
    ├── vite.config.js         # Cấu hình Vite, preview port, code-splitting
    ├── tailwind.config.js     # Cấu hình theme, màu sắc thương hiệu, font chữ
    ├── index.html             # Preconnect CDN, DNS prefetch, inline preloader
    ├── public/
    │   ├── soultrip-logo.png  # Logo nhận diện thương hiệu SoulTrip
    │   └── soultrip-logo.jpg
    └── src/
        ├── main.jsx           # Entry point React DOM
        ├── App.jsx            # Lazy loading routes, Suspense, Providers
        ├── index.css          # Tailwind directives, dark mode styling
        ├── mockTours.js       # Dữ liệu 16 tour đồng bộ offline
        ├── services/
        │   └── api.js         # Axios client gọi REST API backend
        ├── utils/
        │   ├── format.js      # Định dạng tiền tệ VNĐ, loại bỏ dấu tiếng Việt
        │   ├── moods.js       # Định nghĩa 5 nhóm cảm xúc Travel by Mood
        │   ├── qrCode.js      # Mã hóa định dạng vé E-Ticket thành QR Code
        │   └── validation.js  # Kiểm tra số điện thoại & định dạng dữ liệu
        ├── context/
        │   ├── AuthContext.jsx      # Quản lý phiên đăng nhập & phân quyền
        │   ├── ToastContext.jsx     # Hệ thống thông báo toast notification
        │   ├── WishlistContext.jsx  # Quản lý danh sách tour yêu thích
        │   └── ThemeContext.jsx     # Chuyển đổi giao diện Sáng / Tối (Dark Mode)
        ├── components/
        │   ├── Navbar.jsx           # Thanh điều hướng chuẩn responsive
        │   ├── Footer.jsx           # Chân trang đầy đủ thông tin nhóm sinh viên
        │   ├── TourCard.jsx         # Card hiển thị tour với slider ảnh & mood badge
        │   ├── LoadingScreen.jsx    # Màn hình tải trang nghệ thuật SoulTrip
        │   ├── SmartConcierge.jsx   # Trợ lý AI du lịch thông minh
        │   ├── AuthModal.jsx        # Modal Đăng nhập / Đăng ký / Quên mật khẩu
        │   ├── PaymentModal.jsx     # Cổng thanh toán VietQR & MoMo mô phỏng
        │   ├── ETicketModal.jsx     # Vé điện tử E-Ticket Boarding Pass in ấn
        │   ├── QRCodeView.jsx       # Component vẽ mã QR Code động
        │   ├── PasswordInput.jsx    # Input mật khẩu ẩn/hiện chuyên nghiệp
        │   ├── ConfirmModal.jsx     # Modal xác nhận thao tác quan trọng
        │   └── ScrollToTop.jsx      # Tự động cuộn lên đầu trang khi chuyển trang
        └── pages/
            ├── HomePage.jsx             # Trang chủ (Hero Mood, Showcase, Điểm đến)
            ├── TourListingPage.jsx      # Danh sách & Bộ lọc đa tiêu chí thông minh
            ├── TourDetailPage.jsx       # Chi tiết tour, Slider ảnh, Đặt vé + Voucher
            ├── WishlistPage.jsx         # Quản lý tour yêu thích cá nhân
            ├── CustomerBookingsPage.jsx # Lịch sử giao dịch & Mở lại vé E-Ticket
            ├── CustomerProfilePage.jsx  # Hồ sơ người dùng & Đổi mật khẩu
            ├── AdminDashboardPage.jsx   # Bảng điều khiển Quản trị viên
            └── NotFoundPage.jsx         # Trang 404 thân thiện
```

---

*© 2026 SoulTrip Platform — “Travel Where Your Soul Leads”. Đồ án môn học Xây dựng Website Thực tế. Nhóm 5 SV.*
