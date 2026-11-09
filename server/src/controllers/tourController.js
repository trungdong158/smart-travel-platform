const { tours, vouchers, saveTours } = require('../config/data');

function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Lấy danh sách tour (hỗ trợ tìm kiếm, lọc và sắp xếp)
 */
const getAllTours = (req, res) => {
  const { search, region, category, mood, maxPrice, sortBy } = req.query;
  let results = [...tours];

  if (search && search.trim()) {
    const rawQ = search.toLowerCase().trim();
    const normQ = removeVietnameseTones(search);
    const compactQ = normQ.replace(/\s+/g, "");

    results = results.filter((t) => {
      const rawTitle = (t.title || "").toLowerCase();
      const normTitle = removeVietnameseTones(t.title);
      const compactTitle = normTitle.replace(/\s+/g, "");
      const normDest = removeVietnameseTones(t.destination_name);
      const compactDest = normDest.replace(/\s+/g, "");

      // Tìm kiếm chính xác theo tiêu đề tour hoặc điểm đến (hỗ trợ có dấu, không dấu, viết liền)
      const matchKeyword =
        rawTitle.includes(rawQ) ||
        normTitle.includes(normQ) ||
        (compactQ.length >= 3 && compactTitle.includes(compactQ)) ||
        normDest.includes(normQ) ||
        (compactQ.length >= 3 && compactDest.includes(compactQ));

      if (!matchKeyword) return false;

      const matchRegion = region ? t.region === region : true;
      const matchCategory = category ? t.category_name.toLowerCase() === category.toLowerCase() : true;
      const matchMood = mood ? (t.mood_id === mood || (t.mood_label && t.mood_label.toLowerCase().includes(mood.toLowerCase()))) : true;
      const matchPrice = maxPrice ? t.base_price <= Number(maxPrice) : true;

      return matchRegion && matchCategory && matchMood && matchPrice;
    });
  
  } else {
    if (region) {
      results = results.filter((t) => t.region === region);
    }
    if (mood) {
      results = results.filter((t) => t.mood_id === mood || (t.mood_label && t.mood_label.toLowerCase().includes(mood.toLowerCase())));
    }
    if (category) {
      results = results.filter((t) => t.category_name.toLowerCase() === category.toLowerCase());
    }
    if (maxPrice) {
      results = results.filter((t) => t.base_price <= Number(maxPrice));
    }
  }

  // Sắp xếp
  if (sortBy === 'price-asc') {
    results.sort((a, b) => a.base_price - b.base_price);
  } else if (sortBy === 'price-desc') {
    results.sort((a, b) => b.base_price - a.base_price);
  } else if (sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  }

  return res.json({ success: true, count: results.length, data: results });
};

/**
 * Lấy chi tiết một tour theo ID
 */
const getTourById = (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((t) => t.id === id);

  if (!tour) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tour du lịch yêu cầu!' });
  }

  return res.json({ success: true, data: tour });
};

/**
 * Thêm tour mới (Admin)
 */
