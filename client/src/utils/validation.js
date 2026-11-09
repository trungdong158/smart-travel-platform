/**
 * Utility kiểm tra tính hợp lệ của số điện thoại
 * Quy tắc theo yêu cầu:
 * - Chỉ cần là số (chữ số, dấu +, khoảng trắng, gạch ngang...) thì hợp lệ, không thông báo gì.
 * - Là chữ hoặc có chữ trong đó thì mới thông báo: "Vui lòng nhập số điện thoại đúng định dạng."
 */
export const validatePhoneNumber = (phone, isRequired = false) => {
  if (!phone || typeof phone !== 'string') {
    if (isRequired) {
      return { isValid: false, message: 'Vui lòng nhập số điện thoại!' };
    }
    return { isValid: true, message: '' };
  }

  const clean = phone.trim();
  if (!clean) {
    if (isRequired) {
      return { isValid: false, message: 'Vui lòng nhập số điện thoại!' };
    }
    return { isValid: true, message: '' };
  }

  // Nếu là chữ cái hoặc có chữ cái trong đó (bao gồm ký tự La-tinh và tiếng Việt có dấu)
  if (/[a-zA-ZÀ-ỹ]/.test(clean)) {
    return { isValid: false, message: 'Vui lòng nhập số điện thoại đúng định dạng.' };
  }

  // Chỉ cần là số thì hợp lệ, không cần thông báo lỗi gì
  return { isValid: true, message: '' };
};
