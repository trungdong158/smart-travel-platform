import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, MapPin, Compass, ShieldCheck, Sparkles, Zap, 
  ChevronRight, ArrowRight, Award, Headphones, Quote
} from 'lucide-react';
import TourCard from '../components/TourCard';
import { TRAVEL_MOODS, getMoodById } from '../utils/moods';

// Cấu hình phông nền sống động, ấm áp, chữa lành theo từng Mood (Ultra HD 2400px)
const HERO_MOOD_CONFIGS = {
  healing: {
    image: 'https://images.unsplash.com/photo-1570366583862-f91883984fde?auto=format&fit=crop&w=2400&q=85',
    alt: 'Bình minh rực rỡ trên thung lũng Mường Hoa Sa Pa - Chữa lành & Tĩnh tại',
    ambientGlow: 'from-amber-400/35 via-emerald-400/20 to-transparent',
    sunbeamColor: 'bg-amber-300/30',
    tagline: '🌿 Sớm mai thanh khiết • Gửi lại ưu phiền, tìm về an yên giữa đất trời'
  },
  adventure: {
    image: 'https://images.unsplash.com/photo-1670654534716-91f59fe06a26?auto=format&fit=crop&w=2400&q=85',
    alt: 'Đèo Mã Pí Lèng Hà Giang ngập tràn nắng vàng rực rỡ - Bứt phá & Phiêu lưu',
    ambientGlow: 'from-amber-500/35 via-orange-400/25 to-transparent',
    sunbeamColor: 'bg-orange-300/30',
    tagline: '⚡ Nắng vàng đỉnh đèo • Chinh phục giới hạn, ghi dấu bước chân kiêu hãnh'
  },
  romance: {
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=2400&q=85',
    alt: 'Hoàng hôn ấm áp rực rỡ Sunset Town Phú Quốc - Lãng mạn & Hoài niệm',
    ambientGlow: 'from-rose-400/35 via-amber-400/30 to-transparent',
    sunbeamColor: 'bg-rose-300/30',
    tagline: '🌅 Hoàng hôn biển ngọc • Lưu giữ khoảnh khắc dịu dàng và ngọt ngào bên người thương'
  },
  discovery: {
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85',
    alt: 'Vịnh Hạ Long nước xanh ngọc bích lấp lánh nắng hè - Tự do & Khám phá',
    ambientGlow: 'from-sky-400/35 via-teal-400/25 to-transparent',
    sunbeamColor: 'bg-sky-300/30',
    tagline: '🌊 Nắng ấm biển xanh • Đón luồng sinh khí mới, tự do vẫy vùng giữa đại dương'
  }
};

