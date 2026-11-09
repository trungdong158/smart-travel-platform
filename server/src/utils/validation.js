const EMAIL_PATTERN = /^(?=.{1,254}$)(?=.{1,64}@)[A-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i;
const VIETNAMESE_MOBILE_PATTERN = /^(?:\+84|0)[35789]\d{8}$/;

const isValidEmail = (email) => (
  typeof email === 'string' && EMAIL_PATTERN.test(email.trim())
);

const isValidVietnamesePhone = (phone) => {
  if (typeof phone !== 'string') return false;
  const normalizedPhone = phone.trim().replace(/[\s().-]/g, '');
  return VIETNAMESE_MOBILE_PATTERN.test(normalizedPhone);
};

const isValidDepartureDate = (departureDate) => {
  if (typeof departureDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
    return false;
  }

  const parsedDate = new Date(`${departureDate}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== departureDate) {
    return false;
  }

  const todayParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const today = `${todayParts.find((part) => part.type === 'year').value}-${todayParts.find((part) => part.type === 'month').value}-${todayParts.find((part) => part.type === 'day').value}`;

  return departureDate > today;
};

module.exports = {
  isValidEmail,
  isValidVietnamesePhone,
  isValidDepartureDate
};
