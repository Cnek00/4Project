import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getMyCart } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = () => {
    const access = localStorage.getItem('access');
    if (!access) {
      setCartCount(0);
      return;
    }
    getMyCart()
      .then((data) => {
        const items = data?.items ?? [];
        const total = items.reduce((acc, i) => acc + (i.quantity || 0), 0);
        setCartCount(total);
      })
      .catch(() => setCartCount(0));
  };

  useEffect(() => {
    const access = localStorage.getItem('access');
    setUser(access ? { token: access } : null);
    if (access) refreshCartCount();
    else setCartCount(0);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    setUser({ token: data.access });
    refreshCartCount();
    return data;
  };

  /** Google Allauth callback sonrası token'ları kaydeder (hash'ten gelir) */
  const loginWithTokens = (access, refresh) => {
    if (access) localStorage.setItem('access', access);
    if (refresh) localStorage.setItem('refresh', refresh);
    setUser(access ? { token: access } : null);
    refreshCartCount();
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setCartCount(0);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginWithTokens,
    logout,
    cartCount,
    refreshCartCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
