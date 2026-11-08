const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production' ? '' : 'smarttour_super_secret_key_2026_jwt');

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production.');
}

module.exports = JWT_SECRET;
