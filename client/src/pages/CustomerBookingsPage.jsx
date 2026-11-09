import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Clock, ArrowRight, Ticket, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingService } from '../services/api';
import { formatVND } from '../utils/format';
import ConfirmModal from '../components/ConfirmModal';
import PaymentModal from '../components/PaymentModal';
import ETicketModal from '../components/ETicketModal';

export default function CustomerBookingsPage() {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(isAuthenticated && currentUser?.email));
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Modal Thanh toán & Vé điện tử E-Ticket
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const userEmail = currentUser?.email;

  useEffect(() => {
    let ignore = false;
    if (!isAuthenticated || !userEmail) {
      return;
    }

    bookingService
      .getAllBookings({ email: userEmail })
      .then((data) => {
        if (!ignore) {
          setBookings(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, userEmail]);

  const refreshUserBookings = async () => {
    if (!userEmail) return;
    try {
      const data = await bookingService.getAllBookings({ email: userEmail });
      setBookings(data);
    } catch {
      showToast('Không thể làm mới đơn đặt tour!', 'error');
    }
  };

  // Xác nhận hủy đơn
  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return;
    try {
      await bookingService.cancelBooking(selectedBookingId);
      try {
        localStorage.removeItem(`soultrip_hold_deadline_${selectedBookingId}`);
      } catch {
        // ignore
      }
      showToast('Hủy đơn đặt tour thành công!', 'success');
      setCancelModalOpen(false);
      setSelectedBookingId(null);
      refreshUserBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể hủy đơn hàng này!', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 mx-auto flex items-center justify-center">
          <CalendarClock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Yêu Cầu Đăng Nhập</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Vui lòng đăng nhập vào tài khoản thành viên để theo dõi lịch sử đặt tour và quản lý giao dịch của bạn.
        </p>
        <button
          onClick={openAuthModal}
          className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          Đăng Nhập Ngay
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Quản Lý Giao Dịch Cá Nhân
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Lịch Sử Đặt Tour Của Tôi</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi trạng thái duyệt đơn, ngày khởi hành và tổng thanh toán
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl shadow-sm">
          Tổng đơn đã đặt: <b className="text-sky-600 dark:text-sky-400 font-extrabold">{bookings.length}</b>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">
          Đang tải dữ liệu đơn đặt tour...
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 sm:p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
            <CalendarClock className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Bạn chưa có đơn đặt tour nào</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Khám phá những vùng đất mới và đặt tour ngay hôm nay để nhận ưu đãi đặc biệt từ SoulTrip.
          </p>
          <div className="pt-2">
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              <span>Xem Danh Sách Tour</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-500 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              {/* Thông tin đơn */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                    BK-{b.id.toString().slice(-6)}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Đặt ngày: {b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : b.status === 'CANCELLED'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {b.status === 'CONFIRMED'
                      ? '✓ Đã duyệt'
                      : b.status === 'CANCELLED'
                      ? '✗ Đã hủy'
                      : '⏳ Đang chờ xác nhận'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {b.tourTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    Khởi hành: <b>{b.departureDate || 'Theo lịch'}</b>
                  </span>
                  <span>Số lượng: <b>{b.seats} vé</b></span>
                  {b.voucherCode && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Mã ưu đãi: {b.voucherCode}
                    </span>
                  )}
                  {b.note && (
                    <span className="text-slate-400 dark:text-slate-500 italic">
                      Ghi chú: "{b.note}"
                    </span>
                  )}
                </div>
              </div>

              {/* Cột giá tiền & Nút thao tác */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 gap-2.5">
                <div className="text-left sm:text-right">
                  {b.status === 'CANCELLED' ? (
                    <>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Giá trị đơn:</span>
                      <div className="text-base font-bold text-slate-400 dark:text-slate-500 line-through font-mono">
                        {formatVND(b.totalPrice)}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Tổng thanh toán:</span>
                      <div className="text-lg font-black text-orange-600 dark:text-orange-400 font-mono">
                        {formatVND(b.totalPrice)}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 justify-end">
                  {/* Nút Xem Vé Điện Tử Boarding Pass có QR Code - CHỈ HIỂN THỊ KHI ĐƠN ĐÃ DUYỆT (CONFIRMED) */}
                  {b.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBookingForTicket(b);
                        setIsTicketModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition flex items-center gap-1 active:scale-95"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Vé Điện Tử</span>
                    </button>
                  )}

                  {/* Nút Thanh toán VietQR / MoMo nếu đơn đang PENDING */}
                  {b.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBookingForPayment(b);
                          setIsPaymentModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 rounded-xl shadow-xs transition flex items-center gap-1 active:scale-95"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Thanh Toán QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBookingId(b.id);
                          setCancelModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200 dark:border-rose-900 transition"
                      >
                        Hủy
                      </button>
                    </>
                  )}

                  {/* Khi đơn đã bị hủy: không hiện nút thanh toán hay vé, chỉ hiện ghi chú trạng thái */}
                  {b.status === 'CANCELLED' && (
                    <span className="text-[11px] font-medium text-rose-500/90 dark:text-rose-400/90 italic px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
                      {b.cancelReason === 'EXPIRED_HOLD' ? 'Đơn đã hủy • Hết thời gian giữ vé' : 'Đơn đã hủy • Không có vé'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal xác nhận hủy */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        title="Xác nhận hủy đơn đặt tour?"
        message="Hành động này sẽ hủy yêu cầu giữ chỗ của bạn và hoàn trả lại số ghế khả dụng cho tour."
        confirmText="Đồng ý hủy"
        cancelText="Đóng"
        isDanger={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedBookingId(null);
        }}
      />

      {/* Cổng Thanh toán VietQR / MoMo mô phỏng */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        booking={selectedBookingForPayment}
        onPaymentSuccess={(updatedBooking) => {
          refreshUserBookings();
          setIsPaymentModalOpen(false);
          setSelectedBookingForTicket(updatedBooking);
          setIsTicketModalOpen(true);
        }}
      />

      {/* Vé Điện Tử E-Ticket / Boarding Pass có QR Code */}
      <ETicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={selectedBookingForTicket}
      />
    </div>
  );
}
