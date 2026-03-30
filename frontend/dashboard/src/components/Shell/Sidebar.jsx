import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Phone, CreditCard, BarChart2,
  Settings, LogOut, Sun, Moon
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/dashboard',           label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/dashboard/calls',     label: 'Calls',         icon: Phone },
  { path: '/dashboard/billing',   label: 'Billing',       icon: CreditCard },
  { path: '/dashboard/analytics', label: 'Analytics',     icon: BarChart2 },
  { path: '/dashboard/settings',  label: 'Settings',      icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser, theme, toggleTheme } = useAuth();

  const initials = user?.avatar_initials || user?.owner_name?.slice(0,2).toUpperCase() || 'U';

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Top gloss */}
      <div className="sidebar-gloss" aria-hidden="true" />

      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/logo.png" alt="WebCraft Sutra" className="sidebar-logo-img" />
      </div>

      {/* User profile */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-profile-info">
          <div className="sidebar-owner">{user?.owner_name || 'Client'}</div>
          <div className="sidebar-business">{user?.business_name || ''}</div>
        </div>
        <div className={`sidebar-pkg-badge ${user?.package_type}`}>
          {user?.package_type === 'pro' ? '✦ Pro' : 'Std'}
        </div>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Nav links */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path ||
            (path !== '/dashboard' && location.pathname.startsWith(path));
          return (
            <div className="sidebar-nav-item-wrap" key={path}>
              {isActive && (
                <motion.div
                  className="sidebar-active-pill"
                  layoutId="activePill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <button
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(path)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
                {path === '/dashboard/analytics' && user?.package_type !== 'pro' && (
                  <span className="sidebar-pro-tag">Pro</span>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom controls */}
      <div className="sidebar-bottom">
        {/* Theme toggle */}
        <button className="sidebar-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark'
            ? <><Sun size={15} /> Light Mode</>
            : <><Moon size={15} /> Dark Mode</>
          }
        </button>
        {/* Logout */}
        <button className="sidebar-logout" onClick={logoutUser} aria-label="Logout">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
