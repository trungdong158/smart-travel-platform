/**
 * BRAND IDENTITY: "TRAVEL BY MOOD - ĐI ĐÂU THEO CẢM XÚC, TRẢI NGHIỆM THEO CÁCH RIÊNG CỦA BẠN"
 * Định nghĩa 4 trạng thái cảm xúc cốt lõi của hành trình
 */

export const TRAVEL_MOODS = [
  {
    id: 'healing',
    name: 'Chữa Lành & Tĩnh Tại',
    shortName: 'Chữa Lành',
    tag: '#ChữaLành',
    icon: 'Leaf',
    emoji: '🌿',
    tagline: 'Khi tâm trí cần một khoảng lặng giữa đại ngàn và mây gió',
    quote: 'Thả lỏng đôi vai, lắng nghe tiếng thông reo và để thiên nhiên xoa dịu những mỏi mệt trong lòng.',
    description: 'Dành cho những ngày bạn thấy mệt mỏi với khói bụi thành thị. Hãy để màu xanh của rừng thông, sương sớm và non nước nguyên sơ chữa lành từng tế bào trong bạn.',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60',
    accentBg: 'from-emerald-600/90 via-teal-700/80 to-slate-900',
    coverImage: 'https://images.unsplash.com/photo-1678099006439-dba9e4d3f9f5?auto=format&fit=crop&w=1200&q=80',
    keywords: ['đà lạt', 'sa pa', 'ninh bình', 'ba bể', 'côn đảo', 'yên tĩnh', 'chữa lành', 'tĩnh lặng', 'thiên nhiên']
  },
  {
    id: 'adventure',
    name: 'Bứt Phá & Phiêu Lưu',
    shortName: 'Phiêu Lưu',
    tag: '#PhiêuLưu',
    icon: 'Flame',
    emoji: '⚡',
    tagline: 'Vượt qua vùng an toàn để chạm tay vào những giới hạn mới',
    quote: 'Đứng trước đèo cao vực sâu hay đồi cát rực lửa, bạn sẽ nhận ra mình dũng cảm hơn mình từng nghĩ.',
    description: 'Dành cho những trái tim khát khao chinh phục. Vượt đèo Mã Pí Lèng, lướt xe Jeep trên đồi cát bay hay thám hiểm hang động kỳ vĩ sẽ thổi bùng ngọn lửa sống trong bạn.',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60',
    accentBg: 'from-amber-600/90 via-orange-700/80 to-slate-900',
    coverImage: 'https://images.unsplash.com/photo-1670654534716-91f59fe06a26?auto=format&fit=crop&w=1200&q=80',
    keywords: ['hà giang', 'phong nha', 'mũi né', 'điện biên', 'phiêu lưu', 'mạo hiểm', 'chinh phục', 'bứt phá']
  },
  {
    id: 'romance',
    name: 'Lãng Mạn & Hoài Niệm',
    shortName: 'Lãng Mạn',
    tag: '#LãngMạn',
    icon: 'Heart',
    emoji: '🌅',
    tagline: 'Lưu giữ những khoảnh khắc ngọt ngào và rung động sâu thẳm',
    quote: 'Có những buổi chiều hoàng hôn chỉ thực sự trọn vẹn khi được ngắm cùng người mình thương.',
    description: 'Dành cho những khoảnh khắc gắn kết yêu thương. Dạo bước phố cổ Hội An lung linh đèn lồng, ngắm hoàng hôn Sunset Town hay du thuyền sông Hương thơ mộng.',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/60',
    accentBg: 'from-rose-600/90 via-pink-700/80 to-slate-900',
    coverImage: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80',
    keywords: ['phú quốc', 'hội an', 'huế', 'đà nẵng', 'lãng mạn', 'hoàng hôn', 'người yêu', 'cặp đôi', 'nghỉ dưỡng']
  },
  {
    id: 'discovery',
    name: 'Tự Do & Khám Phá',
    shortName: 'Tự Do',
    tag: '#TựDo',
    icon: 'Compass',
    emoji: '🌊',
    tagline: 'Xách ba lô lên và đi tìm một phiên bản tự do, rạng rỡ của chính mình',
    quote: 'Thế giới rộng lớn đang vẫy gọi, mỗi bước chân là một câu chuyện mới chưa từng kể.',
    description: 'Dành cho những tâm hồn phóng khoáng muốn chạm vào những nền văn hóa mới. Đắm mình trong làn nước biển Nha Trang, khám phá chợ nổi Cái Răng hay kỳ quan Vịnh Hạ Long.',
    color: 'sky',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800/60',
    accentBg: 'from-sky-600/90 via-indigo-700/80 to-slate-900',
    coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    keywords: ['hạ long', 'nha trang', 'cần thơ', 'quy nhơn', 'tự do', 'khám phá', 'biển', 'trải nghiệm']
  }
];

export function getMoodById(moodId) {
  return TRAVEL_MOODS.find((m) => m.id === moodId) || null;
}

export function getMoodBadgeClass(moodId) {
  const mood = getMoodById(moodId);
  return mood ? mood.badgeClass : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}
