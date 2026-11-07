import { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, Copy, Check, Clock, QrCode, 
  Smartphone, Building2, ShieldCheck, ArrowRight, Loader2 
} from 'lucide-react';
import { formatVND } from '../utils/format';
import { useToast } from '../context/ToastContext';
import { bookingService } from '../services/api';
import QRCodeView from './QRCodeView';

export default function PaymentModal({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess
}) {
  const { showToast } = useToast();
  const [activeMethod, setActiveMethod] = useState('VIETQR'); // 'VIETQR' | 'MOMO'
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15:00 đếm ngược
  const [prevBookingId, setPrevBookingId] = useState(booking?.id);

  // Điều chỉnh state tức thì khi đổi đơn hàng mà không gây render cascade
  if (booking?.id !== prevBookingId) {
    setPrevBookingId(booking?.id);
    setTimeLeft(15 * 60);
    setIsProcessing(false);
    setCopiedField(null);
  }

  // Bộ đếm ngược 15 phút giữ chỗ
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  if (!isOpen || !booking) return null;

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  const bookingCode = booking.bookingCode || `ST-${String(booking.id).slice(-6)}`;
  const transferContent = `SMARTTOUR ${bookingCode}`;
  const amountNumber = Number(booking.totalPrice) || 0;

  // Cấu hình Ngân hàng MBBank (Napas 247)
  const bankInfo = {
    bankName: 'MBBank (Ngân hàng Quân Đội)',
    accountNumber: '6651071010',
    accountName: 'SMARTTOUR PLATFORM - UTC2'
  };

  // Cấu hình Ví MoMo
  const momoInfo = {
    phone: '0987654321',
    accountName: 'SMARTTOUR PLATFORM'
  };

  // URL VietQR chuẩn theo định dạng NAPAS 247
  const vietQrImageUrl = `https://img.vietqr.io/image/MB-${bankInfo.accountNumber}-compact2.png?amount=${amountNumber}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
  
  // Chuỗi mã hóa VietQR dự phòng offline
  const vietQrFallbackString = `2|99|${bankInfo.accountNumber}|${bankInfo.accountName}|MB|${amountNumber}|${transferContent}`;
  const momoQrString = `2|99|${momoInfo.phone}|${momoInfo.accountName}|momo@smarttour.vn|0|0|${amountNumber}|${transferContent}|transfer_p2p`;

  const copyToClipboard = (text, fieldName) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      showToast(`Đã sao chép ${fieldName}!`, 'success');
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      showToast('Không thể sao chép tự động!', 'error');
    }
  };

  // Xử lý xác nhận thanh toán mô phỏng
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      // Giả lập độ trễ xác thực đối soát ngân hàng trong 1.2s tạo trải nghiệm thực tế
      await new Promise((res) => setTimeout(res, 1200));

      const updated = await bookingService.confirmPayment(booking.id, {
        paymentMethod: activeMethod
      });

      showToast('Thanh toán thành công! Vé điện tử đã được xác nhận.', 'success');
      if (onPaymentSuccess) {
        onPaymentSuccess(updated);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi xác nhận thanh toán!', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-xl my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                Cổng Thanh Toán Trực Tuyến
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Thanh toán an toàn, tức thì qua mã QR chuẩn NAPAS / MoMo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thanh đếm ngược thời gian giữ chỗ */}
        <div className="px-5 py-2.5 bg-amber-500/10 dark:bg-amber-400/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>Thời gian giữ vé & ưu đãi còn lại:</span>
          </div>
          <span className="font-mono font-black text-sm text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700">
            {minutes}:{seconds}
          </span>
        </div>

        {/* Thân Modal */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Thông tin đơn tóm tắt */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Chuyến đi</div>
              <div className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{booking.tourTitle}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Khách hàng: <b className="text-slate-700 dark:text-slate-300">{booking.customerName}</b> ({booking.seats} vé)</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">Số tiền thanh toán</div>
              <div className="text-base sm:text-lg font-black text-orange-600 dark:text-orange-400">
                {formatVND(amountNumber)}
              </div>
            </div>
          </div>

          {/* Tab chọn hình thức thanh toán */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveMethod('VIETQR')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeMethod === 'VIETQR'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Chuyển khoản VietQR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMethod('MOMO')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                activeMethod === 'MOMO'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Ví điện tử MoMo</span>
            </button>
          </div>

          {/* Khối hiển thị mã QR & Chi tiết chuyển khoản */}
          <div className="flex flex-col sm:flex-row gap-5 items-center p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800">
            {/* Mã QR Code */}
            <div className="flex flex-col items-center shrink-0">
              <QRCodeView
                value={activeMethod === 'VIETQR' ? vietQrFallbackString : momoQrString}
                imageFallbackUrl={activeMethod === 'VIETQR' ? vietQrImageUrl : null}
                size={180}
                className="shadow-md"
                alt={activeMethod === 'VIETQR' ? 'VietQR Napas 247' : 'MoMo QR'}
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Mở app ngân hàng hoặc MoMo quét mã
              </span>
            </div>

            {/* Bảng chi tiết chuyển khoản có nút copy */}
            <div className="flex-1 w-full space-y-2.5 text-xs">
              {activeMethod === 'VIETQR' ? (
                <>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ngân hàng</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{bankInfo.bankName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Số tài khoản</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white text-sm">{bankInfo.accountNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankInfo.accountNumber, 'Số tài khoản')}
                      className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 font-semibold text-[11px] hover:bg-sky-100 flex items-center gap-1 transition"
                    >
                      {copiedField === 'Số tài khoản' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'Số tài khoản' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Chủ tài khoản</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{bankInfo.accountName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40">
                    <div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">Nội dung chuyển khoản (bắt buộc)</span>
                      <span className="font-mono font-black text-amber-900 dark:text-amber-200 text-sm tracking-wider">{transferContent}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferContent, 'Nội dung chuyển khoản')}
                      className="px-2 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 font-semibold text-[11px] hover:bg-amber-200 flex items-center gap-1 transition"
                    >
                      {copiedField === 'Nội dung chuyển khoản' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'Nội dung chuyển khoản' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Số điện thoại MoMo</span>
                      <span className="font-mono font-black text-pink-600 text-sm">{momoInfo.phone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(momoInfo.phone, 'Số MoMo')}
                      className="px-2 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/70 text-pink-600 dark:text-pink-400 font-semibold text-[11px] hover:bg-pink-100 flex items-center gap-1 transition"
                    >
                      {copiedField === 'Số MoMo' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'Số MoMo' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tên người nhận</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{momoInfo.accountName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40">
                    <div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">Lời nhắn MoMo (bắt buộc)</span>
                      <span className="font-mono font-black text-amber-900 dark:text-amber-200 text-sm tracking-wider">{transferContent}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferContent, 'Lời nhắn')}
                      className="px-2 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 font-semibold text-[11px] hover:bg-amber-200 flex items-center gap-1 transition"
                    >
                      {copiedField === 'Lời nhắn' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'Lời nhắn' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800 leading-relaxed">
            💡 <b>Hướng dẫn</b>: Sau khi chuyển khoản từ ứng dụng ngân hàng hoặc MoMo, hệ thống sẽ đối soát tự động. Bạn cũng có thể bấm nút <b>"Tôi đã chuyển khoản thành công"</b> bên dưới để xác nhận ngay lập tức và nhận <b>Vé Điện Tử E-Ticket</b>.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Thanh toán sau (Lưu đơn)
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirmPayment}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang đối soát giao dịch...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Tôi đã chuyển khoản thành công</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
