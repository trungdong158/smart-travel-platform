import { useState, useEffect } from 'react';
import { Sparkles, Compass, Heart, MapPin } from 'lucide-react';

const LOADING_STEPS = [
  { text: 'Đang khởi động nền tảng du lịch cảm xúc...', icon: Compass },
  { text: 'Khám phá 16 hành trình di sản & biển đảo tuyệt mỹ...', icon: MapPin },
  { text: 'Kết nối những điểm chạm tâm hồn sâu sắc...', icon: Heart },
  { text: 'Sẵn sàng khởi hành cùng bạn...', icon: Sparkles }
];

export default function LoadingScreen({ message }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Tự động chuyển đổi các câu thông điệp cảm xúc truyền cảm hứng
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 900);

    // Thanh tiến trình chạy mượt mà lên 92% trong khi chờ dữ liệu nạp xong
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        const jump = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + jump, 92);
      });
    }, 280);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const CurrentIcon = LOADING_STEPS[stepIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/50 to-amber-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/60 selection:bg-sky-500 selection:text-white transition-colors duration-500">
      
      {/* Các quầng sáng nghệ thuật phát sáng mờ ảo phía sau (Ambient Glow Orbs) */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-400/20 dark:bg-sky-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-400/20 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Khung nội dung trung tâm */}
      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        
        {/* Khối Logo thương hiệu với hiệu ứng vòng tròn tỏa sóng */}
        <div className="relative mb-6">
          {/* Vòng tròn viền xoay nhẹ nhàng tạo chuyển động */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-amber-500 opacity-30 dark:opacity-40 blur-md animate-[spin_10s_linear_infinite]"></div>
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-white dark:bg-slate-900 shadow-2xl border border-white/60 dark:border-slate-800 flex items-center justify-center">
            <img 
              src="/soultrip-logo.png" 
              alt="SoulTrip Logo" 
              className="w-full h-full object-cover rounded-2xl shadow-inner transform transition-transform duration-700 hover:scale-105"
            />
            {/* Huy hiệu nhỏ trang trí góc */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 animate-bounce">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
          </div>
        </div>

        {/* Tên thương hiệu SoulTrip */}
        <div className="space-y-1 mb-5">
          <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500 dark:from-sky-400 dark:via-indigo-300 dark:to-amber-300 bg-clip-text text-transparent">
            SoulTrip
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            “ Travel Where Your Soul Leads “
          </p>
        </div>

        {/* Thanh tiến trình (Progress Bar) siêu mượt */}
        <div className="w-56 sm:w-64 space-y-2 mb-4">
          <div className="h-1.5 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-500 rounded-full transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Dòng thông điệp truyền cảm hứng chuyển đổi sinh động */}
        <div className="h-8 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all duration-300">
          <CurrentIcon className="w-4 h-4 text-amber-500 animate-spin-slow shrink-0" />
          <span className="animate-fade-in truncate">
            {message || LOADING_STEPS[stepIndex].text}
          </span>
        </div>

        {/* Các thẻ cảm xúc tinh tế (Mood Pills) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 opacity-80 dark:opacity-70">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            🌿 Chữa lành
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
            🧭 Khám phá
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            💎 Sang trọng
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            💖 Lãng mạn
          </span>
        </div>

      </div>

    </div>
  );
}
