import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto my-24 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
        <Compass className="w-8 h-8 animate-spin-slow" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white">404</h1>
      <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Không Tìm Thấy Trang</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Địa chỉ trang bạn đang tìm kiếm không tồn tại hoặc đã được thay đổi đường dẫn.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Về Trang Chủ</span>
        </Link>
      </div>
    </div>
  );
}
