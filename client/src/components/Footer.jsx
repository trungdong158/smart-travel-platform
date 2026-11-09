import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-[#060a12] text-slate-300 dark:text-slate-400 pt-12 pb-8 border-t border-slate-800 text-xs transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
          
          {/* Cột 1: Thông tin thương hiệu & Dự án */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img 
                src="/soultrip-logo.png" 
                alt="SoulTrip Logo" 
                className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0" 
              />
              <div>
                <span className="text-lg font-black tracking-tight text-white block leading-none">
                  SoulTrip
                </span>
                <span className="text-[10px] text-amber-400 font-medium italic">
                  “ Travel Where Your Soul Leads “
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Nền tảng du lịch khơi nguồn cảm hứng theo triết lý <b>“Travel Where Your Soul Leads – Đi đâu theo cảm xúc, trải nghiệm theo cách riêng của bạn”</b>.
            </p>
            <div className="pt-1 text-[11px] text-amber-400 font-medium">
              Đồ Án Môn Học: Thiết Kế Web Thực Tế
            </div>
          </div>

          {/* Cột 2: Thành viên nhóm SV */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm tracking-wide">Nhóm Sinh Viên Thực Hiện</h4>
            <ul className="space-y-1 text-slate-400 text-xs">
              <li>• Lê Phan Trung Đông - <span className="font-mono text-slate-300">6651071016</span></li>
              <li>• Ngô Thuận Dương - <span className="font-mono text-slate-300">6651071010</span></li>
              <li>• Trần Thanh Huy - <span className="font-mono text-slate-300">6651071027</span></li>
              <li>• Đặng Quốc Vương - <span className="font-mono text-slate-300">6651071096</span></li>
              <li>• Nguyễn Quốc Đạt - <span className="font-mono text-slate-300">6651071014</span></li>
            </ul>
          </div>

          {/* Cột 3: Khám phá nhanh & Travel by Mood */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm tracking-wide">Travel by Mood</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/tours?mood=healing" className="hover:text-amber-400 transition">🌿 Chữa Lành & Tĩnh Tại (Sa Pa, Đà Lạt)</Link></li>
              <li><Link to="/tours?mood=adventure" className="hover:text-amber-400 transition">⚡ Bứt Phá & Phiêu Lưu (Hà Giang, Mũi Né)</Link></li>
              <li><Link to="/tours?mood=romance" className="hover:text-amber-400 transition">🌅 Lãng Mạn & Hoài Niệm (Phú Quốc, Huế)</Link></li>
              <li><Link to="/tours?mood=discovery" className="hover:text-amber-400 transition">🌊 Tự Do & Khám Phá (Hạ Long, Nha Trang)</Link></li>
              <li><Link to="/tours" className="hover:text-amber-400 transition text-slate-300 font-semibold pt-1 block">Tất cả {16} tour du lịch →</Link></li>
            </ul>
          </div>

          {/* Cột 4: Hỗ trợ & Liên hệ */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm tracking-wide">Liên Hệ Hỗ Trợ 24/7</h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Hotline: 1900 888 2026 (Miễn phí)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Email: contact@soultrip.vn</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Trụ sở: Tòa nhà Công Nghệ, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="text-center text-slate-500 text-[11px]">
          <p>© 2026 SoulTrip Platform. Travel Where Your Soul Leads - Thiết kế bởi nhóm sinh viên UTC2.</p>
        </div>
      </div>
    </footer>
  );
}
