import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Printer, Sparkles, CheckCircle2, 
  MapPin, Calendar, Plane, Bus, Users, ShieldCheck 
} from 'lucide-react';
import { formatVND } from '../utils/format';
import QRCodeView from './QRCodeView';
import { formatTicketQRData } from '../utils/qrCode';

export default function ETicketModal({
  isOpen,
  onClose,
  booking,
  tour = null
}) {
  const ticketRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add('ticket-modal-open');
    return () => {
      document.body.classList.remove('ticket-modal-open');
    };
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const bookingCode = booking.bookingCode || `ST-${String(booking.id).slice(-6)}`;
  const qrVerificationText = formatTicketQRData(booking, tour);

  const cleanDeparture = booking.departureLocation || tour?.departure_location || 'TP.HCM / Hà Nội';
  const cleanTransport = booking.transportIncluded || tour?.transport_included || 'Xe Limousine cao cấp';
  const duration = booking.durationDays || tour?.duration_days || 3;

  const isFlight = (cleanTransport || '').toLowerCase().includes('máy bay') || booking.transport_type === 'FLIGHT' || tour?.transport_type === 'FLIGHT';

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div 
      id="ticket-print-portal"
      className="ticket-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div 
        className="ticket-dialog relative w-full max-w-4xl my-auto bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-300 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar (Ẩn khi in ấn) */}
        <div className="print:hidden p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Vé Du Lịch Điện Tử • Boarding Pass
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mã QR có thể quét trực tiếp bằng camera điện thoại để xác thực tức thì
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In vé / Lưu PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= KHỐI VÉ ĐIỆN TỬ BOARDING PASS CHÍNH ================= */}
        <div className="ticket-scroll-area p-3 sm:p-6 overflow-y-auto max-h-[80vh] flex items-center justify-center">
          <div 
            id="printable-ticket" 
            ref={ticketRef}
            className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row relative print:shadow-none print:m-0"
          >
            {/* PHẦN CHÍNH THÂN VÉ (MAIN TICKET - 70%) */}
            <div className="ticket-main-body flex-1 p-5 sm:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-slate-300 relative">
              {/* Header Thân Vé */}
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <img 
                        src="/soultrip-logo.png" 
                        alt="SoulTrip" 
                        className="w-7 h-7 rounded-lg object-cover" 
                      />
                      <span className="font-serif font-black text-lg tracking-tight text-slate-950">
                        SoulTrip Platform
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        BOARDING PASS
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 tracking-wider block mt-0.5 font-medium italic">
                      “ TRAVEL WHERE YOUR SOUL LEADS “
                    </span>
                  </div>

                  <div className="text-right">
                    {booking.status === 'CANCELLED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700 border border-rose-300">
                        <X className="w-3.5 h-3.5 text-rose-600" />
                        <span>ĐÃ HỦY VÉ</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{booking.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : 'CHỜ THANH TOÁN'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Banner cảnh báo nếu vé bị hủy */}
                {booking.status === 'CANCELLED' && (
                  <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs font-bold text-rose-700 flex items-center justify-center gap-2">
                    <span>⚠️ VÉ NÀY ĐÃ BỊ HỦY TRÊN HỆ THỐNG • KHÔNG CÒN HIỆU LỰC KHỞI HÀNH</span>
                  </div>
                )}

                {/* Tiêu đề Tour */}
                <div className="mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Hành trình trải nghiệm
                  </span>
                  <h4 className="font-serif font-bold text-base sm:text-lg text-slate-900 leading-snug line-clamp-2">
                    {booking.tourTitle || tour?.title}
                  </h4>
                </div>

                {/* Lưới thông tin hành khách & chuyến đi */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-3 text-xs mb-5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hành khách / Passenger</span>
                    <span className="font-bold text-slate-900 text-sm truncate block">{booking.customerName}</span>
                    <span className="text-[11px] text-slate-500 block">{booking.phone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mã đặt chỗ / PNR Code</span>
                    <span className="font-mono font-black text-sky-700 text-sm tracking-wider block">{bookingCode}</span>
                    <span className="text-[10px] text-slate-400">SoulTrip UTC2</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ngày khởi hành / Date</span>
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span>{booking.departureDate}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">{duration} Ngày {duration - 1} Đêm</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Khởi hành từ / Departure</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                      <span>{cleanDeparture}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phương tiện / Transport</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 truncate">
                      {isFlight ? <Plane className="w-3 h-3 text-indigo-600 shrink-0" /> : <Bus className="w-3 h-3 text-emerald-600 shrink-0" />}
                      <span className="truncate">{cleanTransport}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Số lượng vé / Seats</span>
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-600" />
                      <span>0{booking.seats} Vé VIP</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Chân Thân Vé (Mã vạch giả lập + Ghi chú) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[10px] text-slate-400 leading-tight max-w-sm">
                  🛡️ <i>Vui lòng có mặt tại điểm đón trước 30 phút. Xuất trình mã QR trên vé này cho trưởng đoàn khi lên xe/máy bay.</i>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Tổng thanh toán</span>
                  <span className="font-black text-orange-600 text-sm sm:text-base">
                    {formatVND(booking.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* PHẦN CUỐNG VÉ XÉ RỜI (TEAR-OFF STUB - 30%) */}
            <div className="ticket-stub w-full md:w-64 p-5 sm:p-6 bg-slate-50 flex flex-col items-center justify-between text-center relative">
              {/* Hai rãnh xé vé phong cách vé máy bay (Notch Cutouts) */}
              <div className="ticket-notch hidden md:block absolute -left-3 -top-3 w-6 h-6 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-300 dark:border-slate-800"></div>
              <div className="ticket-notch hidden md:block absolute -left-3 -bottom-3 w-6 h-6 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-300 dark:border-slate-800"></div>

              {/* Cuống vé Header */}
              <div className="w-full text-center pb-2 border-b border-slate-200">
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">
                  PASSENGER COUPON
                </span>
                <span className="font-mono font-black text-xs text-sky-800">
                  {bookingCode}
                </span>
              </div>

              {/* Mã QR Thật để quét */}
              <div className="my-3 flex flex-col items-center">
                <QRCodeView
                  value={qrVerificationText}
                  size={156}
                  className="shadow-sm border-slate-300"
                  alt={`QR ${bookingCode}`}
                />
                <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  <ShieldCheck className={`w-3 h-3 ${booking.status === 'CANCELLED' ? 'text-rose-500' : 'text-emerald-600'}`} />
                  <span>{booking.status === 'CANCELLED' ? 'Vé đã bị hủy' : 'Quét mã xác thực vé'}</span>
                </span>
              </div>

              {/* Thông tin vắn tắt cuống vé */}
              <div className="w-full text-left bg-white p-2.5 rounded-xl border border-slate-200 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Khách:</span>
                  <b className="text-slate-800 truncate max-w-[100px]">{booking.customerName}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày đi:</span>
                  <b className="text-slate-800">{booking.departureDate}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số vé:</span>
                  <b className="text-slate-800">0{booking.seats} Khách</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar (Ẩn khi in ấn) */}
        <div className="print:hidden p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 SoulTrip Platform • Vé điện tử hợp lệ theo quy chuẩn du lịch Việt Nam
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            Đóng vé
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
