// @refresh reset
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('lf_token'));
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const { user: u, token: t } = await authService.login(credentials);
    setUser(u);
    setToken(t);
    localStorage.setItem('lf_token', t);
    localStorage.setItem('lf_user', JSON.stringify(u));
    return u;
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lf_token');
    localStorage.removeItem('lf_user');
  }, []);

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('lf_user', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('lf_user');
    const storedToken = localStorage.getItem('lf_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, [logout]);

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isMember = user?.role?.toLowerCase() === 'member';

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, isMember, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
