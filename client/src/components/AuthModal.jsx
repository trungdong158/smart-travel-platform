import { useState } from 'react';
import { X, User, Mail, Phone, LogIn, UserPlus, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PasswordInput from './PasswordInput';
import { validateEmail, validatePhoneNumber } from '../utils/validation';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const { showToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

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

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    closeAuthModal();
    setIsForgotPassword(false);
    setForgotSuccess(false);
    setErrorMsg('');
  };

  // Xử lý gửi yêu cầu quên mật khẩu & đổi mật khẩu (Mô phỏng tượng trưng)
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Vui lòng nhập địa chỉ email của bạn!');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Địa chỉ email không hợp lệ. Vui lòng kiểm tra tên hộp thư và tên miền!');
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(true);
      showToast(
        `Yêu cầu đổi mật khẩu cho ${cleanEmail} đã được gửi thành công! (Tính năng mô phỏng)`,
        'success'
      );
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.toString();

    // Validation cơ bản
    if (isRegister) {
      if (!fullName.trim()) {
        setErrorMsg('Vui lòng nhập họ và tên của bạn!');
        return;
      }

      // Kiểm tra định dạng số điện thoại nếu người dùng nhập
      if (phone && phone.trim()) {
        const phoneValidation = validatePhoneNumber(phone, false);
        if (!phoneValidation.isValid) {
          setPhoneError(phoneValidation.message);
          setErrorMsg(phoneValidation.message);
          return;
        }
      }
    }

    if (!cleanEmail) {
      setErrorMsg('Vui lòng nhập địa chỉ email!');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Địa chỉ email không hợp lệ. Vui lòng kiểm tra tên hộp thư và tên miền!');
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
      handleClose();
      // Reset form
      setFullName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setPhoneError('');
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
            <div className={`p-2 rounded-xl ${
              isForgotPassword
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
            }`}>
              {isForgotPassword ? (
                <KeyRound className="w-5 h-5" />
              ) : isRegister ? (
                <UserPlus className="w-5 h-5" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {isForgotPassword
                  ? 'Quên Mật Khẩu'
                  : isRegister
                  ? 'Tạo Tài Khoản Thành Viên'
                  : 'Đăng Nhập SoulTrip'}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {isForgotPassword
                  ? 'Khôi phục và đổi mật khẩu tài khoản (Mô phỏng)'
                  : isRegister
                  ? 'Trải nghiệm đặt tour và ưu đãi độc quyền'
                  : 'Chào mừng bạn quay trở lại'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Quên mật khẩu & Đổi mật khẩu mô phỏng */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPasswordSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs rounded-xl font-medium animate-in fade-in">
                {errorMsg}
              </div>
            )}

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                  Gửi yêu cầu thành công!
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  Đường dẫn đặt lại mật khẩu đã được gửi tới <strong>{forgotEmail}</strong>. Vui lòng kiểm tra hộp thư đến hoặc mục spam.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotSuccess(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Quay lại Đăng nhập
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  💡 <strong>Tính năng mô phỏng:</strong> Nhập email tài khoản của bạn để gửi yêu cầu đặt lại mật khẩu mới.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Địa chỉ Email của bạn <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/40 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mật khẩu mới (Tượng trưng)
                  </label>
                  <PasswordInput
                    placeholder="Nhập mật khẩu mới muốn đặt..."
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                  />
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
                    Hệ thống sẽ cập nhật hoặc gửi liên kết xác thực về email.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{forgotLoading ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Đổi Mật Khẩu'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setErrorMsg('');
                    }}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại Đăng nhập</span>
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          /* Form Đăng nhập & Đăng ký */
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
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                      if (errorMsg) setErrorMsg('');
                    }}
                    onBlur={handlePhoneBlur}
                    className={`w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border ${
                      phoneError
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950/40'
                        : 'border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                  />
                </div>
                {phoneError && (
                  <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                    {phoneError}
                  </span>
                )}
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email || '');
                      setIsForgotPassword(true);
                      setErrorMsg('');
                      setForgotSuccess(false);
                    }}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline font-semibold cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
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
                  setPhoneError('');
                }}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
              >
                {isRegister
                  ? 'Đã có tài khoản? Đăng nhập ngay'
                  : 'Chưa có tài khoản? Đăng ký thành viên miễn phí'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
