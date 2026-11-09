const EMAIL_PATTERN = /^(?=.{1,254}$)(?=.{1,64}@)[A-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i;
const VIETNAMESE_MOBILE_PATTERN = /^(?:\+84|0)[35789]\d{8}$/;

export const validateEmail = (email) => (
  typeof email === 'string' && EMAIL_PATTERN.test(email.trim())
);

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

  const normalizedPhone = clean.replace(/[\s().-]/g, '');
  const isValid = VIETNAMESE_MOBILE_PATTERN.test(normalizedPhone);
  return {
    isValid,
    message: isValid ? '' : 'Vui lòng nhập số điện thoại Việt Nam hợp lệ (ví dụ: 0912 345 678).'
  };
};

export const getLocalDateString = (date = new Date()) => {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const year = dateParts.find((part) => part.type === 'year').value;
  const month = dateParts.find((part) => part.type === 'month').value;
  const day = dateParts.find((part) => part.type === 'day').value;
  return `${year}-${month}-${day}`;
};
