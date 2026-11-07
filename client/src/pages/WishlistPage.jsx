import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import TourCard from '../components/TourCard';

export default function WishlistPage({ tours = [] }) {
  const { wishlist } = useWishlist();

  // Lọc ra các tour nằm trong wishlist
  const favoriteTours = tours.filter((t) => wishlist.includes(t.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            Bộ Sưu Tập Của Bạn
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Tour Du Lịch Yêu Thích</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Danh sách các hành trình bạn đã lưu để lên kế hoạch trải nghiệm
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl shadow-sm">
          Đã lưu: <b className="text-rose-600 dark:text-rose-400 font-extrabold">{favoriteTours.length}</b> tour
        </div>
      </div>

      {favoriteTours.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 sm:p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-400 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Chưa có tour nào trong danh sách yêu thích</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Hãy khám phá các điểm đến tuyệt đẹp và nhấn vào biểu tượng trái tim để lưu lại những hành trình bạn quan tâm nhé!
          </p>
          <div className="pt-2">
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              <span>Khám Phá Tour Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}
