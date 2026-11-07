import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarCheck, Map, Users, PlusCircle, 
  Trash2, Edit, DollarSign, ShieldAlert, X, Search, RefreshCw, Ticket 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { tourService, bookingService, userService } from '../services/api';
import { formatVND } from '../utils/format';
import ConfirmModal from '../components/ConfirmModal';
import ETicketModal from '../components/ETicketModal';

export default function AdminDashboardPage({ tours = [], onTourUpdated }) {
  const { currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'tours' | 'users'
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Modal Vé điện tử cho Admin
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Filter state
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [tourSearch, setTourSearch] = useState('');

  // Modals state
  const [isAddTourModalOpen, setIsAddTourModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);

  // Form Tour State (dùng cho cả Add và Edit)
  const [tourForm, setTourForm] = useState({
    title: '',
    category_name: 'Nghỉ dưỡng & Văn hóa',
    destination_name: '',
    departure_location: 'Hà Nội',
    transport_included: 'Xe Limousine cao cấp',
    transport_type: 'LIMOUSINE',
    region: 'Bắc',
    duration_days: 3,
    base_price: '',
    available_seats: 10,
    featured_image: '',
    itinerary_summary: ''
  });

  // Confirm delete modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: '', // 'DELETE_TOUR' | 'DELETE_USER'
    targetId: null
  });

  // Fetch dữ liệu qua effect an toàn
  useEffect(() => {
    if (!isAdmin) return;

    let ignore = false;
    Promise.all([bookingService.getAllBookings(), userService.getAllUsers()])
      .then(([bData, uData]) => {
        if (!ignore) {
          setBookings(bData);
          setUsers(uData);
          setLoadingBookings(false);
          setLoadingUsers(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoadingBookings(false);
          setLoadingUsers(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  // Thủ công làm mới dữ liệu
  const refreshAllData = async () => {
    setLoadingBookings(true);
    setLoadingUsers(true);
    try {
      const [bData, uData] = await Promise.all([
        bookingService.getAllBookings(),
        userService.getAllUsers()
      ]);
      setBookings(bData);
      setUsers(uData);
    } catch {
      showToast('Không thể làm mới dữ liệu!', 'error');
    } finally {
      setLoadingBookings(false);
      setLoadingUsers(false);
    }
  };

  // Bảo vệ phân quyền truy cập
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-rose-200 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">Từ Chối Quyền Truy Cập</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Khu vực Bảng Điều Khiển Quản Trị chỉ dành riêng cho tài khoản có vai trò <b>Quản Trị Viên (ADMIN)</b>.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl shadow hover:bg-sky-700 transition"
        >
          Quay Về Trang Chủ
        </Link>
      </div>
    );
  }

  // Thống kê số liệu
  const totalRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
  const pendingBookingsCount = bookings.filter((b) => b.status === 'PENDING').length;

  // Lọc bookings theo tab status
  const filteredBookings = bookings.filter((b) =>
    bookingStatusFilter === 'ALL' ? true : b.status === bookingStatusFilter
  );

  // Lọc tour theo search
  const filteredTours = tours.filter((t) =>
    tourSearch
      ? t.title.toLowerCase().includes(tourSearch.toLowerCase()) ||
        t.destination_name.toLowerCase().includes(tourSearch.toLowerCase())
      : true
  );

  // Thao tác duyệt / hủy booking
  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      showToast(`Đã cập nhật trạng thái đơn thành: ${status === 'CONFIRMED' ? 'Đã duyệt' : 'Đã hủy'}`, 'success');
      refreshAllData();
      if (onTourUpdated) onTourUpdated();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn!', 'error');
    }
  };

  // Mở modal thêm tour
  const handleOpenAddTour = () => {
    setTourForm({
      title: '',
      category_name: 'Nghỉ dưỡng & Văn hóa',
      destination_name: '',
      departure_location: 'Hà Nội',
      transport_included: 'Xe Limousine cao cấp',
      transport_type: 'LIMOUSINE',
      region: 'Bắc',
      duration_days: 3,
      base_price: '',
      available_seats: 10,
      featured_image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
      itinerary_summary: ''
    });
    setEditingTour(null);
    setIsAddTourModalOpen(true);
  };

  // Mở modal sửa tour
  const handleOpenEditTour = (tour) => {
    setEditingTour(tour);
    setTourForm({
      ...tour,
      title: tour.title,
      category_name: tour.category_name || 'Nghỉ dưỡng & Văn hóa',
      destination_name: tour.destination_name,
      departure_location: tour.departure_location || '',
      transport_included: tour.transport_included || '',
      transport_type: tour.transport_type || 'LIMOUSINE',
      region: tour.region,
      duration_days: tour.duration_days,
      base_price: tour.base_price,
      available_seats: tour.available_seats,
      featured_image: tour.featured_image,
      itinerary_summary: tour.itinerary_summary,
      mood_id: tour.mood_id || 'healing',
      mood_label: tour.mood_label || 'Chữa Lành & Tĩnh Tại',
      mood_tag: tour.mood_tag || '#ChữaLành',
      emotional_quote: tour.emotional_quote || ''
    });
    setIsAddTourModalOpen(true);
  };

  // Submit Lưu Tour (Thêm hoặc Sửa)
  const handleSaveTourSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTour) {
        await tourService.updateTour(editingTour.id, {
          ...tourForm,
          base_price: Number(tourForm.base_price),
          available_seats: Number(tourForm.available_seats),
          duration_days: Number(tourForm.duration_days)
        });
        showToast('Cập nhật tour thành công!', 'success');
      } else {
        await tourService.createTour({
          ...tourForm,
          base_price: Number(tourForm.base_price),
          available_seats: Number(tourForm.available_seats),
          duration_days: Number(tourForm.duration_days)
        });
        showToast('Thêm tour du lịch mới thành công!', 'success');
      }
      setIsAddTourModalOpen(false);
      if (onTourUpdated) onTourUpdated();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi lưu tour!', 'error');
    }
  };

  // Xóa tour
  const handleDeleteTourConfirm = async () => {
    try {
      await tourService.deleteTour(confirmModal.targetId);
      showToast('Đã xóa tour thành công!', 'success');
      setConfirmModal({ isOpen: false, targetId: null });
      if (onTourUpdated) onTourUpdated();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi xóa tour!', 'error');
    }
  };

  // Đổi role người dùng
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    try {
      await userService.updateRole(userId, newRole);
      showToast(`Đã cập nhật vai trò người dùng thành ${newRole}!`, 'success');
      refreshAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể đổi vai trò!', 'error');
    }
  };

  // Xóa người dùng
  const handleDeleteUserConfirm = async () => {
    try {
      await userService.deleteUser(confirmModal.targetId);
      showToast('Đã xóa người dùng khỏi hệ thống!', 'success');
      setConfirmModal({ isOpen: false, targetId: null });
      refreshAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi xóa người dùng!', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* 1. HEADER & THỐNG KÊ TỔNG QUAN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Hệ Thống Quản Trị Trung Tâm
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Bảng Điều Khiển Quản Trị (Admin)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi doanh thu, điều hành tour du lịch, duyệt đơn và quản lý người dùng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              refreshAllData();
              if (onTourUpdated) onTourUpdated();
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <button
            onClick={handleOpenAddTour}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Tour Mới</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Thống kê KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs">
            <span>Doanh thu đã duyệt</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatVND(totalRevenue)}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Từ các đơn hàng thành công</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs">
            <span>Tổng đơn đặt tour</span>
            <CalendarCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {bookings.length}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
            {pendingBookingsCount} đơn đang chờ duyệt
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs">
            <span>Tour đang mở bán</span>
            <Map className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {tours.length}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Trải dài khắp 3 miền</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs">
            <span>Thành viên hệ thống</span>
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {users.length}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Tài khoản quản lý & khách</span>
        </div>
      </div>

      {/* 2. TAB ĐIỀU HƯỚNG CHÍNH */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-3 px-4 font-extrabold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Yêu Cầu Đặt Tour ({bookings.length})</span>
          {pendingBookingsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">
              {pendingBookingsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tours')}
          className={`py-3 px-4 font-extrabold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tours'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Quản Lý Tour ({tours.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 font-extrabold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản Lý Người Dùng ({users.length})</span>
        </button>
      </div>

      {/* 3. NỘI DUNG TỪNG TAB */}

      {/* TAB 1: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Bộ lọc trạng thái */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
              <span>Lọc trạng thái:</span>
              {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    bookingStatusFilter === st
                      ? 'bg-slate-900 dark:bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st === 'ALL'
                    ? 'Tất cả'
                    : st === 'PENDING'
                    ? 'Chờ duyệt'
                    : st === 'CONFIRMED'
                    ? 'Đã duyệt'
                    : 'Đã hủy'}
                </button>
              ))}
            </div>

            <span className="text-slate-400 dark:text-slate-500">
              Hiển thị {filteredBookings.length} đơn hàng
            </span>
          </div>

          {/* Bảng đơn hàng */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Mã đơn</th>
                    <th className="p-4">Khách hàng</th>
                    <th className="p-4">Tour du lịch</th>
                    <th className="p-4">Ngày khởi hành</th>
                    <th className="p-4">Số vé</th>
                    <th className="p-4">Tổng tiền</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {loadingBookings ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400 dark:text-slate-500">Đang tải đơn hàng...</td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400 dark:text-slate-500">Không có đơn đặt tour nào phù hợp.</td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition">
                        <td className="p-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                          BK-{b.id.toString().slice(-6)}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">{b.customerName}</div>
                          <div className="text-slate-400 dark:text-slate-500">{b.phone}</div>
                          <div className="text-slate-400 dark:text-slate-500 text-[10px]">{b.email}</div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="font-semibold line-clamp-2 text-slate-800 dark:text-slate-200">{b.tourTitle}</p>
                          {b.note && <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">"{b.note}"</span>}
                        </td>
                        <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{b.departureDate || 'Theo lịch'}</td>
                        <td className="p-4 font-bold">{b.seats} vé</td>
                        <td className="p-4 font-black text-orange-600 dark:text-orange-400 font-mono">
                          {formatVND(b.totalPrice)}
                          {b.discountAmount > 0 && (
                            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                              (Đã giảm {formatVND(b.discountAmount)})
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              b.status === 'CONFIRMED'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : b.status === 'CANCELLED'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {b.status === 'CONFIRMED'
                              ? 'Đã duyệt'
                              : b.status === 'CANCELLED'
                              ? 'Đã hủy'
                              : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Nút xem vé E-Ticket cho Admin (Chỉ hiển thị khi đơn đã duyệt) */}
                          {b.status === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBookingForTicket(b);
                                setIsTicketModalOpen(true);
                              }}
                              className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 rounded-lg font-bold text-[11px] border border-amber-300 dark:border-amber-700 shadow-xs transition inline-flex items-center gap-1"
                              title="Xem vé điện tử Boarding Pass"
                            >
                              <Ticket className="w-3 h-3" />
                              <span>Vé E-Ticket</span>
                            </button>
                          )}

                          {b.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition"
                              >
                                Hủy
                              </button>
                            </>
                          )}
                          {b.status !== 'PENDING' && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic pl-1">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUẢN LÝ TOURS */}
      {activeTab === 'tours' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm text-xs">
            <div className="relative flex items-center flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Tìm tour trong danh mục..."
                value={tourSearch}
                onChange={(e) => setTourSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <button
              onClick={handleOpenAddTour}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Thêm Tour Mới
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Hình ảnh & Tên tour</th>
                    <th className="p-4">Điểm đến</th>
                    <th className="p-4">Vùng</th>
                    <th className="p-4">Thời lượng</th>
                    <th className="p-4">Chỗ trống</th>
                    <th className="p-4">Giá cơ bản</th>
                    <th className="p-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredTours.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition">
                      <td className="p-4 flex items-center gap-3 max-w-md">
                        <img
                          src={t.featured_image}
                          alt={t.title}
                          className="w-14 h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{t.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                            <span>{t.category_name}</span>
                            {t.departure_location && (
                              <span>• Đi từ: <b className="text-slate-600 dark:text-slate-300">{t.departure_location}</b></span>
                            )}
                            {t.transport_included && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• {t.transport_included}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{t.destination_name}</td>
                      <td className="p-4">Miền {t.region}</td>
                      <td className="p-4 font-medium">{t.duration_days} ngày</td>
                      <td className="p-4">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{t.available_seats} chỗ</span>
                      </td>
                      <td className="p-4 font-black text-orange-600 dark:text-orange-400 font-mono">{formatVND(t.base_price)}</td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditTour(t)}
                          className="p-1.5 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Chỉnh sửa tour"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              title: 'Xóa tour du lịch?',
                              message: `Bạn có chắc chắn muốn xóa "${t.title}"? Dữ liệu liên quan có thể bị ảnh hưởng.`,
                              type: 'DELETE_TOUR',
                              targetId: t.id
                            })
                          }
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Xóa tour"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUẢN LÝ NGƯỜI DÙNG */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4">Địa chỉ Email</th>
                    <th className="p-4">Số điện thoại</th>
                    <th className="p-4">Vai trò hệ thống</th>
                    <th className="p-4">Ngày đăng ký</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 dark:text-slate-500">Đang nạp danh sách tài khoản...</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition">
                        <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.fullName}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  e.currentTarget.nextSibling.style.display = 'flex';
                                }
                              }}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : null}
                          <div
                            style={{ display: u.avatar ? 'none' : 'flex' }}
                            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 items-center justify-center font-black text-xs shrink-0"
                          >
                            {u.fullName?.charAt(0) || 'U'}
                          </div>
                          <span>{u.fullName}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{u.email}</td>
                        <td className="p-4 text-slate-700 dark:text-slate-300">{u.phone || 'Chưa cập nhật'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {u.role === 'ADMIN' ? '👑 QUẢN TRỊ VIÊN' : '👤 KHÁCH HÀNG'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 dark:text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mặc định'}
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          {u.id !== currentUser?.id && (
                            <>
                              <button
                                onClick={() => handleToggleUserRole(u.id, u.role)}
                                className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 transition"
                              >
                                Đổi thành {u.role === 'ADMIN' ? 'Customer' : 'Admin'}
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Xóa người dùng?',
                                    message: `Bạn có chắc muốn xóa tài khoản "${u.email}" khỏi hệ thống?`,
                                    type: 'DELETE_USER',
                                    targetId: u.id
                                  })
                                }
                                className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </>
                          )}
                          {u.id === currentUser?.id && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">(Đang đăng nhập)</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL THÊM / SỬA TOUR DU LỊCH */}
      {isAddTourModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 max-h-[90vh] flex flex-col text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {editingTour ? 'Chỉnh Sửa Thông Tin Tour' : 'Thêm Tour Du Lịch Mới'}
              </h3>
              <button onClick={() => setIsAddTourModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTourSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Tour Du Lịch *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khám Phá Vịnh Hạ Long 2 Ngày 1 Đêm"
                  value={tourForm.title}
                  onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Điểm đến (Tỉnh/Thành phố) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Quảng Ninh, Nha Trang..."
                    value={tourForm.destination_name}
                    onChange={(e) => setTourForm({ ...tourForm, destination_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vùng miền *</label>
                  <select
                    value={tourForm.region}
                    onChange={(e) => setTourForm({ ...tourForm, region: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 text-xs [&>option]:bg-white dark:[&>option]:bg-slate-900"
                  >
                    <option value="Bắc">Miền Bắc</option>
                    <option value="Trung">Miền Trung</option>
                    <option value="Nam">Miền Nam</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Điểm khởi hành *</label>
                  <input
                    type="text"
                    required
                    placeholder="Hà Nội, TP. Hồ Chí Minh..."
                    value={tourForm.departure_location}
                    onChange={(e) => setTourForm({ ...tourForm, departure_location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gói phương tiện đã bao gồm *</label>
                  <input
                    type="text"
                    required
                    placeholder="Đã bao gồm vé máy bay khứ hồi / xe Limousine..."
                    value={tourForm.transport_included}
                    onChange={(e) => setTourForm({ ...tourForm, transport_included: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Giá cơ bản (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    placeholder="3500000"
                    value={tourForm.base_price}
                    onChange={(e) => setTourForm({ ...tourForm, base_price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Thời lượng (Số ngày)</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={tourForm.duration_days}
                    onChange={(e) => setTourForm({ ...tourForm, duration_days: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số chỗ khả dụng</label>
                  <input
                    type="number"
                    min="1"
                    value={tourForm.available_seats}
                    onChange={(e) => setTourForm({ ...tourForm, available_seats: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Loại hình / Danh mục</label>
                <input
                  type="text"
                  placeholder="Nghỉ dưỡng, Biển đảo, Khám phá núi..."
                  value={tourForm.category_name}
                  onChange={(e) => setTourForm({ ...tourForm, category_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Link Ảnh Đại Diện (URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={tourForm.featured_image}
                  onChange={(e) => setTourForm({ ...tourForm, featured_image: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tóm Tắt Lịch Trình & Điểm Nhấn</label>
                <textarea
                  rows="3"
                  placeholder="Mô tả các hoạt động chính, điểm tham quan nổi bật của chuyến đi..."
                  value={tourForm.itinerary_summary}
                  onChange={(e) => setTourForm({ ...tourForm, itinerary_summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTourModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow"
                >
                  {editingTour ? 'Lưu Cập Nhật' : 'Tạo Tour Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL XÁC NHẬN NGUY HIỂM (DELETE) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Xác nhận xóa"
        cancelText="Đóng"
        isDanger={true}
        onConfirm={() => {
          if (confirmModal.type === 'DELETE_TOUR') handleDeleteTourConfirm();
          if (confirmModal.type === 'DELETE_USER') handleDeleteUserConfirm();
        }}
        onCancel={() => setConfirmModal({ isOpen: false, targetId: null })}
      />

      {/* Modal Vé Điện Tử Boarding Pass cho Admin xem & in */}
      <ETicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={selectedBookingForTicket}
        tour={tours.find((t) => t.id === selectedBookingForTicket?.tourId)}
      />

    </div>
  );
}
