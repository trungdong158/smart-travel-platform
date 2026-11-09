import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Phone, ShieldCheck, CheckCircle2, 
  Camera, Upload, Link as LinkIcon, Sparkles, 
  Trash2, X, Check, Eye, BookOpen, Heart, 
  MessageCircle, MapPin, Calendar, ArrowRight, Plus, 
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService, blogService } from '../services/api';
import PasswordInput from '../components/PasswordInput';
import ConfirmModal from '../components/ConfirmModal';
import { validatePhoneNumber } from '../utils/validation';

// Bộ sưu tập avatar du lịch phong cách tuyển chọn
const PRESET_AVATARS = [
  {
    id: 'preset-1',
    label: 'Du khách năng động',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-2',
    label: 'Phượt thủ trẻ trung',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-3',
    label: 'Khám phá thiên nhiên',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-4',
    label: 'Du khách thanh lịch',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-5',
    label: 'Nhiếp ảnh gia du lịch',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-6',
    label: 'Nghỉ dưỡng biển xanh',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-7',
    label: 'Chinh phục đỉnh núi',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'preset-8',
    label: 'Dạo bước phố cổ',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
  }
];

// Helper nén và cắt ảnh vuông tỉ lệ 1:1 siêu nhẹ (max 400x400)
function resizeImageToSquare(file, targetSize = 400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Vui lòng chọn một file hình ảnh hợp lệ (JPG, PNG, WEBP)!'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          // Cắt vuông từ tâm ảnh (Center-crop)
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Không thể đọc file ảnh đã chọn!'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Lỗi khi tải file từ thiết bị!'));
    reader.readAsDataURL(file);
  });
}

