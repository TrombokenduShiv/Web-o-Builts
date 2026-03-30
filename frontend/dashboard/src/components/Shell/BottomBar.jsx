import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Phone, CreditCard, BarChart2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import './BottomBar.css';

const NAV_ITEMS = [
  { path: '/dashboard',           label: 'Home',      icon: LayoutDashboard },
  { path: '/dashboard/calls',     label: 'Calls',     icon: Phone },
  { path: '/dashboard/billing',   label: 'Billing',   icon: CreditCard },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/dashboard/settings',  label: 'Settings',  icon: Settings },
];

export default function BottomBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottombar" aria-label="Mobile navigation">
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
        const isActive = location.pathname === path ||
          (path !== '/dashboard' && location.pathname.startsWith(path));
        return (
          <button
            key={path}
            className={`bottombar-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && (
              <motion.div
                className="bottombar-active-bg"
                layoutId="bottomActivePill"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.7} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
