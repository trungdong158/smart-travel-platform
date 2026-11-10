import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || '';
    } catch {
      return '';
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Lưu trữ currentUser vào localStorage an toàn
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.warn('Lỗi khi ghi user vào localStorage:', err);
    }
  }, [currentUser]);

  // Lưu trữ token vào localStorage an toàn
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.warn('Lỗi khi ghi token vào localStorage:', err);
    }
  }, [token]);

  // Tự động đồng bộ và khôi phục thông tin hồ sơ (gồm ảnh đại diện) mới nhất từ máy chủ
  useEffect(() => {
    let isMounted = true;
    if (token) {
      authService
        .getProfile()
        .then((res) => {
          if (!isMounted || !res || !res.user) return;
          setCurrentUser((prev) => {
            const serverUser = res.user;
            // Nếu trên server không có avatar nhưng client đang có sẵn thì giữ lại và đồng bộ ngược lên server
            if (!serverUser.avatar && prev?.avatar) {
              serverUser.avatar = prev.avatar;
              authService.updateProfile({ avatar: prev.avatar }).catch(() => {});
            }
            return serverUser;
          });
        })
        .catch((err) => {
          console.warn('Không thể đồng bộ hồ sơ từ server:', err?.message);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    setCurrentUser(res.user);
    setToken(res.token);
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setCurrentUser(res.user);
    setToken(res.token);
    return res;
  };

  const logout = () => {
    setCurrentUser(null);
    setToken('');
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch (err) {
      console.warn('Lỗi khi xoá localStorage:', err);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await authService.updateProfile(profileData);
    setCurrentUser(res.user);
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'ADMIN',
        login,
        register,
        logout,
        updateProfile,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
