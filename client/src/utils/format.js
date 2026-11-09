/**
 * Định dạng tiền tệ Việt Nam Đồng (VNĐ)
 * Ví dụ: 4990000 -> "4.990.000 ₫"
 */
export const formatVND = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price || 0);
};

/**
 * Chuẩn hóa chuỗi tiếng Việt: loại bỏ dấu thanh, chuyển về chữ thường
 * Ví dụ: "Đà Nẵng" -> "da nang", "Nha Trang" -> "nha trang"
 */
export const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
};
