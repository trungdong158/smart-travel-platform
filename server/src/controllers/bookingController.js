const { bookings, tours, saveBookings, saveTours } = require('../config/data');

/**
 * Lấy danh sách đơn đặt chỗ
 * Nếu có query param ?email=... thì lọc theo email khách hàng
 * Hỗ trợ bộ lọc ?status=...
 */
const getAllBookings = (req, res) => {
  const { email, status } = req.query;
  let results = [...bookings];

  if (email) {
    results = results.filter((b) => b.email.toLowerCase() === email.trim().toLowerCase());
  }

  if (status) {
    results = results.filter((b) => b.status === status);
  }

  return res.json({ success: true, count: results.length, data: results });
};

/**
 * Tạo yêu cầu đặt tour mới (Customer / Guest)
 */
const createBooking = (req, res) => {
  const {
    tourId,
    tourTitle,
    customerName,
    phone,
    email,
    departureDate,
    seats,
    totalPrice,
    discountAmount,
    voucherCode,
    note
  } = req.body;

  if (!tourId || !customerName || !phone || !email || !seats) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ thông tin: Tour, Họ tên, Số điện thoại, Email và Số lượng khách!'
    });
  }

  // Kiểm tra nếu số điện thoại là chữ hoặc có chữ trong đó
  const cleanPhone = String(phone).trim();
  if (/[a-zA-ZÀ-ỹ]/.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập số điện thoại đúng định dạng.'
    });
  }

  const numSeats = Number(seats);
  const tour = tours.find((t) => t.id === Number(tourId));

  if (!tour) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tour được chọn!' });
  }

  if (tour.available_seats < numSeats) {
    return res.status(400).json({
      success: false,
      message: `Tour này hiện chỉ còn ${tour.available_seats} chỗ trống khả dụng!`
    });
  }

  // Tạm giữ chỗ bằng cách trừ số chỗ trống
  tour.available_seats -= numSeats;

  const bookingId = Date.now();
  const bookingCode = `ST-${String(bookingId).slice(-6)}`;

  const newBooking = {
    id: bookingId,
    bookingCode,
    userId: req.user?.id || null,
    tourId: tour.id,
    tourTitle: tourTitle || tour.title,
    customerName: customerName.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    departureDate: departureDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    departureLocation: tour.departure_location || 'Hà Nội',
    transportIncluded: tour.transport_included || 'Xe du lịch cao cấp',
    durationDays: tour.duration_days || 3,
    seats: numSeats,
    totalPrice: Number(totalPrice),
    discountAmount: Number(discountAmount) || 0,
    voucherCode: voucherCode || '',
    note: note ? note.trim() : '',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentMethod: 'VIETQR',
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  saveBookings();
  saveTours();

  return res.status(201).json({
    success: true,
    message: 'Đặt tour thành công! SoulTrip sẽ liên hệ xác nhận trong thời gian sớm nhất.',
    data: newBooking
  });
};

/**
 * Cập nhật trạng thái đơn đặt chỗ (Admin)
 * CONFIRMED hoặc CANCELLED
 */
const updateBookingStatus = (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  const booking = bookings.find((b) => b.id === id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt tour yêu cầu!' });
  }

  const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Trạng thái đơn không hợp lệ!' });
  }

  // Nếu hủy đơn mà trước đó chưa hủy -> Hoàn trả lại số ghế cho tour
  if (status === 'CANCELLED' && booking.status !== 'CANCELLED') {
    const tour = tours.find((t) => t.id === Number(booking.tourId));
    if (tour) {
      tour.available_seats += booking.seats;
    }
  }

  booking.status = status;
  saveBookings();
  saveTours();

  return res.json({
    success: true,
    message: `Đã cập nhật trạng thái đơn hàng sang: ${status === 'CONFIRMED' ? 'Đã duyệt' : status === 'CANCELLED' ? 'Đã hủy' : 'Chờ xử lý'}`,
    data: booking
  });
};

/**
 * Khách hàng tự hủy đơn khi đang Chờ duyệt (Customer)
 */
const cancelBookingByCustomer = (req, res) => {
  const id = Number(req.params.id);
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt tour!' });
  }

  if (booking.status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      message: 'Chỉ có thể hủy đơn khi đơn đang ở trạng thái Chờ xử lý!'
    });
  }

  // Hoàn trả chỗ trống
  const tour = tours.find((t) => t.id === Number(booking.tourId));
  if (tour) {
    tour.available_seats += booking.seats;
  }

  booking.status = 'CANCELLED';
  saveBookings();
  saveTours();

  return res.json({
    success: true,
    message: 'Hủy đơn đặt tour thành công!',
    data: booking
  });
};

/**
 * Khách hàng xác nhận thanh toán mô phỏng (VietQR / MoMo)
 * Chuyển trạng thái đơn sang CONFIRMED và lưu thời gian thanh toán
 */
const confirmPaymentByCustomer = (req, res) => {
  const id = Number(req.params.id);
  const { paymentMethod = 'VIETQR' } = req.body;
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt tour cần thanh toán!' });
  }

  booking.status = 'CONFIRMED';
  booking.paymentStatus = 'PAID';
  booking.paymentMethod = paymentMethod;
  booking.paidAt = new Date().toISOString();

  saveBookings();
  saveTours();

  return res.json({
    success: true,
    message: 'Thanh toán thành công! Vé điện tử E-Ticket của quý khách đã được xác nhận.',
    data: booking
  });
};

module.exports = {
  getAllBookings,
  createBooking,
  updateBookingStatus,
  cancelBookingByCustomer,
  confirmPaymentByCustomer
};
