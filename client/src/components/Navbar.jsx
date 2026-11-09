import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, User, LayoutDashboard, LogOut, Menu, X, 
  CalendarClock, ChevronDown, Sun, Moon, BookOpen 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { currentUser, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { wishlistCount } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Khi click vào menu điều hướng: nếu đang ở chính trang đó thì tự động cuộn mượt mà lên đầu trang
  const handleNavClick = (targetPath) => {
    if (location.pathname === targetPath) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      if (document.documentElement) {
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
      if (document.body) {
        document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleToggleTheme = () => {
    toggleTheme();
    showToast(
      isDark ? '☀️ Đã chuyển sang Giao diện Sáng (Light Mode)' : '🌙 Đã kích hoạt Giao diện Tối (Dark Mode)',
      'info'
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-1 sm:gap-2 lg:gap-4">
        
        {/* Brand: SoulTrip */}
        <Link 
          to="/" 
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink"
        >
          <img 
            src="/soultrip-logo.png" 
            alt="SoulTrip Logo" 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0 border border-sky-200/60 dark:border-slate-700/80"
          />
          <div className="flex min-w-0 flex-col justify-center">
            <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500 dark:from-sky-400 dark:via-indigo-300 dark:to-amber-300 bg-clip-text text-transparent tracking-tight whitespace-nowrap leading-tight">
              SoulTrip
            </span>
            <span className="hidden min-[360px]:block text-[10px] text-slate-500 dark:text-slate-400 font-medium italic tracking-tight whitespace-nowrap -mt-0.5">
              “ Travel Where Your Soul Leads “
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-5 text-sm font-semibold text-slate-600 dark:text-slate-300 shrink-0">
          <Link 
            to="/" 
            onClick={() => handleNavClick('/')}
            className={`transition whitespace-nowrap shrink-0 ${
              location.pathname === '/' 
                ? 'text-amber-600 dark:text-amber-400 font-bold' 
                : 'hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            Trang chủ
          </Link>
          <Link 
            to="/tours" 
            onClick={() => handleNavClick('/tours')}
            className={`transition whitespace-nowrap shrink-0 ${
              location.pathname === '/tours' 
                ? 'text-amber-600 dark:text-amber-400 font-bold' 
                : 'hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            Khám phá tour
          </Link>
          <Link 
            to="/blog" 
            onClick={() => handleNavClick('/blog')}
            className={`transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              location.pathname === '/blog' 
                ? 'text-amber-600 dark:text-amber-400 font-bold' 
                : 'hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Blog</span>
          </Link>
          

          {/* Chỉ khách hàng thông thường mới cần nút Tour của tôi trên thanh điều hướng chính */}
          {isAuthenticated && !isAdmin && (
            <Link 
              to="/my-bookings" 
              onClick={() => handleNavClick('/my-bookings')}
              className={`transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                location.pathname === '/my-bookings' 
                  ? 'text-sky-600 dark:text-sky-400 font-bold' 
                  : 'hover:text-sky-600 dark:hover:text-sky-400'
              }`}
            >
              <CalendarClock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Tour của tôi</span>
            </Link>
          )}

          {/* Quản trị viên: Hiển thị Bảng Quản Trị gọn gàng thay thế vị trí của Tour của tôi */}
          {isAdmin && (
            <Link 
              to="/admin" 
              onClick={() => handleNavClick('/admin')}
              className="text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-white transition flex items-center gap-1.5 bg-indigo-50/90 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-200/90 dark:border-indigo-800/80 text-xs font-bold shadow-xs hover:shadow-sm whitespace-nowrap shrink-0"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Bảng Quản Trị</span>
            </Link>
          )}
        </nav>

        {/* Right Action Icons & User Status */}
        <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0">
          {/* Wishlist Link */}
          <Link 
            to="/wishlist" 
            title="Danh sách tour yêu thích"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/70 dark:border-slate-700 transition group whitespace-nowrap shrink-0"
          >
            <Heart className={`w-3.5 h-3.5 text-rose-500 ${wishlistCount > 0 ? 'fill-rose-500' : ''} group-hover:scale-110 transition shrink-0`} />
            <span className="hidden 2xl:inline">Yêu thích</span>
            <span className="text-[11px] font-bold">({wishlistCount})</span>
          </Link>

          {/* Chế độ Dark Mode: Nút tròn tinh gọn chuẩn hiện đại */}
          <button
            type="button"
            onClick={handleToggleTheme}
            title={isDark ? "Đang ở Chế độ Tối - Nhấn để chuyển sang Chế độ Sáng" : "Đang ở Chế độ Sáng - Nhấn để chuyển sang Chế độ Tối"}
            aria-label="Đổi chế độ giao diện Sáng / Tối"
            className={`p-2 rounded-full border text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 cursor-pointer select-none shrink-0 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 shrink-0" />
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 pr-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition whitespace-nowrap shrink-0"
                title={currentUser?.fullName}
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-sky-500/40 shrink-0"
                  />
                ) : null}
                <div
                  style={{ display: currentUser?.avatar ? 'none' : 'flex' }}
                  className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white items-center justify-center font-bold text-xs shadow-inner shrink-0"
                >
                  {currentUser?.fullName?.charAt(0) || 'U'}
                </div>
                <span className="max-w-[90px] lg:max-w-[110px] xl:max-w-[140px] truncate whitespace-nowrap">
                  {currentUser?.role === 'ADMIN' && (currentUser?.fullName?.length || 0) > 16 
                    ? 'Quản trị viên' 
                    : currentUser?.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150 z-50"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.fullName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-500/30 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {currentUser?.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser.fullName}</p>
                      <p className="text-slate-400 dark:text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                        {currentUser.role === 'ADMIN' ? 'Quản Trị Viên' : 'Thành Viên SoulTrip'}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Hồ sơ cá nhân
                  </Link>

                  <Link
                    to="/my-bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <CalendarClock className="w-4 h-4 text-slate-400" />
                    Lịch sử đặt vé
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold transition"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Bảng điều khiển Admin
                    </Link>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-95 rounded-xl shadow-md shadow-sky-500/20 transition active:scale-95"
            >
              Đăng nhập / Đăng ký
            </button>
          )}
        </div>

        {/* Mobile Hamburger & Dark Mode Buttons */}
        <div className="flex md:hidden items-center gap-1 sm:gap-2 shrink-0">
          {/* Nút Dark Mode trên Mobile */}
          <button
            type="button"
            onClick={handleToggleTheme}
            title={isDark ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
            aria-label="Đổi chế độ sáng tối"
            className={`p-1.5 sm:p-2 rounded-full border transition active:scale-90 ${
              isDark
                ? 'bg-slate-800 border-amber-500/40 text-amber-300'
                : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <Link 
            to="/wishlist" 
            className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 relative"
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-4 space-y-4 animate-in slide-in-from-top-3 duration-200 shadow-xl">
          {/* Hàng chuyển đổi Dark Mode trong drawer di động */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Giao diện hiển thị:</span>
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition ${
                isDark
                  ? 'bg-slate-800 border-amber-500/40 text-amber-300'
                  : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chế độ Sáng</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Chế độ Tối</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1 font-semibold text-sm text-slate-700 dark:text-slate-200">
            <Link 
              to="/" 
              onClick={() => handleNavClick('/')}
              className={`block py-2 ${
                location.pathname === '/' 
                  ? 'text-amber-600 dark:text-amber-400 font-bold' 
                  : 'hover:text-sky-600 dark:hover:text-sky-400'
              }`}
            >
              Trang chủ
            </Link>
            <Link 
              to="/tours" 
              onClick={() => handleNavClick('/tours')}
              className={`block py-2 ${
                location.pathname === '/tours' 
                  ? 'text-amber-600 dark:text-amber-400 font-bold' 
                  : 'hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              Khám phá tour
            </Link>
            <Link 
              to="/blog" 
              onClick={() => handleNavClick('/blog')}
              className={`py-2 flex items-center gap-2 ${
                location.pathname === '/blog' 
                  ? 'text-amber-600 dark:text-amber-400 font-bold' 
                  : 'hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Blog Chia Sẻ</span>
            </Link>

            <Link 
              to="/wishlist" 
              onClick={() => handleNavClick('/wishlist')}
              className="block py-2 hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-between"
            >
              <span>Tour yêu thích</span>
              <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs rounded-full font-bold">
                {wishlistCount}
              </span>
            </Link>

            {isAuthenticated && (
              <>
                <Link 
                  to="/my-bookings" 
                  onClick={() => handleNavClick('/my-bookings')}
                  className="block py-2 hover:text-sky-600 dark:hover:text-sky-400"
                >
                  Lịch sử đặt tour
                </Link>
                <Link 
                  to="/profile" 
                  onClick={() => handleNavClick('/profile')}
                  className="block py-2 hover:text-sky-600 dark:hover:text-sky-400"
                >
                  Hồ sơ cá nhân
                </Link>
              </>
            )}

            {isAdmin && (
              <Link 
                to="/admin" 
                onClick={() => handleNavClick('/admin')}
                className="block py-2 text-indigo-600 dark:text-indigo-400 font-bold"
              >
                Bảng Quản Trị Hệ Thống
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.fullName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-sky-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {currentUser?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition shrink-0"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 rounded-xl shadow transition"
              >
                Đăng nhập / Đăng ký tài khoản
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
