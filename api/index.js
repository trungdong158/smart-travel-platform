const app = require('../server/src/app');

module.exports = (req, res) => {
  const { __vercel_path: apiPath, ...query } = req.query || {};
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      search.append(key, String(item));
    }
  }

  const pathname = typeof apiPath === 'string' ? apiPath : '';
  req.url = `/api/${pathname}${search.size ? `?${search}` : ''}`;

  return app(req, res);
};
