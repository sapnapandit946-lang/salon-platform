import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('salon_user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('salon_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.auth.getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('salon_user_data', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    const res = await api.auth.login(credentials);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('salon_auth_token', res.access_token);
    localStorage.setItem('salon_user_data', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('salon_auth_token', res.access_token);
    localStorage.setItem('salon_user_data', JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('salon_auth_token');
    localStorage.removeItem('salon_user_data');
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isSalonOwner = user?.role === 'SALON_OWNER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isCustomer,
      isSalonOwner,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
