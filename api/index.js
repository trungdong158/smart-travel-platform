// Vercel Serverless Function entry point for SoulTrip API
const app = require('../server/src/server');

module.exports = (req, res) => {
  // Chuẩn hóa đường dẫn URL cho Express khi đi qua Vercel Rewrites
  if (req.query && req.query.__vercel_path !== undefined) {
    const { __vercel_path: apiPath, ...query } = req.query;
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      for (const item of Array.isArray(value) ? value : [value]) {
        search.append(key, String(item));
      }
    }

    const pathname = typeof apiPath === 'string' ? apiPath : '';
    req.url = `/api/${pathname}${search.size ? `?${search}` : ''}`;
  } else if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? req.url : `/${req.url}`}`;
  }

  return app(req, res);
};
