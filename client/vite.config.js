import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },
  server: {
    host: '0.0.0.0', // Cho phép mọi thiết bị trong mạng LAN (điện thoại, máy tính bảng) truy cập
    port: 5173,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  }
});
