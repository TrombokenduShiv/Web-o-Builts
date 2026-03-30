import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getAnalyticsMetrics, getMaintenanceLogs } from '../../services/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Eye, Star, MousePointer, Lock } from 'lucide-react';
import './Analytics.css';

const StatBlock = ({ icon: Icon, label, value, change, delay }) => (
  <motion.div
    className="ana-stat"
    initial={{ opacity:0, y:16 }}
    animate={{ opacity:1, y:0 }}
    transition={{ delay }}
  >
    <div className="ana-stat-icon-wrap"><Icon size={18} /></div>
    <div className="ana-stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
    <div className="ana-stat-label">{label}</div>
    <div className={`ana-stat-change ${change?.includes('+') || change?.includes('-1') ? 'up' : 'neutral'}`}>
      {change}
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ana-tooltip">
      <p className="ana-tooltip-label">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="ana-tooltip-val">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    setLoading(true);
    setForbidden(false);
    Promise.all([
      getAnalyticsMetrics(user?.package_type),
      getMaintenanceLogs(),
    ]).then(([m, l]) => {
      setMetrics(m);
      setLogs(l);
      setLoading(false);
    }).catch(err => {
      if (err.status === 403) { setForbidden(true); setLoading(false); }
    });
  }, [user?.package_type]);

  if (forbidden) {
    return (
      <div className="ana-page">
        <div className="ana-upsell-bg">
          <motion.div
            className="ana-upsell-modal"
            initial={{ opacity:0, scale:0.92 }}
            animate={{ opacity:1, scale:1 }}
            transition={{ type:'spring', stiffness:300 }}
          >
            <div className="ana-upsell-icon"><Lock size={32} /></div>
            <h2 className="ana-upsell-title">Pro Feature</h2>
            <p className="ana-upsell-desc">
              Real-time analytics, keyword tracking and monthly maintenance logs are
              exclusive to the <strong>Pro Growth</strong> package.
            </p>
            <ul className="ana-upsell-perks">
              {['Monthly Visitors & Impressions', 'Keyword Position Tracking', 'Competitor Gap Analysis', 'Maintenance Activity Log'].map(p => (
                <li key={p}>✦ {p}</li>
              ))}
            </ul>
            <button className="btn-primary" style={{ width:'100%', marginTop:8 }}>
              Upgrade to Pro →
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="ana-page">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <h1 className="page-title">Performance <span className="gradient-text">&amp; Analytics</span></h1>
        <p className="page-subtitle">Track your website's growth, rankings, and maintenance activity.</p>
      </motion.div>

      {/* Stat blocks */}
      <div className="ana-stats-grid">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height:110, borderRadius:16 }} />)
        ) : metrics ? (
          <>
            <StatBlock icon={TrendingUp}    label="Monthly Visitors"  value={metrics.visitors.value}    change={metrics.visitors.change}    delay={0.1} />
            <StatBlock icon={Eye}           label="Impressions"        value={metrics.impressions.value} change={metrics.impressions.change} delay={0.17} />
            <StatBlock icon={Star}          label="Avg. Position"      value={`#${metrics.position.value}`} change={metrics.position.change}  delay={0.24} />
            <StatBlock icon={MousePointer}  label="Clicks"             value={metrics.clicks.value}      change={metrics.clicks.change}      delay={0.31} />
          </>
        ) : null}
      </div>

      {/* Traffic Line Chart */}
      <motion.div className="ana-chart-card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <h3 className="ana-chart-title">Traffic Growth (Last 6 Months)</h3>
        {loading ? (
          <div className="shimmer" style={{ height:220, borderRadius:10 }} />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={metrics?.traffic_data}>
              <defs>
                <linearGradient id="visitorLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#e91e8c" />
                  <stop offset="100%" stopColor="#ff8a65" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill:'rgba(196,184,224,0.55)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'rgba(196,184,224,0.40)', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:'0.8rem', paddingTop:'12px' }} />
              <Line
                type="monotone"
                dataKey="visitors"
                name="Visitors"
                stroke="url(#visitorLine)"
                strokeWidth={2.5}
                dot={{ fill:'#e91e8c', r:4, strokeWidth:0 }}
                activeDot={{ r:6, fill:'#ff8a65' }}
                strokeDasharray="0"
              />
              <Line
                type="monotone"
                dataKey="impressions"
                name="Impressions"
                stroke="rgba(91,156,246,0.8)"
                strokeWidth={2}
                dot={{ fill:'#5b9cf6', r:3, strokeWidth:0 }}
                activeDot={{ r:5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Keyword Bar Chart */}
      <motion.div className="ana-chart-card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
        <h3 className="ana-chart-title">Keyword Rankings (Position — Lower is Better)</h3>
        {loading ? (
          <div className="shimmer" style={{ height:200, borderRadius:10 }} />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics?.keyword_data} layout="vertical" margin={{ left: 20 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#e91e8c" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ff8a65" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill:'rgba(196,184,224,0.45)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="keyword" tick={{ fill:'rgba(196,184,224,0.6)', fontSize:11 }} axisLine={false} tickLine={false} width={150} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="position" name="Position" fill="url(#barGrad)" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Maintenance Log */}
      <motion.div className="ana-log-card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}>
        <h3 className="ana-chart-title">Maintenance Log</h3>
        <div className="ana-timeline">
          {loading
            ? [1,2,3].map(i => <div key={i} className="shimmer" style={{ height:44, borderRadius:8, marginBottom:8 }} />)
            : logs.map((log, i) => (
              <motion.div
                key={log.id}
                className="ana-timeline-item"
                initial={{ opacity:0, x:-12 }}
                animate={{ opacity:1, x:0 }}
                transition={{ delay: 0.45 + i * 0.06 }}
              >
                <div className="ana-timeline-dot" />
                <div className="ana-timeline-content">
                  <p className="ana-timeline-text">{log.action}</p>
                  <p className="ana-timeline-date">{log.date}</p>
                </div>
              </motion.div>
            ))
          }
        </div>
      </motion.div>
    </div>
  );
}
