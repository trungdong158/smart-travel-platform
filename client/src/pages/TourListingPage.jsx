import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, RotateCcw, Compass, ArrowUpDown, Sparkles, X } from 'lucide-react';
import TourCard from '../components/TourCard';
import { formatVND, removeVietnameseTones } from '../utils/format';
import { TRAVEL_MOODS, getMoodById } from '../utils/moods';

export default function TourListingPage({ tours = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get('search') || '';
  const urlRegion = searchParams.get('region') || '';
  const urlMood = searchParams.get('mood') || '';

  // Khởi tạo và tự động đồng bộ khi URL params thay đổi
  const [keyword, setKeyword] = useState(urlSearch);
  const [region, setRegion] = useState(urlRegion);
  const [mood, setMood] = useState(urlMood);
  const [prevParams, setPrevParams] = useState({ search: urlSearch, region: urlRegion, mood: urlMood });

  if (prevParams.search !== urlSearch || prevParams.region !== urlRegion || prevParams.mood !== urlMood) {
    setPrevParams({ search: urlSearch, region: urlRegion, mood: urlMood });
    setKeyword(urlSearch);
    setRegion(urlRegion);
    setMood(urlMood);
  }

  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const activeMoodData = mood ? getMoodById(mood) : null;

  // Danh sách các danh mục độc nhất từ tours
  const categories = useMemo(() => {
    const set = new Set(tours.map((t) => t.category_name).filter(Boolean));
    return Array.from(set);
  }, [tours]);

  // Bộ lọc kết quả thông minh: hỗ trợ tìm theo từ khóa, vùng miền, danh mục, giá và tâm trạng
  const filteredTours = useMemo(() => {
    return tours
      .filter((tour) => {
        // 1. Kiểm tra từ khóa tìm kiếm: nếu nhập cụm từ thì phải có trong tên hoặc điểm đến của tour
        if (keyword && keyword.trim()) {
          const normQ = removeVietnameseTones(keyword);
          const compactQ = normQ.replace(/\s+/g, '');

          const normTitle = removeVietnameseTones(tour.title);
          const compactTitle = normTitle.replace(/\s+/g, '');

          const normDest = removeVietnameseTones(tour.destination_name);
          const compactDest = normDest.replace(/\s+/g, '');

          const isMatch =
            normTitle.includes(normQ) ||
            compactTitle.includes(compactQ) ||
            normDest.includes(normQ) ||
            compactDest.includes(compactQ);

          if (!isMatch) {
            return false;
          }

          // Khi đã có từ khóa tìm kiếm, chỉ lọc thêm vùng miền nếu người dùng chủ động chọn
          return region ? tour.region === region : true;
        }

        // 2. Bộ lọc phụ khi không nhập từ khóa tìm kiếm
        const matchRegion = region ? tour.region === region : true;
        const matchCategory = category ? tour.category_name === category : true;
        const matchPrice = tour.base_price <= maxPrice;
        const matchMood = mood ? tour.mood_id === mood : true;

        return matchRegion && matchCategory && matchPrice && matchMood;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.base_price - b.base_price;
        if (sortBy === 'price-desc') return b.base_price - a.base_price;
        if (sortBy === 'rating') return (b.rating || 5.0) - (a.rating || 5.0);
        return 0;
      });
  }, [tours, keyword, region, category, maxPrice, mood, sortBy]);

  const handleResetFilters = () => {
    setKeyword('');
    setRegion('');
    setCategory('');
    setMood('');
    setMaxPrice(10000000);
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header trang */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>Travel Where Your Soul Leads</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white mt-1">
            Khám Phá Hành Trình Của Bạn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chọn chuyến đi theo cảm xúc, phong cách sống và những điều tâm hồn bạn đang tìm kiếm
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-2xl shadow-sm">
            Tìm thấy <b className="text-amber-600 dark:text-amber-400 font-extrabold">{filteredTours.length}</b> tour phù hợp
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-2xl shadow-sm text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer [&>option]:bg-white dark:[&>option]:bg-slate-900"
            >
              <option value="featured">Nổi bật nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* QUICK MOOD SELECTOR BAR: Chọn Cảm Xúc 1 Chạm (Điểm nhấn riêng) */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1.5 pr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Đi theo cảm xúc:</span>
        </span>

        <button
          type="button"
          onClick={() => setMood('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
            mood === ''
              ? 'bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          ✨ Tất cả cảm xúc
        </button>

        {TRAVEL_MOODS.map((m) => {
          const isActive = mood === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMood(isActive ? '' : m.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm font-black'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* BANNER THÔNG ĐIỆP CẢM XÚC KHI ĐANG LỌC THEO MOOD */}
      {activeMoodData && (
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <span className="text-2xl shrink-0 p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xs">
              {activeMoodData.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Hành trình cảm xúc: {activeMoodData.name}
                </span>
                <span className="text-[10px] text-slate-400">• {filteredTours.length} tour</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 font-serif italic mt-0.5">
                “{activeMoodData.quote}”
              </p>
            </div>
          </div>
          <button
            onClick={() => setMood('')}
            className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-bold shrink-0 self-end sm:self-center flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Xóa lọc cảm xúc</span>
          </button>
        </div>
      )}

      {/* Nút bật/tắt bộ lọc trên thiết bị di động */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Bộ lọc tìm kiếm chi tiết</span>
            {(region || category || keyword || mood || maxPrice < 10000000) && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </div>
          <span className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
            {isMobileFilterOpen ? 'Thu gọn ▲' : 'Mở rộng bộ lọc ▼'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Sidebar Bộ lọc */}
        <aside className={`lg:col-span-1 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 sticky top-24 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Bộ Lọc Tìm Kiếm
            </h2>
            <button
              onClick={handleResetFilters}
              className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Đặt lại
            </button>
          </div>

          {/* Tìm theo từ khóa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Từ khóa tìm kiếm</label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Tên tour, điểm đến..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 dark:focus:ring-amber-900/40 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Lọc theo Tâm trạng (Travel by Mood) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tâm trạng (Travel by Mood)</span>
            </label>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => setMood('')}
                className={`w-full py-2 px-3 rounded-xl border text-left font-medium transition flex items-center justify-between ${
                  mood === ''
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-800 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>✨ Tất cả cảm xúc</span>
                <span className="text-[10px] text-slate-400">{tours.length}</span>
              </button>
              {TRAVEL_MOODS.map((m) => {
                const count = tours.filter((t) => t.mood_id === m.id).length;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(m.id)}
                    className={`w-full py-2 px-3 rounded-xl border text-left font-medium transition flex items-center justify-between ${
                      mood === m.id
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-800 dark:text-amber-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{m.emoji}</span>
                      <span>{m.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lọc theo Vùng miền */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Vùng miền</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRegion('')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition ${
                  region === ''
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-800 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Tất cả
              </button>
              {['Bắc', 'Trung', 'Nam'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  className={`py-2 px-3 rounded-xl border text-center font-medium transition ${
                    region === r
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-800 dark:text-amber-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Miền {r}
                </button>
              ))}
            </div>
          </div>

          {/* Lọc theo Danh mục */}
          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Loại hình trải nghiệm</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer [&>option]:bg-white dark:[&>option]:bg-slate-900"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lọc theo Ngân sách */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ngân sách tối đa</label>
              <span className="text-xs font-black text-orange-600 dark:text-orange-400 font-mono">{formatVND(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="1500000"
              max="10000000"
              step="500000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
              <span>1.500.000đ</span>
              <span>10.000.000đ</span>
            </div>
          </div>

        </aside>

        {/* Danh sách Tour */}
        <section className="lg:col-span-3">
          {filteredTours.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Không tìm thấy hành trình phù hợp</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Không có hành trình nào khớp với các tiêu chí lọc hiện tại. Hãy thử nới rộng khoảng giá hoặc chọn một tâm trạng khác.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition active:scale-95"
              >
                Xem tất cả các hành trình
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
