import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('wcs-dash-theme') || 'dark');

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wcs-dash-user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
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
    localStorage.removeItem('wcs-dash-user');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, theme, loginUser, logoutUser, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
