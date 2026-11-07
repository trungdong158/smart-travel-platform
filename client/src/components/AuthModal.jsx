import { useState } from 'react';
import { X, User, Mail, Phone, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PasswordInput from './PasswordInput';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const { showToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.toString();

    // Validation cơ bản
    if (isRegister && !fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn!');
      return;
    }

    if (!cleanEmail) {
      setErrorMsg('Vui lòng nhập địa chỉ email!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg('Địa chỉ email không đúng định dạng!');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMsg('Mật khẩu phải chứa ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register({
          fullName: fullName.trim(),
          email: cleanEmail,
          password: cleanPassword,
          phone: phone.trim()
        });
        showToast('Đăng ký tài khoản thành viên thành công! Chào mừng bạn.', 'success');
      } else {
        await login({
          email: cleanEmail,
          password: cleanPassword
        });
        showToast('Đăng nhập thành công!', 'success');
      }
      closeAuthModal();
      // Reset form
      setFullName('');
      setEmail('');
      setPassword('');
      setPhone('');
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        'Có lỗi xảy ra, vui lòng kiểm tra lại thông tin!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl">
              {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {isRegister ? 'Tạo Tài Khoản Thành Viên' : 'Đăng Nhập SmartTour'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {isRegister ? 'Trải nghiệm đặt tour và ưu đãi độc quyền' : 'Chào mừng bạn quay trở lại'}
              </p>
            </div>
          </div>
          <button 
            onClick={closeAuthModal} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs rounded-xl font-medium animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Họ và tên của bạn <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Số điện thoại liên hệ
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="tel"
                  placeholder="0912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <PasswordInput
              required
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Đang xử lý...' : isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              {isRegister
                ? 'Đã có tài khoản? Đăng nhập ngay'
                : 'Chưa có tài khoản? Đăng ký thành viên miễn phí'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
