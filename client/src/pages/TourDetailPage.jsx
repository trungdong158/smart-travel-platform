import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Clock, ShieldCheck, CheckCircle2, Star, Users, 
  Calendar, Tag, ChevronRight, ChevronLeft, MessageSquare, Send,
  Plane, Bus, Navigation, Quote, Camera
} from 'lucide-react';
import { formatVND } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { tourService, bookingService } from '../services/api';
import { getMoodById } from '../utils/moods';
import { validatePhoneNumber } from '../utils/validation';

// Lazy-load các modal thanh toán & vé điện tử để tối ưu 100% tốc độ tải trang ban đầu
const PaymentModal = lazy(() => import('../components/PaymentModal'));
const ETicketModal = lazy(() => import('../components/ETicketModal'));

// Helper tối ưu kích thước ảnh Unsplash theo màn hình
const getOptimizedImgUrl = (url, width = 1000, quality = 75) => {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`;
  }
  return url;
};

export default function TourDetailPage({ tours = [], onBookingCreated }) {
  const { id } = useParams();
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const tourId = Number(id);
  const currentTour = tours.find((t) => t.id === tourId) || tours[0];
  const mood = getMoodById(currentTour?.mood_id);

  // Slider hình ảnh của chuyến đi (2 -> 3 ảnh)
  const galleryImages = (currentTour?.gallery && Array.isArray(currentTour.gallery) && currentTour.gallery.length > 0)
    ? currentTour.gallery
    : [currentTour?.featured_image || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80'];

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [prevTourId, setPrevTourId] = useState(tourId);

  // Reset về ảnh đầu tiên khi chuyển tour mà không gây cascading render
  if (prevTourId !== tourId) {
    setPrevTourId(tourId);
    setActiveImgIndex(0);
  }

  const handlePrevImg = () => {
    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImg = () => {
    setActiveImgIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  // Luôn tự động cuộn lên đầu trang khi vào trang chi tiết tour
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [tourId]);

  // State đặt tour
  const [seats, setSeats] = useState(1);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [customerName, setCustomerName] = useState(() => currentUser?.fullName || '');
  const [phone, setPhone] = useState(() => currentUser?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [email, setEmail] = useState(() => currentUser?.email || '');
  const [note, setNote] = useState('');

  // Kiểm tra số điện thoại khi người dùng nhập xong và chuyển sang ô khác (blur)
  const handlePhoneBlur = () => {
    if (phone && phone.trim()) {
      const res = validatePhoneNumber(phone, true);
      if (!res.isValid) {
        setPhoneError('Vui lòng nhập số điện thoại đúng định dạng.');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  // Booking submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookedSuccess, setIsBookedSuccess] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [localReviews, setLocalReviews] = useState([]);

  if (!currentTour) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin tour</h2>
        <Link to="/tours" className="inline-block mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold">
          Quay lại danh sách tour
        </Link>
      </div>
    );
  }

  const allReviews = [...localReviews, ...(currentTour.reviews || [])];

  // Tính toán chi phí
  const rawTotal = currentTour.base_price * seats;
  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const finalTotal = Math.max(0, rawTotal - discountAmount);

  // Xử lý áp dụng voucher
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherError('');
    setIsCheckingVoucher(true);

    try {
      const res = await tourService.checkVoucher(voucherCode.trim(), rawTotal);
      setAppliedVoucher(res.voucher);
      showToast(res.message, 'success');
    } catch (err) {
      setAppliedVoucher(null);
      setVoucherError(err.response?.data?.message || 'Mã giảm giá không hợp lệ!');
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  // Xử lý submit đặt tour
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Bắt buộc đăng ký / đăng nhập tài khoản trước khi đặt tour
    if (!isAuthenticated) {
      showToast('Vui lòng đăng ký/đăng nhập tài khoản.', 'error');
      openAuthModal();
      return;
    }

    // Kiểm tra định dạng số điện thoại
    const phoneValidation = validatePhoneNumber(phone, true);
    if (!phoneValidation.isValid) {
      setPhoneError('Vui lòng nhập số điện thoại đúng định dạng.');
      showToast('Vui lòng nhập số điện thoại đúng định dạng.', 'error');
      return;
    }

    if (currentTour.available_seats < seats) {
      showToast(`Rất tiếc, tour chỉ còn ${currentTour.available_seats} chỗ trống!`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingPayload = {
        tourId: currentTour.id,
        tourTitle: currentTour.title,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        departureDate,
        seats,
        totalPrice: finalTotal,
        discountAmount,
        voucherCode: appliedVoucher ? appliedVoucher.code : '',
        note: note.trim()
      };

      const res = await bookingService.createBooking(bookingPayload);
      const createdBooking = res.data || res;
      setActiveBooking(createdBooking);
      setIsBookedSuccess(true);
      showToast(res.message || 'Đặt chỗ thành công! Chuyển tới cổng thanh toán...', 'success');
      
      if (onBookingCreated) {
        onBookingCreated();
      }

      // Tự động mở cổng thanh toán VietQR / MoMo ngay
      setIsPaymentModalOpen(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi đặt chỗ, vui lòng thử lại!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Callback khi thanh toán thành công trong PaymentModal
  const handlePaymentSuccess = (updatedBooking) => {
    setActiveBooking(updatedBooking);
    setIsPaymentModalOpen(false);
    setIsTicketModalOpen(true);
    if (onBookingCreated) {
      onBookingCreated();
    }
  };

  // Xử lý gửi review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await tourService.addReview(currentTour.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        userName: currentUser?.fullName || customerName || 'Du khách',
        avatar: currentUser?.avatar || ''
      });

      setLocalReviews((prev) => [
        {
          id: Date.now(),
          userName: currentUser?.fullName || customerName || 'Du khách',
          avatar: currentUser?.avatar || '',
          rating: reviewRating,
          comment: reviewComment.trim(),
          date: new Date().toLocaleDateString('vi-VN')
        },
        ...prev
      ]);

      setReviewComment('');
      showToast('Cảm ơn bạn đã gửi đánh giá trải nghiệm!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể gửi đánh giá!', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 lg:pb-12 space-y-8">
      
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-sky-600 dark:hover:text-sky-400">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/tours" className="hover:text-sky-600 dark:hover:text-sky-400">Tour Du Lịch</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold truncate max-w-xs sm:max-w-md">{currentTour.title}</span>
      </nav>

      {/* 2. TIÊU ĐỀ TOUR & THÔNG SỐ CHÍNH */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {mood && (
            <span className="px-3.5 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-full flex items-center gap-1.5 shadow-sm">
              <span>{mood.emoji}</span>
              <span>{mood.name}</span>
            </span>
          )}
          <span className="px-3 py-1 bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold text-xs rounded-full">
            {currentTour.category_name}
          </span>
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-full">
            Miền {currentTour.region}
          </span>
          {currentTour.departure_location && (
            <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-200 dark:border-emerald-800">
              <Navigation className="w-3.5 h-3.5" />
              <span>Khởi hành: {currentTour.departure_location}</span>
            </span>
          )}
          {currentTour.transport_included && (
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
              currentTour.transport_type === 'FLIGHT'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}>
              {currentTour.transport_type === 'FLIGHT' ? <Plane className="w-3.5 h-3.5" /> : <Bus className="w-3.5 h-3.5" />}
              <span>{currentTour.transport_included.replace(/^Đã bao gồm\s*:?\s*/i, '')}</span>
            </span>
          )}
          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{currentTour.rating || 5.0}</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">({allReviews.length || currentTour.review_count || 1} đánh giá)</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 dark:text-white leading-tight">
          {currentTour.title}
        </h1>

        {/* Câu trích dẫn cảm xúc nghệ thuật (Storytelling Quote) */}
        {currentTour.emotional_quote && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-l-4 border-amber-500 flex items-center gap-3 shadow-xs">
            <Quote className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs sm:text-sm font-serif italic text-slate-800 dark:text-slate-200">
              “{currentTour.emotional_quote}”
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            {currentTour.destination_name}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            {currentTour.duration_days} ngày {currentTour.duration_days - 1} đêm
          </span>
          <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <Users className="w-4 h-4" />
            Còn {currentTour.available_seats} chỗ trống
          </span>
        </div>
      </div>

      {/* 3. NỘI DUNG CHÍNH (2 CỘT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* CỘT TRÁI: ẢNH + LỊCH TRÌNH + TIỆN ÍCH + REVIEWS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Slider hình ảnh của chuyến đi (2 -> 3 ảnh với nút lướt qua lại) */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 group select-none">
              {/* Ảnh đang hiển thị */}
              <img
                key={activeImgIndex}
                src={getOptimizedImgUrl(galleryImages[activeImgIndex], 1000, 75)}
                srcSet={
                  galleryImages[activeImgIndex]?.includes('images.unsplash.com')
                    ? `${getOptimizedImgUrl(galleryImages[activeImgIndex], 600, 70)} 600w, ${getOptimizedImgUrl(galleryImages[activeImgIndex], 1000, 75)} 1000w`
                    : undefined
                }
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 700px, 900px"
                alt={`${currentTour.title} - Ảnh ${activeImgIndex + 1}`}
                width="1200"
                height="675"
                loading={activeImgIndex === 0 ? "eager" : "lazy"}
                fetchPriority={activeImgIndex === 0 ? "high" : "auto"}
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  const fallback = galleryImages.find((img) => img && img !== e.currentTarget.src) || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80';
                  e.currentTarget.src = fallback;
                }}
                className="w-full h-full object-cover transition-all duration-500"
              />

              {/* Lớp phủ gradient nhẹ */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/15 pointer-events-none"></div>

              {/* Nút mũi tên Trái & Phải để lướt qua lại giữa các ảnh */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImg}
                    aria-label="Lướt sang ảnh trước"
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 active:scale-95 transition-all z-10"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextImg}
                    aria-label="Lướt sang ảnh tiếp theo"
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 active:scale-95 transition-all z-10"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              {/* Huy hiệu đếm ảnh: ví dụ 1 / 3 */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-slate-950/70 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20 shadow-sm flex items-center gap-1.5 z-10">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeImgIndex + 1} / {galleryImages.length}</span>
              </div>

              {/* Chấm chỉ báo số trang ảnh (Dots) */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-10">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImgIndex(idx)}
                      aria-label={`Chuyển đến ảnh ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === activeImgIndex 
                          ? 'w-7 bg-amber-400 shadow-md shadow-amber-400/50' 
                          : 'w-2 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Hàng ảnh thu nhỏ (Thumbnails) bấm để chuyển nhanh */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIndex(idx)}
                    aria-label={`Xem ảnh thu nhỏ ${idx + 1}`}
                    className={`relative aspect-[16/10] rounded-2xl overflow-hidden border-2 transition-all ${
                      idx === activeImgIndex
                        ? 'border-amber-500 ring-2 ring-amber-500/40 scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100 hover:scale-[1.01]'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      width="200"
                      height="125"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        const fallback = galleryImages.find((img) => img && img !== e.currentTarget.src) || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80';
                        e.currentTarget.src = fallback;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Điểm nổi bật (Highlights) */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Điểm Nổi Bật Của Chuyến Đi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentTour.itinerary_summary}
            </p>

            {currentTour.highlights && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentTour.highlights.map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-sky-50/60 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-medium">{hl}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lịch trình chi tiết (Day-by-Day Timeline) */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Lịch Trình Chi Tiết Từng Ngày
            </h2>

            <div className="relative border-l-2 border-sky-200 dark:border-sky-800 ml-4 space-y-6">
              {(currentTour.itinerary_details || []).map((step, idx) => (
                <div key={idx} className="relative pl-6">
                  {/* Chấm tròn mốc ngày */}
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shadow-md">
                    {step.day || idx + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      Ngày {step.day || idx + 1}: {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dịch vụ bao gồm & không bao gồm */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Chính Sách Dịch Vụ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  ✓ Dịch vụ bao gồm:
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-500 dark:text-slate-400">
                  {currentTour.transport_included && (
                    <li className="font-bold text-emerald-800 dark:text-emerald-300">
                      Đã bao gồm {currentTour.transport_included.replace(/^Đã bao gồm\s*:?\s*/i, '')}.
                    </li>
                  )}
                  <li>Xe du lịch chất lượng cao đưa đón tham quan suốt tuyến.</li>
                  <li>Khách sạn / Resort tiện nghi tiêu chuẩn 3-5 sao (2 khách/phòng).</li>
                  <li>Vé tham quan toàn bộ các danh lam thắng cảnh theo lịch trình.</li>
                  <li>Bảo hiểm du lịch nội địa trọn gói tối đa 50.000.000đ/vụ.</li>
                  <li>Nước suối tinh khiết và khăn lạnh phục vụ trên xe mỗi ngày.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                  ✗ Không bao gồm:
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-500 dark:text-slate-400">
                  <li>Chi phí cá nhân ngoài chương trình: giặt ủi, đồ uống minibar.</li>
                  {currentTour.transport_type !== 'FLIGHT' && (
                    <li>Vé máy bay (tour đã bao gồm xe Limousine đưa đón từ điểm hẹn).</li>
                  )}
                  <li>Tiền bồi dưỡng (tip) tùy tâm cho hướng dẫn viên và tài xế.</li>
                  <li>Thuế VAT 8% theo quy định nhà nước.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Đánh giá & Bình luận của du khách */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Đánh Giá Từ Khách Hàng ({allReviews.length})
              </h2>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{currentTour.rating || 5.0} / 5.0</span>
              </div>
            </div>

            {/* Form gửi đánh giá */}
            <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">Chia sẻ trải nghiệm của bạn về tour này</h3>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Đánh giá số sao:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-0.5 text-amber-400 hover:scale-125 transition"
                    >
                      <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows="2"
                  required
                  placeholder="Viết nhận xét của bạn về cảnh đẹp, hướng dẫn viên, chất lượng bữa ăn..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview || !reviewComment.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
              </div>
            </form>

            {/* Danh sách bình luận */}
            <div className="space-y-4">
              {allReviews.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Chưa có bình luận nào cho tour này.</p>
              ) : (
                allReviews.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {rev.avatar ? (
                          <img
                            src={rev.avatar}
                            alt={rev.userName}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextSibling) {
                                e.currentTarget.nextSibling.style.display = 'flex';
                              }
                            }}
                            className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-sky-500/30"
                          />
                        ) : null}
                        <div
                          style={{ display: rev.avatar ? 'none' : 'flex' }}
                          className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-[10px] items-center justify-center shrink-0"
                        >
                          {rev.userName?.charAt(0) || 'D'}
                        </div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{rev.userName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{rev.date || 'Gần đây'}</span>
                    </div>

                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* CỘT PHẢI: FORM ĐẶT TOUR THÔNG MINH (STICKY CARD) */}
        <div id="booking-section" className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
            
            {/* Header Giá & Tình trạng chỗ & Phương tiện */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2.5">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Giá tour trọn gói:</span>
                <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
                  {formatVND(currentTour.base_price)}
                  <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">/ khách</span>
                </div>
              </div>

              {/* Thông tin khởi hành & Phương tiện */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                {currentTour.departure_location && (
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                    <Navigation className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Khởi hành từ: <b className="text-sky-600 dark:text-sky-400">{currentTour.departure_location}</b></span>
                  </div>
                )}
                {currentTour.transport_included && (
                  <div className={`flex items-start gap-1.5 font-bold ${
                    currentTour.transport_type === 'FLIGHT' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {currentTour.transport_type === 'FLIGHT' ? (
                      <Plane className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    ) : (
                      <Bus className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    )}
                    <span>Đã bao gồm: {currentTour.transport_included.replace(/^Đã bao gồm\s*:?\s*/i, '')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Còn {currentTour.available_seats} chỗ trống khả dụng</span>
              </div>
            </div>

            {/* Trạng thái đã đặt thành công */}
            {isBookedSuccess ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl text-center space-y-3.5 animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Đặt Chỗ Thành Công!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Đơn đặt tour <b>{activeBooking?.bookingCode || `ST-${String(activeBooking?.id || '').slice(-6)}`}</b> đã được ghi nhận. Quý khách có thể xem và in <b>Vé Điện Tử (Boarding Pass)</b> ngay bên dưới.
                </p>
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(true)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>🎫 Xem Vé Điện Tử / In Vé (Boarding Pass)</span>
                  </button>

                  {activeBooking?.status !== 'CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span>💳 Thanh Toán VietQR / MoMo</span>
                    </button>
                  )}

                  <Link
                    to="/my-bookings"
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
                  >
                    Quản Lý Danh Sách Đặt Chỗ
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsBookedSuccess(false)}
                    className="text-xs text-slate-500 hover:underline pt-1"
                  >
                    Đặt thêm tour khác
                  </button>
                </div>
              </div>
            ) : (
              /* Form đặt tour */
              <form key={currentUser?.id || 'guest'} onSubmit={handleBookingSubmit} className="space-y-4">
                
                {/* Yêu cầu đăng nhập tài khoản để đặt tour */}
                {!isAuthenticated && (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                      <span>Vui lòng đăng ký/đăng nhập tài khoản để đặt tour.</span>
                    </div>
                    <button
                      type="button"
                      onClick={openAuthModal}
                      className="font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl transition shrink-0 shadow-xs"
                    >
                      Đăng nhập / Đăng ký
                    </button>
                  </div>
                )}

                {/* Chọn ngày khởi hành */}
                <div>
                  <label htmlFor="booking-departure-date" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày khởi hành dự kiến <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <input
                      id="booking-departure-date"
                      type="date"
                      required
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Chọn số lượng vé */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số lượng khách (vé)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Giảm số lượng vé"
                      onClick={() => setSeats(Math.max(1, seats - 1))}
                      className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-sm w-8 text-center text-slate-900 dark:text-white">{seats}</span>
                    <button
                      type="button"
                      aria-label="Tăng số lượng vé"
                      onClick={() => setSeats(Math.min(currentTour.available_seats, seats + 1))}
                      className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                    >
                      +
                    </button>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-auto">
                      ({formatVND(currentTour.base_price)} / vé)
                    </span>
                  </div>
                </div>

                {/* Họ tên */}
                <div>
                  <label htmlFor="booking-customer-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và tên khách hàng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="booking-customer-name"
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Điện thoại */}
                <div>
                  <label htmlFor="booking-customer-phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="booking-customer-phone"
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    onBlur={handlePhoneBlur}
                    className={`w-full px-3.5 py-2 text-xs border ${
                      phoneError
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 dark:focus:ring-rose-950/40'
                        : 'border-slate-200 dark:border-slate-700 focus:border-sky-500'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none transition`}
                  />
                  {phoneError && (
                    <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                      {phoneError}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="booking-customer-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email nhận vé & xác nhận <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="booking-customer-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Ghi chú */}
                <div>
                  <label htmlFor="booking-customer-note" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Yêu cầu đặc biệt</label>
                  <input
                    id="booking-customer-note"
                    type="text"
                    placeholder="Phòng gia đình, ăn chay, đón sân bay..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Mã Voucher giảm giá thông minh */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label htmlFor="booking-voucher-code" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-orange-500" />
                    Mã Giảm Giá Thông Minh
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="booking-voucher-code"
                      type="text"
                      placeholder="Nhập: SMART2026"
                      value={voucherCode}
                      onChange={(e) => {
                        setVoucherCode(e.target.value);
                        setVoucherError('');
                      }}
                      className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none uppercase focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={isCheckingVoucher || !voucherCode.trim()}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-sky-600 dark:hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-40"
                    >
                      {isCheckingVoucher ? '...' : 'Áp dụng'}
                    </button>
                  </div>

                  {voucherError && (
                    <p className="text-[10px] text-rose-500 mt-1 font-medium">{voucherError}</p>
                  )}

                  {appliedVoucher && (
                    <div className="mt-1.5 p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 flex justify-between items-center">
                      <span>✓ Đã giảm: <b>-{formatVND(appliedVoucher.discountAmount)}</b></span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedVoucher(null);
                          setVoucherCode('');
                        }}
                        className="text-rose-500 hover:underline text-[10px]"
                      >
                        Gỡ bỏ
                      </button>
                    </div>
                  )}
                </div>

                {/* Tóm tắt hóa đơn thanh toán */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Tạm tính ({seats} vé):</span>
                    <span>{formatVND(rawTotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Giảm giá Voucher:</span>
                      <span>-{formatVND(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">Tổng thanh toán:</span>
                    <span className="text-lg font-black text-orange-600 dark:text-orange-400">{formatVND(finalTotal)}</span>
                  </div>
                </div>

                {/* Nút submit */}
                <button
                  type={isAuthenticated ? 'submit' : 'button'}
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      showToast('Vui lòng đăng ký/đăng nhập tài khoản.', 'error');
                      openAuthModal();
                    }
                  }}
                  disabled={isSubmitting || currentTour.available_seats === 0}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/25 transition transform active:scale-95 text-xs sm:text-sm disabled:opacity-40"
                >
                  {isSubmitting
                    ? 'Đang xử lý...'
                    : currentTour.available_seats === 0
                    ? 'Hết Chỗ Khả Dụng'
                    : 'Xác Nhận Giữ Chỗ Ngay'}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 px-4 z-40 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Giá trọn gói</span>
          <div className="text-lg font-black text-orange-600 dark:text-orange-400 leading-tight">
            {formatVND(currentTour.base_price)}
            <span className="text-[10px] font-normal text-slate-400">/khách</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              showToast('Vui lòng đăng ký/đăng nhập tài khoản.', 'error');
              openAuthModal();
              return;
            }
            document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          Đặt Chỗ Ngay
        </button>
      </div>

      {/* Cổng Thanh toán VietQR / MoMo mô phỏng */}
      {isPaymentModalOpen && (
        <Suspense fallback={null}>
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            booking={activeBooking}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </Suspense>
      )}

      {/* Vé Điện Tử E-Ticket / Boarding Pass có QR Code */}
      {isTicketModalOpen && (
        <Suspense fallback={null}>
          <ETicketModal
            isOpen={isTicketModalOpen}
            onClose={() => setIsTicketModalOpen(false)}
            booking={activeBooking}
            tour={currentTour}
          />
        </Suspense>
      )}
    </div>
  );
}
