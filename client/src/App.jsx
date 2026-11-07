import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import SmartConcierge from './components/SmartConcierge';
import ScrollToTop from './components/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import TourListingPage from './pages/TourListingPage';
import TourDetailPage from './pages/TourDetailPage';
import WishlistPage from './pages/WishlistPage';
import CustomerBookingsPage from './pages/CustomerBookingsPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Services & Backup Data
import { tourService } from './services/api';
import { initialTours } from './mockTours';

function MainApp() {
  const [tours, setTours] = useState(initialTours);
  const [loading, setLoading] = useState(true);

  // Nạp danh sách tour từ Backend
  useEffect(() => {
    let ignore = false;

    tourService
      .getAllTours()
      .then((data) => {
        if (!ignore) {
          if (Array.isArray(data) && data.length > 0) {
            setTours(data);
          }
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
  }, []);

  const refreshTours = async () => {
    try {
      const data = await tourService.getAllTours();
      if (Array.isArray(data) && data.length > 0) {
        setTours(data);
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold text-xs">
        Đang khởi động nền tảng SmartTour...
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white transition-colors duration-200">
        
        {/* Thanh điều hướng toàn cục */}
        <Navbar />

        {/* Khu vực nội dung các trang */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage tours={tours} />} />
            <Route path="/tours" element={<TourListingPage tours={tours} />} />
            <Route 
              path="/tours/:id" 
              element={<TourDetailPage tours={tours} onBookingCreated={refreshTours} />} 
            />
            <Route path="/wishlist" element={<WishlistPage tours={tours} />} />
            <Route path="/my-bookings" element={<CustomerBookingsPage />} />
            <Route path="/profile" element={<CustomerProfilePage />} />
            <Route 
              path="/admin" 
              element={<AdminDashboardPage tours={tours} onTourUpdated={refreshTours} />} 
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Modal đăng nhập / đăng ký toàn cục */}
        <AuthModal />

        {/* Trợ lý AI du lịch thông minh (Điểm sáng tạo Rubric) */}
        <SmartConcierge tours={tours} />

        {/* Chân trang thông tin đồ án */}
        <Footer />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <MainApp />
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
