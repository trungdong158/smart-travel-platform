const http = require('http');

function request({ method, path, body, token }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };

    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(
      { hostname: 'localhost', port: 5000, path, method, headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data || '{}') });
          } catch {
            resolve({ status: res.statusCode, raw: data || '' });
          }
        });
      }
    );

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

(async () => {
  const login = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'admin@smarttour.vn', password: 'admin123' }
  });

  if (!login.body || !login.body.token) {
    console.error('LOGIN_FAILED');
    console.error(JSON.stringify(login, null, 2));
    process.exit(1);
  }

  const token = login.body.token;
  const create = await request({
    method: 'POST',
    path: '/api/users/admin',
    token,
    body: {
      fullName: 'Quản Trị Viên Kiểm Thử',
      email: 'admin_test_2026@gmail.com',
      password: '123123',
      phone: '0900000002'
    }
  });

  console.log(JSON.stringify({ login, create }, null, 2));
})();
