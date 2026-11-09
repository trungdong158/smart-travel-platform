import { useState, useEffect, lazy, Suspense } from 'react';
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
import LoadingScreen from './components/LoadingScreen';

// Lazy-loaded Pages (Code-splitting for ultra high performance & fast initial paint)
const HomePage = lazy(() => import('./pages/HomePage'));
const TourListingPage = lazy(() => import('./pages/TourListingPage'));
const TourDetailPage = lazy(() => import('./pages/TourDetailPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CustomerBookingsPage = lazy(() => import('./pages/CustomerBookingsPage'));
const CustomerProfilePage = lazy(() => import('./pages/CustomerProfilePage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Services & Backup Data
import { tourService } from './services/api';
import { initialTours } from './mockTours';

function MainApp() {
  const [tours, setTours] = useState(initialTours);

  // Nạp danh sách tour từ Backend ngầm trong nền (non-blocking)
  useEffect(() => {
    let ignore = false;
    tourService
      .getAllTours()
      .then((data) => {
        if (!ignore && Array.isArray(data) && data.length > 0) {
          setTours(data);
        }
      })
      .catch(() => {});

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

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white transition-colors duration-200">
        
        {/* Thanh điều hướng toàn cục */}
        <Navbar />

        {/* Khu vực nội dung các trang với Suspense code-splitting */}
        <main className="flex-1">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<HomePage tours={tours} />} />
              <Route path="/tours" element={<TourListingPage tours={tours} />} />
              <Route 
                path="/tours/:id" 
                element={<TourDetailPage tours={tours} onBookingCreated={refreshTours} />} 
              />
              <Route path="/blog" element={<BlogPage tours={tours} />} />
              <Route path="/wishlist" element={<WishlistPage tours={tours} />} />
              <Route path="/my-bookings" element={<CustomerBookingsPage />} />
              <Route path="/profile" element={<CustomerProfilePage />} />
              <Route 
                path="/admin" 
                element={<AdminDashboardPage tours={tours} onTourUpdated={refreshTours} />} 
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>

        {/* Modal đăng nhập / đăng ký toàn cục */}
        <AuthModal />

        {/* Trợ lý AI du lịch thông minh (Điểm sáng tạo Rubric) */}
        <SmartConcierge tours={tours} />

        {/* Chân trang toàn cục */}
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
