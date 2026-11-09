import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, MapPin, Star, Users, Plane, Bus, Navigation, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { formatVND } from '../utils/format';
import { getMoodById } from '../utils/moods';

export default function TourCard({ tour }) {
  const { isFavorite, toggleWishlist } = useWishlist();
  const fav = isFavorite(tour.id);
  const mood = getMoodById(tour.mood_id);

  // Danh sách ảnh cho slider (2-3 ảnh)
  const images = (tour.gallery && Array.isArray(tour.gallery) && tour.gallery.length > 0)
    ? tour.gallery
    : [tour.featured_image];

  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Chuẩn hóa nhãn phương tiện ngắn gọn, tinh tế và đẹp mắt
  const cleanTransport = (() => {
    const raw = tour.transport_included || '';
    const lower = raw.toLowerCase();
    if (lower.includes('máy bay') || tour.transport_type === 'FLIGHT') {
      if (lower.includes('thẳng')) return 'Vé máy bay bay thẳng';
      if (lower.includes('cano 4 đảo') || lower.includes('4 đảo')) return 'Vé máy bay & Cano 4 đảo';
      if (lower.includes('kỳ co') || (lower.includes('cano') && lower.includes('kỳ'))) return 'Vé máy bay & Cano Kỳ Co';
      if (lower.includes('thuyền rồng')) return 'Vé máy bay & Thuyền rồng';
      if (lower.includes('xe du lịch')) return 'Vé máy bay & Xe du lịch';
      return 'Vé máy bay khứ hồi';
    }
    if (lower.includes('cabin')) return 'Limousine cabin đôi VIP';
    if (lower.includes('massage')) return 'Limousine Dcar massage';
    if (lower.includes('phòng nằm') && (lower.includes('bùn') || lower.includes('hòn tằm'))) return 'Limousine VIP & Tắm bùn';
    if (lower.includes('phòng nằm')) return 'Limousine phòng nằm VIP';
    if (lower.includes('giường nằm')) return 'Limousine giường nằm VIP';
    if (lower.includes('jeep') || lower.includes('sa mạc')) return 'Limousine & Jeep đồi cát';
    if (lower.includes('dcar')) return 'Limousine Dcar đưa đón';
    if (lower.includes('tàu hỏa')) return 'Tàu hỏa & Xe giường nằm';
    if (lower.includes('limousine')) return 'Xe Limousine cao cấp VIP';
    if (raw) {
      const s = raw.replace(/^Đã bao gồm\s*:?\s*/i, '').trim();
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    return 'Xe du lịch cao cấp';
  })();

  const cleanDeparture = tour.departure_location
    ? tour.departure_location.replace(/TP\.\s*Hồ Chí Minh/g, 'TP.HCM')
    : '';

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
      {/* Slider hình ảnh của chuyến đi (2-3 ảnh với nút lướt trái/phải) */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800 select-none">
        <img
          src={images[activeImgIndex]}
          alt={`${tour.title} - Ảnh ${activeImgIndex + 1}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            const fallback = (images.find((img) => img && img !== e.currentTarget.src)) || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80';
            e.currentTarget.src = fallback;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Lớp phủ điện ảnh nhẹ khi hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none"></div>

        {/* Nút lướt ảnh Trái / Phải */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Ảnh trước"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-md hover:scale-110 active:scale-95 z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Ảnh tiếp theo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-md hover:scale-110 active:scale-95 z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Chấm chỉ báo vị trí ảnh (Dots) */}
            <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1 z-10 pointer-events-none">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeImgIndex ? 'w-4 bg-amber-400 shadow' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badge Thể loại */}
        <span className="absolute top-3 left-3 bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
          {tour.category_name}
        </span>

        {/* Nút Yêu thích */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(tour.id);
          }}
          aria-label="Thêm vào yêu thích"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 active:scale-90 transition-all"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              fav ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Badge Vùng miền (góc dưới trái) */}
        <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
          Miền {tour.region}
        </span>

        {/* Mood Tag Badge (Góc dưới phải) - Điểm nhấn "Travel by Mood" */}
        {mood && (
          <span className="absolute bottom-3 right-3 bg-gradient-to-r from-slate-950/90 to-slate-900/90 backdrop-blur-md text-amber-200 border border-amber-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <span>{mood.emoji}</span>
            <span>{mood.shortName}</span>
          </span>
        )}

      </div>

      {/* Thông tin Tour */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Điểm rating & thời gian */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{tour.rating || 5.0}</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">({tour.review_count || 1})</span>
          </div>

          <div className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{tour.duration_days}N{tour.duration_days - 1}Đ</span>
          </div>
        </div>

        {/* Điểm đến & Khởi hành */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 gap-2 h-5">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="truncate font-medium">{tour.destination_name}</span>
          </div>
          {cleanDeparture && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
              <Navigation className="w-3 h-3 text-sky-500 shrink-0" />
              <span>Từ: <b className="text-slate-700 dark:text-slate-300 font-semibold">{cleanDeparture}</b></span>
            </div>
          )}
        </div>

        {/* Tiêu đề Hành Trình */}
        <Link
          to={`/tours/${tour.id}`}
          title={tour.title}
          className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 h-11 mb-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug"
        >
          {tour.title}
        </Link>

        {/* Câu trích dẫn cảm xúc nghệ thuật (Storytelling Mood Quote) */}
        {tour.emotional_quote && (
          <div className="text-[11px] italic text-amber-700/90 dark:text-amber-300/80 line-clamp-1 mb-2 font-serif flex items-center gap-1 h-4">
            <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
            <span className="truncate">"{tour.emotional_quote}"</span>
          </div>
        )}

        {/* Gói phương tiện đã bao gồm */}
        <div className="mb-2.5 h-6 flex items-center">
          <span
            title={`Phương tiện trọn gói: ${tour.transport_included || cleanTransport}`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-tight transition-colors border shadow-xs ${
              tour.transport_type === 'FLIGHT' || cleanTransport.includes('máy bay')
                ? 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500/30'
                : 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30'
            }`}
          >
            {tour.transport_type === 'FLIGHT' || cleanTransport.includes('máy bay') ? (
              <Plane className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            ) : (
              <Bus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span className="font-medium whitespace-nowrap">{cleanTransport}</span>
          </span>
        </div>

        {/* Tóm tắt lịch trình */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-9 mb-4 leading-relaxed">
          {tour.itinerary_summary}
        </p>

        {/* Chỗ trống & Giá */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">
              <Users className="w-3 h-3" />
              <span>Còn {tour.available_seats} chỗ</span>
            </div>
            <div className="text-base sm:text-lg font-black text-orange-600 dark:text-orange-400">
              {formatVND(tour.base_price)}
            </div>
          </div>

          <Link
            to={`/tours/${tour.id}`}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-sky-600/30 transition hover:shadow-md active:scale-95"
          >
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