export default function HomePage({ tours = [] }) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [selectedMood, setSelectedMood] = useState('healing'); // Tab cảm xúc đang chọn trong showcase
  const [heroActiveMood, setHeroActiveMood] = useState('healing'); // Mood đang chọn ở Hero

  const activeHeroConfig = HERO_MOOD_CONFIGS[heroActiveMood] || HERO_MOOD_CONFIGS.healing;

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('search', keyword.trim());
    if (region) params.set('region', region);
    navigate(`/tours?${params.toString()}`);
  };

  const activeMoodData = getMoodById(selectedMood) || TRAVEL_MOODS[0];
  const activeHeroMoodData = getMoodById(heroActiveMood) || TRAVEL_MOODS[0];

  // Lọc các tour tương ứng với mood đang chọn trong Showcase
  const moodMatchedTours = tours.filter((t) => t.mood_id === selectedMood);

  const trendingDestinations = [
    { name: 'Đà Nẵng', tag: 'Cầu Vàng & Biển Mỹ Khê', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80', count: '12 hành trình', region: 'Trung' },
    { name: 'Phú Quốc', tag: 'Hoàng hôn Sunset Town', image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80', count: '15 hành trình', region: 'Nam' },
    { name: 'Sa Pa', tag: 'Biển mây nóc nhà Fansipan', image: 'https://images.unsplash.com/photo-1570366583862-f91883984fde?auto=format&fit=crop&w=600&q=80', count: '9 hành trình', region: 'Bắc' },
    { name: 'Hà Giang', tag: 'Hùng vĩ đèo Mã Pí Lèng', image: 'https://images.unsplash.com/photo-1670654534716-91f59fe06a26?auto=format&fit=crop&w=600&q=80', count: '8 hành trình', region: 'Bắc' },
    { name: 'Cố Đô Huế', tag: 'Sông Hương & đầm Lập An', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80', count: '7 hành trình', region: 'Trung' },
    { name: 'Đà Lạt', tag: 'Rừng thông & sương sớm', image: 'https://images.unsplash.com/photo-1678099006439-dba9e4d3f9f5?auto=format&fit=crop&w=600&q=80', count: '10 hành trình', region: 'Nam' }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION: TRAVEL WHERE YOUR SOUL LEADS - TRAVEL BY MOOD (Ấm áp, Sống động, Chữa lành) */}
      <section className="relative text-white min-h-[640px] lg:min-h-[720px] flex items-center px-6 sm:px-10 lg:px-16 overflow-hidden shadow-2xl bg-stone-950 rounded-3xl mx-2 sm:mx-4 my-2 border border-amber-400/30 shadow-[0_15px_60px_rgba(245,158,11,0.18)] transition-all duration-700">
        {/* Phông nền phong cảnh rực rỡ, chan hòa nắng ấm, giàu cảm xúc theo từng tâm trạng */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            key={heroActiveMood}
            src={activeHeroConfig.image}
            alt={activeHeroConfig.alt}
            className="w-full h-full object-cover object-center filter brightness-[0.88] saturate-[1.18] contrast-[1.04] scale-100 transition-all duration-1000 ease-out"
          />
          {/* Lớp phủ điện ảnh Warm Golden Hour Gradient - Giữ trọn vẻ sống động và an yên */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-900/40 to-stone-900/10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30"></div>
          
          {/* Vầng sáng ban mai & hoàng hôn ấm áp chữa lành (Ambient Sunbeam Glow) */}
          <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full ${activeHeroConfig.sunbeamColor} blur-[120px] pointer-events-none transition-colors duration-1000`}></div>
          <div className={`absolute -bottom-24 right-1/4 w-[480px] h-[480px] rounded-full bg-gradient-to-tr ${activeHeroConfig.ambientGlow} blur-[140px] pointer-events-none transition-all duration-1000 mix-blend-screen`}></div>
        </div>

        {/* Nội dung chính Hero mang đậm nét riêng: "Travel by Mood" */}
        <div className="relative z-10 max-w-4xl py-12 lg:py-16 space-y-6">
          
          {/* Brand Eyebrow: Travel Where Your Soul Leads */}
          <div className="flex items-center gap-3 text-amber-300 text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase">
            <span className="w-8 h-[2px] bg-amber-400 inline-block"></span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              TRAVEL WHERE YOUR SOUL LEADS — TRAVEL BY MOOD
            </span>
          </div>

          {/* Tiêu đề cảm xúc: Bắt đầu bằng câu hỏi gần gũi */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white tracking-normal leading-[1.32] sm:leading-[1.28] md:leading-[1.25] drop-shadow-2xl">
            <span className="block text-slate-100 pb-2 sm:pb-3">
              Hôm Nay Bạn Muốn Tâm Hồn Mình
            </span>
            <span className="inline-block py-1 bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
              Thuộc Về Khoảng Trời Nào?
            </span>
          </h1>

          {/* Triết lý thương hiệu cốt lõi */}
          <p className="text-slate-200 text-xs sm:text-sm md:text-base max-w-2xl font-light leading-relaxed drop-shadow">
            Thay vì chỉ hỏi <i>“Bạn muốn đi đâu?”</i>, chúng tôi bắt đầu từ <b>“Bạn đang cảm thấy thế nào và muốn trải nghiệm điều gì?”</b>. 
            Bởi vì du lịch không chỉ là đi đến một nơi khác, mà còn là hành trình tìm thấy một phiên bản khác của bản thân.
          </p>

          {/* Tagline tâm trạng hiện tại */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/40 backdrop-blur-md border border-amber-400/30 text-amber-200 text-xs font-medium">
            <span>{activeHeroConfig.tagline}</span>
          </div>

          {/* INTERACTIVE MOOD SELECTOR: Điểm nhấn thiết kế riêng độc bản */}
          <div className="space-y-3 pt-1">
            <div className="text-xs font-semibold text-amber-200/90 tracking-wide flex items-center gap-2">
              <span>Chọn cảm xúc của bạn hôm nay:</span>
              <span className="text-[10px] text-slate-300 font-normal hidden sm:inline">(Phông nền và hành trình sẽ tự động hòa nhịp cùng bạn)</span>
            </div>

            {/* 4 Mood Pills trực quan với hiệu ứng Kính mờ ấm áp */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl">
              {TRAVEL_MOODS.map((m) => {
                const isActive = heroActiveMood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setHeroActiveMood(m.id)}
                    className={`py-2.5 px-3 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 border-amber-300 shadow-lg shadow-amber-500/30 scale-[1.02]'
                        : 'bg-stone-900/40 hover:bg-stone-900/60 text-white border-white/20 backdrop-blur-md'
                    }`}
                  >
                    <div className="flex items-center justify-between text-base mb-1">
                      <span>{m.emoji}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-stone-900' : 'text-amber-300'}`}>
                        {m.shortName}
                      </span>
                    </div>
                    <span className="text-xs font-bold leading-snug line-clamp-1">
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Preview câu trích dẫn của cảm xúc đã chọn */}
            <div className="p-3 bg-stone-900/50 backdrop-blur-md rounded-2xl border border-amber-300/30 max-w-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
              <div className="flex items-center gap-2 text-amber-100 font-serif italic">
                <Quote className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="line-clamp-1">{activeHeroMoodData.quote}</span>
              </div>
              <Link
                to={`/tours?mood=${heroActiveMood}`}
                className="shrink-0 self-end sm:self-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-[11px] shadow-md shadow-amber-500/25 transition flex items-center gap-1 active:scale-95"
              >
                <span>Chạm vào hành trình này</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Form tìm kiếm thông minh kết hợp Kính mờ (Frosted Glass) */}
          <form 
            onSubmit={handleSearch} 
            className="mt-4 bg-stone-900/55 backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2.5 text-white border border-amber-400/30 max-w-3xl"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 bg-stone-950/40 rounded-xl border border-white/15 focus-within:border-amber-400 focus-within:bg-stone-950/60 transition">
              <Search className="w-4 h-4 text-amber-300 shrink-0" />
              <input
                type="text"
                placeholder="Bạn muốn đi đâu? (Đà Lạt, Sa Pa, Phú Quốc, Hà Giang...)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm focus:outline-none text-white placeholder-stone-300 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-stone-950/40 rounded-xl border border-white/15 focus-within:border-amber-400 focus-within:bg-stone-950/60 transition md:w-44">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none text-white cursor-pointer [&>option]:bg-stone-900 [&>option]:text-white"
              >
                <option value="">Tất cả vùng miền</option>
                <option value="Bắc">Miền Bắc</option>
                <option value="Trung">Miền Trung</option>
                <option value="Nam">Miền Nam</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Khám Phá Ngay</span>
            </button>
          </form>

        </div>

        {/* Họa tiết nghệ thuật đặc trưng ở cạnh phải */}
        <div className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 items-center gap-3 rotate-90 origin-right text-[11px] uppercase tracking-[0.25em] text-amber-200/60 font-mono select-none pointer-events-none">
          <span className="text-amber-400 font-bold">TRAVEL BY MOOD</span>
          <span className="w-8 h-[1px] bg-amber-400/40 inline-block"></span>
          <span>Đi đâu theo cảm xúc của bạn</span>
        </div>
      </section>

      {/* 2. SIGNATURE SHOWCASE: TRAVEL BY MOOD — CẢM HỨNG HÀNH TRÌNH THEO TÂM TRẠNG */}
      <section id="travel-by-mood" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Điểm Nhấn Độc Bản</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Travel by Mood: Chạm Vào Cảm Xúc
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Mỗi chuyến đi được tuyển chọn dựa trên tâm trạng, cá tính và phong cách sống. Hãy lắng nghe xem bạn đang cần điều gì lúc này.
            </p>
          </div>

          <Link
            to={`/tours?mood=${selectedMood}`}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-1 group shrink-0"
          >
            <span>Tất cả tour theo cảm xúc này ({moodMatchedTours.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Tab chuyển đổi cảm xúc */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {TRAVEL_MOODS.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMood(m.id)}
                className={`p-4 rounded-3xl border text-left transition-all duration-300 flex items-start gap-3.5 relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/80 dark:border-amber-400 shadow-md ring-2 ring-amber-400/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-xs ${
                  isSelected ? 'bg-amber-500 text-white shadow-amber-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  <span>{m.emoji}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    {m.shortName}
                  </span>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                    {m.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-light">
                    {m.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Banner Cảm xúc Nghệ thuật (Mood Canvas Banner) */}
        <div className="relative rounded-3xl overflow-hidden mb-8 p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-200/80 dark:border-slate-800 text-white">
          {/* Ảnh nền của Mood */}
          <div className="absolute inset-0 z-0">
            <img
              src={activeMoodData.coverImage}
              alt={activeMoodData.name}
              className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.10] saturate-[1.15] transition-all duration-700"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${activeMoodData.accentBg}`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-bold border border-white/20">
              <span>{activeMoodData.emoji}</span>
              <span>Hành trình cho tâm hồn: {activeMoodData.name}</span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white tracking-tight leading-snug">
              “{activeMoodData.quote}”
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed max-w-2xl">
              {activeMoodData.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to={`/tours?mood=${selectedMood}`}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20 transition active:scale-95 flex items-center gap-2"
              >
                <span>Xem tất cả {moodMatchedTours.length} tour {activeMoodData.shortName}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-xs text-slate-300 font-mono">
                {moodMatchedTours.map((t) => t.destination_name.split(',')[0]).slice(0, 4).join(' • ')}
              </span>
            </div>
          </div>
        </div>

        {/* Lưới các tour phù hợp với cảm xúc */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {moodMatchedTours.slice(0, 3).map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>

      {/* 3. BRAND PHILOSOPHY MANIFESTO: "BỞI VÌ DU LỊCH LÀ TÌM THẤY BẢN THÂN" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-900/5 dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900 rounded-3xl p-8 sm:p-12 border border-amber-500/20 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Cột trái: Tuyên ngôn thương hiệu */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Triết Lý Thương Hiệu — Travel Where Your Soul Leads</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 dark:text-white leading-tight">
                Du Lịch Không Chỉ Là Đi Đến Nơi Khác, Mà Là Tìm Thấy Một Phiên Bản Rạng Rỡ Của Chính Mình.
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                Website của chúng tôi không sao chép những khuôn mẫu khô khan. Mỗi trang không chỉ cung cấp thông tin mà còn kể một câu chuyện, 
                được thiết kế theo vibe <b>Modern Travel Aesthetic – Warm, Emotional & Free-Spirited</b>: trẻ trung, phóng khoáng, tinh tế nhưng vẫn ấm áp và gần gũi.
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Chữa Lành</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>Phiêu Lưu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span>Lãng Mạn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  <span>Tự Do</span>
                </div>
              </div>
            </div>

            {/* Cột phải: 4 Trụ cột giá trị riêng biệt */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-1.5 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  🌿
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Lắng Nghe Cảm Xúc</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Gợi ý hành trình dựa trên tâm trạng thực tế của bạn.</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-1.5 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                  ☀️
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Vẻ Đẹp Nguyên Bản</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Hình ảnh phong cảnh giàu cảm xúc, ánh nắng và thiên nhiên.</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-1.5 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
                  🌅
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Storytelling Tinh Tế</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Mỗi chuyến đi là một câu chuyện đáng nhớ của riêng bạn.</p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-1.5 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                  🕊️
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Tự Do Khám Phá</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Giữ chỗ tức thì, trợ lý AI thấu cảm đồng hành 24/7.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. ĐIỂM ĐẾN THỊNH HÀNH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Thiên Nhiên & Văn Hóa</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Những Miền Đất Truyền Cảm Hứng</h2>
          </div>
          <Link to="/tours" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-1 group">
            Khám phá tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingDestinations.map((dest, idx) => (
            <Link
              key={idx}
              to={`/tours?search=${encodeURIComponent(dest.name)}&region=${encodeURIComponent(dest.region)}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200/60 dark:border-slate-800"
            >
              <img
                src={dest.image}
                alt={dest.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80';
                }}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Miền {dest.region}</span>
                <h3 className="font-extrabold text-sm sm:text-base leading-tight group-hover:text-amber-200 transition">
                  {dest.name}
                </h3>
                <span className="text-[10px] text-slate-300 font-light block mt-0.5 truncate">{dest.tag}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. TOUR ĐẶC SẮC ĐƯỢC YÊU THÍCH NHẤT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Hành Trình Chọn Lọc</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Các Chuyến Đi Được Đánh Giá Cao Nhất</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Trọn gói phương tiện cao cấp, giữ chỗ minh bạch và dịch vụ chuẩn mực</p>
          </div>
          <Link to="/tours" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 text-xs sm:text-sm font-bold flex items-center gap-1 group">
            Xem toàn bộ {tours.length} tour <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.slice(0, 6).map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>

      {/* 6. BANNER KHUYẾN MÃI VOUCHER THÔNG MINH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 dark:bg-gradient-to-r dark:from-slate-900 dark:via-orange-950 dark:to-slate-900 dark:border dark:border-orange-800/40 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl transition-all duration-300">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Compass className="w-80 h-80 -mr-16 -mb-16" />
          </div>

          <div className="relative max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-300 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-slate-950" /> Ưu đãi khởi đầu hành trình 2026
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Nhập Mã <span className="text-amber-300 font-mono underline">SMART2026</span> Nhận Ngay Ưu Đãi 10%
            </h3>
            <p className="text-amber-100 text-xs sm:text-sm leading-relaxed font-light">
              Dành tặng bạn món quà nhỏ để bắt đầu hành trình tìm kiếm những điều khiến mình thấy sống. Tích lũy điểm thành viên và hỗ trợ giữ chỗ linh hoạt.
            </p>
            <div className="pt-2">
              <Link
                to="/tours"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-950 hover:bg-amber-300 font-bold text-xs sm:text-sm rounded-2xl shadow transition active:scale-95"
              >
                <span>Khám Phá Các Hành Trình Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GIÁ TRỊ CỐT LÕI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">An Tâm & Tinh Tế</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Trải Nghiệm Khác Biệt Cùng SoulTrip</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Chúng tôi đồng hành để mỗi khoảnh khắc của bạn đều trọn vẹn và an nhiên.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Gợi Ý Theo Tâm Trạng</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Trợ lý AI lắng nghe cảm xúc để gợi ý chuyến đi phù hợp nhất với tâm hồn bạn.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Giữ Chỗ Minh Bạch</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Cập nhật số chỗ trống tức thì theo thời gian thực, tuyệt đối an tâm khi khởi hành.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Chất Lượng Thẩm Định</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Xe đưa đón Limousine, máy bay, khách sạn 3-5 sao tuyển chọn kỹ càng.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Đồng Hành Thấu Cảm 24/7</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Đội ngũ chuyên viên tư vấn luôn sẵn sàng lắng nghe và hỗ trợ bạn suốt hành trình.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
