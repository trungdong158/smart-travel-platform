import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
  value = '',
  onChange,
  placeholder = '••••••••',
  required = false,
  id,
  name,
  className = '',
  minLength
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex items-center">
      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
      <input
        type={showPassword ? 'text' : 'password'}
        required={required}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        minLength={minLength}
        onChange={onChange}
        className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40 transition placeholder:text-slate-400 dark:placeholder:text-slate-500 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        ) : (
          <Eye className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-400" />
        )}
      </button>
    </div>
  );
}
