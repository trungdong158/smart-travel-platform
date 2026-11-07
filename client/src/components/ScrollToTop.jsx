import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Tự động cuộn trang lên trên cùng (x: 0, y: 0) mỗi khi chuyển đổi route
 * Giúp người dùng khi click xem chi tiết tour hoặc điều hướng bất kỳ trang nào
 * luôn bắt đầu từ phần đầu trang thay vì bị lưu vị trí cuộn của trang trước.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname, search]);

  return null;
}