export default function CustomerProfilePage() {
  const { currentUser, updateProfile, openAuthModal, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // State Tabs: 'profile' (Hồ sơ & Bảo mật) | 'my_blogs' (Bài viết của tôi)
  const [activeTab, setActiveTab] = useState('profile');

  // State danh sách bài viết của người dùng
  const [myBlogs, setMyBlogs] = useState([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingBlog, setIsDeletingBlog] = useState(false);

  // State thông tin cá nhân
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Kiểm tra số điện thoại khi người dùng nhập xong và chuyển sang ô khác (blur)
  const handlePhoneBlur = () => {
    if (phone && phone.trim()) {
      const res = validatePhoneNumber(phone, false);
      if (!res.isValid) {
        setPhoneError('Vui lòng nhập số điện thoại đúng định dạng.');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  // State đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // State Modal chỉnh sửa ảnh đại diện
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarTab, setAvatarTab] = useState('upload'); // 'upload' | 'url' | 'presets'
  const [tempAvatar, setTempAvatar] = useState(currentUser?.avatar || '');
  const [customUrl, setCustomUrl] = useState('');
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Hàm làm mới danh sách bài viết do người dùng đăng
  const fetchMyBlogs = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingBlogs(true);
    try {
      const res = await blogService.getMyBlogs();
      if (res && res.data) {
        setMyBlogs(res.data);
      } else if (Array.isArray(res)) {
        setMyBlogs(res);
      } else {
        setMyBlogs([]);
      }
    } catch (err) {
      console.warn('Lỗi khi tải bài viết cá nhân:', err);
      try {
        const allRes = await blogService.getAllBlogs({ limit: 100 });
        if (allRes && allRes.data) {
          const userBlogs = allRes.data.filter(b => 
            b.author && (
              String(b.author.id) === String(currentUser?.id) ||
              (b.author.email && b.author.email.toLowerCase() === (currentUser?.email || '').toLowerCase())
            )
          );
          setMyBlogs(userBlogs);
        }
      } catch {
        // Fallback im lặng
      }
    } finally {
      setIsLoadingBlogs(false);
    }
  }, [isAuthenticated, currentUser]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    let active = true;
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          const res = await blogService.getMyBlogs();
          if (!active) return;
          if (res && res.data) {
            setMyBlogs(res.data);
          } else if (Array.isArray(res)) {
            setMyBlogs(res);
          }
        } catch {
          try {
            const allRes = await blogService.getAllBlogs({ limit: 100 });
            if (!active) return;
            if (allRes && allRes.data) {
              const userBlogs = allRes.data.filter(b => 
                b.author && (
                  String(b.author.id) === String(currentUser?.id) ||
                  (b.author.email && b.author.email.toLowerCase() === (currentUser?.email || '').toLowerCase())
                )
              );
              setMyBlogs(userBlogs);
            }
          } catch {
            // im lặng
          }
        } finally {
          if (active) {
            setIsLoadingBlogs(false);
          }
        }
      };
      loadData();
    }
    return () => {
      active = false;
    };
  }, [isAuthenticated, currentUser]);

  // Xóa bài viết cá nhân
  const handleDeleteBlog = (blog) => {
    setBlogToDelete(blog);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteBlog = async () => {
    if (!blogToDelete) return;
    setIsDeletingBlog(true);
    try {
      await blogService.deleteBlog(blogToDelete.id);
      showToast('Đã xóa bài viết thành công!', 'success');
      setMyBlogs(prev => prev.filter(b => b.id !== blogToDelete.id));
      await fetchMyBlogs();
      setIsDeleteModalOpen(false);
      setBlogToDelete(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể xóa bài viết!', 'error');
    } finally {
      setIsDeletingBlog(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
        <User className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Yêu Cầu Đăng Nhập</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Vui lòng đăng nhập để xem và quản lý thông tin hồ sơ thành viên của bạn.
        </p>
        <button
          onClick={openAuthModal}
          className="px-6 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl shadow hover:bg-sky-700 transition"
        >
          Đăng Nhập Ngay
        </button>
      </div>
    );
  }

  // Mở modal đổi ảnh đại diện
  const handleOpenAvatarModal = () => {
    setTempAvatar(currentUser?.avatar || '');
    setCustomUrl(currentUser?.avatar && currentUser.avatar.startsWith('http') ? currentUser.avatar : '');
    setIsAvatarModalOpen(true);
  };

  // Xử lý chọn ảnh từ thiết bị
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Đang nạp và tối ưu ảnh đại diện...', 'info');
      const optimizedBase64 = await resizeImageToSquare(file, 400, 0.85);
      setTempAvatar(optimizedBase64);
      showToast('Đã tải ảnh lên thành công! Bấm "Lưu Ảnh Đại Diện" để áp dụng.', 'success');
    } catch (err) {
      showToast(err.message || 'Không thể xử lý ảnh từ máy tính/điện thoại!', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Xử lý nhập URL bên ngoài
  const handleApplyUrl = () => {
    const trimmed = customUrl.trim();
    if (!trimmed) {
      showToast('Vui lòng dán đường link URL hình ảnh!', 'error');
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      showToast('Đường link hình ảnh phải bắt đầu bằng http:// hoặc https://', 'error');
      return;
    }
    setTempAvatar(trimmed);
    showToast('Đã chọn ảnh từ liên kết! Bấm "Lưu Ảnh Đại Diện" để áp dụng.', 'success');
  };

  // Lưu ảnh đại diện từ Modal
  const handleSaveAvatar = async () => {
    setIsSavingAvatar(true);
    try {
      await updateProfile({ avatar: tempAvatar });
      showToast('Cập nhật ảnh đại diện thành công!', 'success');
      setIsAvatarModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể lưu ảnh đại diện!', 'error');
    } finally {
      setIsSavingAvatar(false);
    }
  };

  // Gỡ ảnh đại diện (trở về chữ cái mặc định)
  const handleRemoveAvatar = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ ảnh đại diện và quay về chữ cái mặc định?')) {
      return;
    }
    try {
      await updateProfile({ avatar: '' });
      setTempAvatar('');
      setCustomUrl('');
      showToast('Đã gỡ ảnh đại diện thành công!', 'success');
      setIsAvatarModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi gỡ ảnh đại diện!', 'error');
    }
  };

  // Submit cập nhật hồ sơ (Họ tên, SĐT)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Họ tên không được để trống!', 'error');
      return;
    }

    const phoneValidation = validatePhoneNumber(phone, false);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.message);
      showToast(phoneValidation.message, 'error');
      return;
    }

    // Kiểm tra định dạng số điện thoại nếu người dùng nhập
    if (phone && phone.trim()) {
      const phoneValidation = validatePhoneNumber(phone, false);
      if (!phoneValidation.isValid) {
        setPhoneError('Vui lòng nhập số điện thoại đúng định dạng.');
        showToast('Vui lòng nhập số điện thoại đúng định dạng.', 'error');
        return;
      }
    }

    setIsUpdatingProfile(true);
    try {
      await updateProfile({ fullName, phone });
      showToast('Cập nhật thông tin cá nhân thành công!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi cập nhật hồ sơ!', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Submit đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại!', 'error');
      return;
    }

    if (newPassword === currentPassword) {
      showToast('Mật khẩu mới không được trùng với mật khẩu hiện tại.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Xác nhận mật khẩu mới không trùng khớp!', 'error');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await authService.changePassword({ currentPassword, newPassword });
      showToast(res.message || 'Đổi mật khẩu thành công!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể đổi mật khẩu!', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
          <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          Tài Khoản Thành Viên
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          {activeTab === 'profile' ? 'Thông Tin Cá Nhân' : 'Bài Viết Trải Nghiệm'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {activeTab === 'profile' 
            ? 'Quản lý thông tin liên hệ, ảnh đại diện và cài đặt bảo mật cho tài khoản của bạn'
            : 'Xem và quản lý các câu chuyện du lịch, cảm xúc và kỷ niệm bạn đã chia sẻ cùng cộng đồng'}
        </p>
      </div>

      {/* Tabs chuyển đổi giữa Hồ Sơ & Bài Viết Của Tôi */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-3 text-[11px] sm:text-sm font-bold border-b-2 transition -mb-px ${
            activeTab === 'profile'
              ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Hồ Sơ & Bảo Mật</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('my_blogs');
            fetchMyBlogs();
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-3 text-[11px] sm:text-sm font-bold border-b-2 transition -mb-px ${
            activeTab === 'my_blogs'
              ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bài Viết Của Tôi</span>
          {myBlogs.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[10px] font-black rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
              {myBlogs.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: THÔNG TIN HỒ SƠ & BẢO MẬT */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Cột trái: Tóm tắt thông tin tài khoản & Ảnh đại diện */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm text-center space-y-4">
            
            {/* Vùng Avatar có nút đổi nhanh */}
            <div className="relative w-24 h-24 mx-auto group">
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
                  className="w-24 h-24 rounded-full object-cover shadow-md ring-4 ring-sky-500/20 group-hover:ring-sky-500/50 transition-all duration-300"
                />
              ) : null}

              <div
                style={{ display: currentUser?.avatar ? 'none' : 'flex' }}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-3xl items-center justify-center shadow-md ring-4 ring-sky-500/20 group-hover:ring-sky-500/50 transition-all duration-300"
              >
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>

              {/* Nút camera nhỏ ở góc avatar */}
              <button
                type="button"
                onClick={handleOpenAvatarModal}
                aria-label="Đổi ảnh đại diện"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-lg ring-2 ring-white dark:ring-slate-900 transition hover:scale-110 active:scale-95"
                title="Chỉnh sửa ảnh đại diện"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Các nút thao tác ảnh đại diện */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={handleOpenAvatarModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200/80 dark:border-sky-800/80 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Đổi ảnh đại diện</span>
              </button>

              {currentUser?.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="block mx-auto text-[11px] text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 pt-1 transition"
                >
                  Gỡ ảnh đại diện
                </button>
              )}
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{currentUser?.fullName}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">{currentUser?.email}</p>
              <span className="inline-block mt-2 text-[11px] font-bold px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300">
                {currentUser?.role === 'ADMIN' ? '👑 Quản Trị Viên' : 'Thành Viên SoulTrip'}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-left text-xs space-y-2 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Tài khoản đã xác thực</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Quyền đặt tour trực tuyến</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('my_blogs');
                  fetchMyBlogs();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-100 dark:border-sky-800/60 group transition text-left"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-200">
                  <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Bài Viết Của Tôi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-sky-200/80 dark:bg-sky-800 text-sky-800 dark:text-sky-200">
                    {myBlogs.length}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Cột phải: 2 Form (Cập nhật thông tin + Đổi mật khẩu) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Form 1: Cập nhật họ tên & số điện thoại */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>Thông Tin Liên Hệ</span>
              <span className="text-xs font-normal text-slate-400">Cập nhật hồ sơ</span>
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Địa chỉ Email</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Email dùng để đăng nhập và nhận thông tin xác nhận vé</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Họ và tên</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại</label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    onBlur={handlePhoneBlur}
                    className={`w-full pl-10 pr-3 py-2 text-xs border ${
                      phoneError
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 dark:focus:ring-rose-950/40'
                        : 'border-slate-200 dark:border-slate-700 focus:border-sky-500'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none transition`}
                  />
                </div>
                {phoneError && (
                  <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                    {phoneError}
                  </span>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Đổi mật khẩu */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Đổi Mật Khẩu
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mật khẩu hiện tại
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      showToast(
                        `Đã gửi hướng dẫn khôi phục mật khẩu đến email ${currentUser?.email || ''} (Tính năng mô phỏng)`,
                        'info'
                      );
                    }}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline font-semibold cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <PasswordInput
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mật khẩu mới</label>
                <PasswordInput
                  required
                  minLength={6}
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nhập lại mật khẩu mới</label>
                <PasswordInput
                  required
                  minLength={6}
                  placeholder="Khớp với mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
                >
                  {isChangingPass ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
      )}

      {/* TAB 2: BÀI VIẾT CỦA TÔI */}
      {activeTab === 'my_blogs' && (
        <div className="space-y-6">
          {/* Header thanh công cụ quản lý bài viết */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Bài Viết Trải Nghiệm Của Tôi
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                  {myBlogs.length} bài viết
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lưu giữ những xúc cảm chân thực, kỷ niệm vui buồn và đánh giá điểm đến trong mỗi chuyến đi
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Viết Bài Mới</span>
              </Link>
            </div>
          </div>

          {/* Trạng thái đang tải */}
          {isLoadingBlogs && (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Đang tải danh sách bài viết của bạn...</p>
            </div>
          )}

          {/* Trạng thái chưa có bài viết */}
          {!isLoadingBlogs && myBlogs.length === 0 && (
            <div className="p-12 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Bạn chưa đăng bài viết nào
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Mỗi chuyến đi đều có những khoảnh khắc đáng nhớ. Hãy chia sẻ trải nghiệm và cảm xúc của bạn lên SoulTrip Blog nhé!
                </p>
              </div>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Chia Sẻ Bài Viết Đầu Tiên</span>
              </Link>
            </div>
          )}

          {/* Danh sách bài viết */}
          {!isLoadingBlogs && myBlogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myBlogs.map((blog) => {
                const cover = (blog.images && blog.images[0]) || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
                const createdDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: '2-digit', year: 'numeric'
                }) : '';

                return (
                  <div
                    key={blog.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 group"
                  >
                    {/* Ảnh bài viết & Mood Badge */}
                    <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={cover}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20 pointer-events-none" />

                      {/* Badge Tâm trạng & Trạng thái duyệt */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-100 shadow-sm">
                          <span>✨</span>
                          <span>{blog.moodLabel || 'Trải Nghiệm Du Lịch'}</span>
                        </span>

                        {blog.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm animate-pulse">
                            ⏳ Chờ duyệt
                          </span>
                        ) : blog.status === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm">
                            ✗ Bị từ chối
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm">
                            ✓ Đã duyệt
                          </span>
                        )}
                      </div>

                      {/* Location pill */}
                      {blog.location && (
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-900/70 backdrop-blur-md text-white">
                            <MapPin className="w-3 h-3 text-sky-400" />
                            <span>{blog.location}</span>
                          </span>
                        </div>
                      )}

                      {/* Số lượng ảnh nếu > 1 */}
                      {blog.images && blog.images.length > 1 && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-slate-900/70 text-white text-[10px] font-bold">
                          +{blog.images.length - 1} ảnh
                        </div>
                      )}
                    </div>

                    {/* Nội dung bài viết */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Đã đăng: {createdDate}</span>
                        </div>

                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                          {blog.title}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                          {blog.content}
                        </p>
                      </div>

                      {/* Thẻ Tour gắn kèm nếu có */}
                      {blog.tour && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {blog.tour.featured_image && (
                              <img
                                src={blog.tour.featured_image}
                                alt={blog.tour.title}
                                className="w-10 h-10 rounded-xl object-cover shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                                Gắn thẻ chuyến đi
                              </span>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {blog.tour.title}
                              </h4>
                            </div>
                          </div>

                          <Link
                            to={`/tours/${blog.tour.id}`}
                            className="shrink-0 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <span>Xem Tour</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      {/* Thống kê tương tác & Nút thao tác */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span>{blog.likes || 0}</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 text-sky-500" />
                            <span>{blog.comments ? blog.comments.length : 0}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/blog?id=${encodeURIComponent(blog.id)}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition"
                          >
                            <span>Xem trên Blog</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteBlog(blog)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL CHỌN & CẬP NHẬT ẢNH ĐẠI DIỆN */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-50 dark:bg-sky-950/60 rounded-xl text-sky-600 dark:text-sky-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Cập Nhật Ảnh Đại Diện</h3>
                  <p className="text-[11px] text-slate-400">Chọn ảnh từ thiết bị hoặc liên kết bên ngoài</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vùng Xem trước Ảnh Đang Chọn (Live Preview) */}
            <div className="flex items-center gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <div className="relative w-16 h-16 shrink-0">
                {tempAvatar ? (
                  <img
                    src={tempAvatar}
                    alt="Xem trước"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                    }}
                    className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-sky-500/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-sm">
                    {currentUser?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                  <Eye className="w-3.5 h-3.5 text-sky-500" />
                  <span>Xem trước ảnh đại diện</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {tempAvatar ? (tempAvatar.startsWith('data:') ? 'Ảnh từ thiết bị của bạn' : tempAvatar) : 'Chưa chọn ảnh (sẽ hiển thị chữ cái mặc định)'}
                </p>
                {tempAvatar && (
                  <button
                    type="button"
                    onClick={() => setTempAvatar('')}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold mt-1 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Bỏ chọn</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3 Tabs Lựa chọn nguồn ảnh */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  avatarTab === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Từ Thiết Bị</span>
              </button>

              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  avatarTab === 'url'
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link Ngoài (URL)</span>
              </button>

              <button
                type="button"
                onClick={() => setAvatarTab('presets')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  avatarTab === 'presets'
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kho Có Sẵn</span>
              </button>
            </div>

            {/* TAB 1: TẢI ẢNH TỪ MÁY */}
            {avatarTab === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Bấm vào đây để chọn ảnh từ máy tính hoặc điện thoại
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hỗ trợ định dạng JPG, PNG, WEBP (Tự động cắt vuông & tối ưu hóa dung lượng nhẹ)
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: NHẬP LINK BÊN NGOÀI */}
            {avatarTab === 'url' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Đường dẫn ảnh trực tiếp (URL)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... hoặc link ảnh bất kỳ"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyUrl();
                          }
                        }}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs rounded-xl shadow transition"
                    >
                      Áp Dụng
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    Mẹo: Bạn có thể sao chép liên kết hình ảnh từ Google Images, Facebook, Pinterest hoặc Unsplash để làm avatar.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: KHO AVATAR CÓ SẴN */}
            {avatarTab === 'presets' && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400">Chọn nhanh một avatar du lịch chất lượng cao:</p>
                <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-1">
                  {PRESET_AVATARS.map((p) => {
                    const isSelected = tempAvatar === p.url;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setTempAvatar(p.url);
                          showToast(`Đã chọn "${p.label}"!`, 'info');
                        }}
                        className={`group relative rounded-2xl overflow-hidden aspect-square border-2 transition ${
                          isSelected
                            ? 'border-sky-500 ring-2 ring-sky-500/30 scale-105'
                            : 'border-slate-200 dark:border-slate-700 hover:border-sky-400 hover:scale-102'
                        }`}
                      >
                        <img
                          src={p.url}
                          alt={p.label}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-sky-600/30 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center shadow">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[9px] py-0.5 truncate px-1 text-center font-medium">
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {currentUser?.avatar ? (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-500 hover:text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ảnh hiện tại</span>
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={isSavingAvatar}
                  onClick={handleSaveAvatar}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition disabled:opacity-50"
                >
                  {isSavingAvatar ? 'Đang lưu...' : 'Lưu Ảnh Đại Diện'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA BÀI VIẾT */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Bạn có chắc muốn xóa bài viết này?"
        message={`Bài viết "${blogToDelete?.title || ''}" sẽ bị xóa vĩnh viễn khỏi hệ thống.`}
        confirmText={isDeletingBlog ? 'Đang xóa...' : 'Chắc chắn'}
        cancelText="Bỏ qua"
        isDanger={true}
        onConfirm={confirmDeleteBlog}
        onCancel={() => {
          if (!isDeletingBlog) {
            setIsDeleteModalOpen(false);
            setBlogToDelete(null);
          }
        }}
      />
    </div>
  );
}