const createTour = (req, res) => {
  const {
    title,
    category_name,
    destination_name,
    departure_location,
    transport_included,
    transport_type,
    mood_id,
    mood_label,
    mood_tag,
    emotional_quote,
    region,
    duration_days,
    base_price,
    featured_image,
    available_seats,
    itinerary_summary,
    itinerary_details,
    highlights
  } = req.body;

  if (!title || !base_price || !destination_name) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng điền đủ Tên tour, Giá tiền và Điểm đến!'
    });
  }

  const newTour = {
    id: Date.now(),
    title: title.trim(),
    slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    category_name: category_name || 'Khám phá mới',
    destination_name: destination_name.trim(),
    departure_location: departure_location ? departure_location.trim() : 'Hà Nội',
    transport_included: transport_included ? transport_included.trim() : 'Đã bao gồm xe Limousine cao cấp',
    transport_type: transport_type || (transport_included && transport_included.toLowerCase().includes('máy bay') ? 'FLIGHT' : 'LIMOUSINE'),
    region: region || 'Bắc',
    mood_id: mood_id || 'healing',
    mood_label: mood_label || 'Chữa Lành & Tĩnh Tại',
    mood_tag: mood_tag || '#ChữaLành',
    emotional_quote: emotional_quote || 'Chạm vào thiên nhiên và tìm thấy sự an nhiên trong lòng.',
    duration_days: Number(duration_days) || 3,
    base_price: Number(base_price),
    featured_image:
      featured_image ||
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    available_seats: Number(available_seats) || 10,
    rating: 5.0,
    review_count: 1,
    itinerary_summary:
      itinerary_summary || 'Hành trình tour hấp dẫn mang lại trải nghiệm đáng nhớ cho du khách.',
    itinerary_details: itinerary_details || [
      { day: 1, title: 'Khởi hành chuyến đi', description: 'Đón khách và tham quan các điểm nổi bật.' },
      { day: 2, title: 'Trải nghiệm văn hóa', description: 'Khám phá ẩm thực và danh thắng địa phương.' },
      { day: 3, title: 'Tổng kết & Tiễn đoàn', description: 'Mua sắm đặc sản và kết thúc tour.' }
    ],
    highlights: highlights || ['Xe du lịch tiện nghi', 'Hướng dẫn viên nhiệt tình', 'Bảo hiểm du lịch chu đáo']
  };

  tours.unshift(newTour);
  saveTours();
  return res.status(201).json({ success: true, message: 'Thêm tour mới thành công!', data: newTour });
};

/**
 * Cập nhật thông tin tour (Admin)
 */
const updateTour = (req, res) => {
  const id = Number(req.params.id);
  const index = tours.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tour cần cập nhật!' });
  }

  const updatedTour = {
    ...tours[index],
    ...req.body,
    id // giữ nguyên ID
  };

  tours[index] = updatedTour;
  saveTours();
  return res.json({ success: true, message: 'Cập nhật thông tin tour thành công!', data: updatedTour });
};

/**
 * Xóa tour (Admin)
 */
const deleteTour = (req, res) => {
  const id = Number(req.params.id);
  const index = tours.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tour để xóa!' });
  }

  tours.splice(index, 1);
  saveTours();
  return res.json({ success: true, message: 'Đã xóa tour thành công khỏi hệ thống.' });
};

/**
 * Kiểm tra áp dụng mã Voucher giảm giá
 */
const checkVoucher = (req, res) => {
  const { code, totalPrice } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mã giảm giá!' });
  }

  const voucher = vouchers.find((v) => v.code.toUpperCase() === code.trim().toUpperCase());
  if (!voucher) {
    return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn!' });
  }

  const rawDiscount = (Number(totalPrice) * voucher.discountPercent) / 100;
  const actualDiscount = Math.min(rawDiscount, voucher.maxDiscount);

  return res.json({
    success: true,
    message: `Áp dụng thành công mã ${voucher.code}!`,
    voucher: {
      code: voucher.code,
      discountPercent: voucher.discountPercent,
      discountAmount: actualDiscount,
      description: voucher.description
    }
  });
};

/**
 * Thêm đánh giá tour (Review & Rating)
 */
const addTourReview = (req, res) => {
  const id = Number(req.params.id);
  const { rating, comment, userName } = req.body;
  const tour = tours.find((t) => t.id === id);

  if (!tour) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tour!' });
  }

  const newRatingNum = Number(rating) || 5;
  const currentCount = tour.review_count || 1;
  const currentAvg = tour.rating || 5.0;

  // Cập nhật rating trung bình mới
  tour.rating = Number((((currentAvg * currentCount) + newRatingNum) / (currentCount + 1)).toFixed(1));
  tour.review_count = currentCount + 1;

  if (!tour.reviews) tour.reviews = [];
  tour.reviews.unshift({
    id: Date.now(),
    userName: userName || req.user?.fullName || 'Du khách',
    rating: newRatingNum,
    comment: comment || 'Chuyến đi rất tuyệt vời, phục vụ tận tâm!',
    date: new Date().toLocaleDateString('vi-VN')
  });

  saveTours();

  return res.json({
    success: true,
    message: 'Cảm ơn bạn đã gửi đánh giá cho chuyến đi!',
    data: { rating: tour.rating, review_count: tour.review_count }
  });
};

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  checkVoucher,
  addTourReview
};
