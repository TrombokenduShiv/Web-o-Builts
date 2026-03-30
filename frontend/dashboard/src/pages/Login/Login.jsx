import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api';
import './Login.css';

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      const { user } = await login(email, password);
      loginUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated blobs */}
      <div className="login-blobs" aria-hidden="true">
        <div className="login-blob lb-1" />
        <div className="login-blob lb-2" />
        <div className="login-blob lb-3" />
        <div className="login-blob lb-4" />
      </div>

      {/* Grid overlay */}
      <div className="login-grid" aria-hidden="true" />

      {/* Demo banner */}
      <div className="login-demo-banner">
        <span>🔑</span>
        Demo Mode — use any email &amp; password: <strong>password</strong>
      </div>

      {/* Card */}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.2, 0.64, 1] }}
      >
        {/* Top gloss */}
        <div className="login-card-gloss" />

        {/* Logo */}
        <div className="login-logo">
          <img src="/logo.png" alt="WebCraft Sutra" className="login-logo-img" />
        </div>

        <h1 className="login-title">Client Portal</h1>
        <p className="login-subtitle">Sign in to manage your project.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email field */}
          <div className={`login-field ${emailFocused || email ? 'active' : ''}`}>
            <label htmlFor="loginEmail">Email Address</label>
            <input
              id="loginEmail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          {/* Password field */}
          <div className={`login-field ${passFocused || password ? 'active' : ''}`}>
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                className="login-error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                ⚠ {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            className="login-submit"
            disabled={loading}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {loading ? (
              <span className="login-spinner" aria-label="Loading" />
            ) : (
              <>Sign In to Dashboard →</>
            )}
          </motion.button>
        </form>

        <p className="login-footer-text">
          Need help? <a href="mailto:hello@webcraftsutra.com">Contact us</a>
        </p>
      </motion.div>

      {/* Bottom branding */}
      <p className="login-branding">© 2026 WebCraft Sutra. All rights reserved.</p>
    </div>
  );
}
