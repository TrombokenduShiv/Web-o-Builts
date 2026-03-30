import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary } from '../../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { CalendarDays, Zap, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import './Dashboard.css';

const STATUS_COLORS = {
  pending: { bg: 'rgba(255,181,71,0.15)', color: '#ffb547', border: 'rgba(255,181,71,0.3)' },
  active:  { bg: 'rgba(91,156,246,0.15)', color: '#5b9cf6', border: 'rgba(91,156,246,0.3)' },
  complete:{ bg: 'rgba(76,175,135,0.15)', color: '#4caf87', border: 'rgba(76,175,135,0.3)' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="dash-chart-tooltip">
        <p className="dash-tooltip-label">{label}</p>
        <p className="dash-tooltip-value">{payload[0].value.toLocaleString()} visitors</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary().then(data => {
      setSummary(data);
      setLoading(false);
    });
  }, []);

  const statusStyle = STATUS_COLORS[summary?.status_type] || STATUS_COLORS.pending;

  return (
    <div className="dash-page">
      {/* Top bar */}
      <motion.div
        className="dash-topbar"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <h1 className="dash-welcome">
            Welcome back, <span className="gradient-text">{user?.owner_name?.split(' ')[0] || 'Client'}</span> 👋
          </h1>
          <p className="dash-date">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
        {summary && (
          <motion.div
            className="dash-status-badge"
            style={{ background: statusStyle.bg, color: statusStyle.color, borderColor: statusStyle.border }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            <span className="dash-status-dot" style={{ background: statusStyle.color }} />
            {summary.status_badge}
          </motion.div>
        )}
      </motion.div>

      {/* Action Center */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="dash-action-skeleton shimmer" key="skeleton" style={{ height: 340, borderRadius: 20, marginBottom: 28 }} />
        ) : summary?.next_action_required === 'book_first_call' ? (
          <motion.div
            key="book-call"
            className="dash-action-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Gradient border top */}
            <div className="dash-action-glow" />
            <div className="dash-action-inner">
              <div className="dash-action-left">
                <div className="dash-action-tag">
                  <Zap size={13} /> Next Step
                </div>
                <h2 className="dash-action-title">Book Your Discovery Call</h2>
                <p className="dash-action-desc">
                  Let's align on your vision. Your 30-minute discovery call is complimentary
                  and is the first step to getting your high-performance website live.
                </p>
                <motion.button
                  className="dash-action-cta"
                  onClick={() => navigate('/dashboard/calls')}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <CalendarDays size={17} />
                  Schedule Now
                  <ArrowRight size={16} />
                </motion.button>
                <p className="dash-action-sub">Free • 30 mins • Google Meet</p>
              </div>
              <div className="dash-action-right">
                <p className="dash-chart-label">
                  <TrendingUp size={14} /> Predicted Traffic Growth
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={summary.predicted_traffic}>
                    <defs>
                      <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#e91e8c" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#e91e8c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: 'rgba(196,184,224,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="#e91e8c"
                      strokeWidth={2.5}
                      fill="url(#trafficGrad)"
                      dot={{ fill: '#e91e8c', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: '#ff8a65' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="dash-chart-sub">*Estimated based on your industry &amp; package</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="second-call"
            className="dash-action-center dash-action-second"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="dash-action-title">Unlock Your Strategy Session</h2>
            <p className="dash-action-desc">Your discovery call is complete! <br />Book your in-depth 60-min strategy call for just ₹99.</p>
            <motion.button
              className="dash-action-cta dash-razorpay-btn"
              onClick={() => navigate('/dashboard/calls')}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              Pay ₹99 &amp; Book Strategy Call →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats row */}
      <motion.div
        className="dash-stats-row"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
      >
        {[
          { label: 'Project Status', value: 'In Progress', icon: '🔄' },
          { label: 'Package', value: user?.package_type === 'pro' ? 'Pro Growth' : 'Essential', icon: '📦' },
          { label: 'Days Until Launch', value: '~18', icon: '🚀' },
          { label: 'Calls Completed', value: '0 / 2', icon: '📞' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="dash-stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.07 }}
          >
            <span className="dash-stat-icon">{s.icon}</span>
            <div>
              <p className="dash-stat-value">{s.value}</p>
              <p className="dash-stat-label">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        className="dash-activity-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="dash-section-title">
          <Clock size={16} /> Recent Activity
        </h3>
        <div className="dash-activity-list">
          {loading
            ? [1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 44, borderRadius: 10, marginBottom: 8 }} />)
            : summary?.recent_activity?.map((item, i) => (
              <motion.div
                key={item.id}
                className="dash-activity-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.07 }}
              >
                <span className="dash-activity-icon">{item.icon}</span>
                <div>
                  <p className="dash-activity-text">{item.text}</p>
                  <p className="dash-activity-time">{item.time}</p>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>
    </div>
  );
}
