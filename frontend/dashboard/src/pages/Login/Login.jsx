import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { login, googleTokenLogin } from '../../services/api';
import './Login.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  // ── Google Identity Services ──
  const handleGoogleCredential = useCallback(async (response) => {
    setError('');
    setLoading(true);
    try {
      const result = await googleTokenLogin(response.credential);
      loginUser(result.user);
      // Check if new user needs onboarding
      if (result.user.is_new || !result.user.business_name) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loginUser, navigate]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
        });
        const btnContainer = document.getElementById('googleSignInBtn');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            logo_alignment: 'center',
          });
        }
      }
    };

    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    } else {
      // Retry initialization after a brief delay if google not ready
      setTimeout(initGoogle, 300);
    }
  }, [handleGoogleCredential]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) throw new Error('Please fill in all fields.');
      const result = await login(email, password);
      loginUser(result.user);
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
          <img src="/logo-icon.png" alt="Web-o-Builts" className="login-logo-img" />
        </div>

        <h1 className="login-title">Client Portal</h1>
        <p className="login-subtitle">Sign in to manage your project.</p>

        {/* Google Sign-In */}
        {GOOGLE_CLIENT_ID ? (
          <div id="googleSignInBtn" className="google-signin-container" />
        ) : (
          <button type="button" className="google-login-btn" disabled>
            Google Sign-In (not configured)
          </button>
        )}

        <div className="login-divider"><span>OR</span></div>

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
              <>Sign In →</>
            )}
          </motion.button>
        </form>

        <p className="login-register-link">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>

        <p className="login-footer-text">
          Need help? <a href="mailto:webobuilts@gmail.com">Contact us</a>
        </p>
      </motion.div>

      {/* Bottom branding */}
      <p className="login-branding">© 2026 Web-o-Builts. All rights reserved.</p>
    </div>
  );
}
