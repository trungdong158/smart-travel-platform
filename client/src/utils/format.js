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
