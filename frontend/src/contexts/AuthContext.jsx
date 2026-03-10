import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi, setAccessToken, clearAccessToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [initialized, setInit]    = useState(false);
  const timerRef                  = useRef(null);

  const scheduleRefresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await authApi.refresh();
        setAccessToken(data.accessToken);
        scheduleRefresh();
      } catch {
        setUser(null);
        clearAccessToken();
      }
    }, 13 * 60 * 1000);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const data = await authApi.refresh();
        setAccessToken(data.accessToken);
        setUser(data.user);
        scheduleRefresh();
      } catch {
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
        setInit(true);
      }
    }
    init();

    const onLogout = () => { setUser(null); clearAccessToken(); };
    window.addEventListener('auth:logout', onLogout);
    return () => {
      window.removeEventListener('auth:logout', onLogout);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleRefresh]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    scheduleRefresh();
    return data;
  }, [scheduleRefresh]);

  const register = useCallback((email, password, name) =>
    authApi.register({ email, password, name }), []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    clearAccessToken();
    setUser(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const logoutAll = useCallback(async () => {
    try { await authApi.logoutAll(); } catch {}
    clearAccessToken();
    setUser(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const setUserFromOAuth = useCallback((token, userData) => {
    setAccessToken(token);
    setUser(userData);
    scheduleRefresh();
  }, [scheduleRefresh]);

  const PERMISSIONS = {
  'users:read':      ['admin', 'moderator'],
  'users:write':     ['admin'],
  'content:read':    ['admin', 'moderator', 'user'],
  'content:write':   ['admin', 'moderator', 'user'],
  'content:publish': ['admin', 'moderator'],
  'admin:access':    ['admin'],
};

  const value = {
    user,
    loading,
    initialized,
    isAuthenticated:  !!user,
    isEmailVerified:  user?.isEmailVerified ?? false,
    role:             user?.role ?? 'guest',
    hasRole:          (roles) => roles.includes(user?.role),
    hasPermission:    (perm)  => (PERMISSIONS[perm] || []).includes(user?.role),
    login,
    register,
    logout,
    logoutAll,
    setUserFromOAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}