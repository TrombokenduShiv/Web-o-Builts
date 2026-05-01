import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('wcs-dash-theme') || 'dark');

  // Restore session: validate stored token by fetching profile
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Set a timeout fallback so we never show an infinite spinner
      const timeoutId = setTimeout(() => {
        console.warn('Profile fetch timed out — clearing session');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('wcs-dash-user');
        setUser(null);
        setLoading(false);
      }, 10000); // 10 second timeout

      getMe()
        .then(profile => {
          clearTimeout(timeoutId);
          setUser(profile);
          localStorage.setItem('wcs-dash-user', JSON.stringify(profile));
        })
        .catch(() => {
          clearTimeout(timeoutId);
          // Token invalid/expired — clear everything
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('wcs-dash-user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // No token — check if we have cached user data (shouldn't happen, but fallback)
      const saved = localStorage.getItem('wcs-dash-user');
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch {}
      }
      setLoading(false);
    }
  }, []);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wcs-dash-theme', theme);
  }, [theme]);

  const loginUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('wcs-dash-user', JSON.stringify(userData));
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
    apiLogout();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  // Helper: check if user needs onboarding
  const needsOnboarding = user && (!user.business_name || user.is_new);

  return (
    <AuthContext.Provider value={{ user, loading, theme, loginUser, logoutUser, toggleTheme, needsOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
