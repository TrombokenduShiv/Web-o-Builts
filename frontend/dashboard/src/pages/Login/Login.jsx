import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { login, generateOtp, loginWithOtp, googleTokenLogin } from '../../services/api';
import './Login.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [authMode, setAuthMode] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);

  // ── Google Identity Services ──
  const handleGoogleCredential = useCallback(async (response) => {
    setError('');
    setLoading(true);
    try {
      const result = await googleTokenLogin(response.credential);
      loginUser(result.user);
      navigate('/dashboard');
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
        // Render the custom button
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

    // Load the Google Identity Services script if not already loaded
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    } else {
      initGoogle();
    }
  }, [handleGoogleCredential]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'password') {
        if (!email || !password) throw new Error('Please fill in all fields.');
        const result = await login(email, password);
        loginUser(result.user);
        navigate('/dashboard');
      } else if (authMode === 'otp') {
        if (!otpSent) {
          if (!email) throw new Error('Please enter your email.');
          await generateOtp(email);
          setOtpSent(true);
        } else {
          if (!otp) throw new Error('Please enter the OTP.');
          const result = await loginWithOtp(email, otp);
          loginUser(result.user);
          navigate('/dashboard');
        }
      }
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

        <div className="login-tabs">
          <button
            className={`login-tab ${authMode === 'password' ? 'active' : ''}`}
            onClick={() => { setAuthMode('password'); setOtpSent(false); setError(''); }}
          >Password</button>
          <button
            className={`login-tab ${authMode === 'otp' ? 'active' : ''}`}
            onClick={() => { setAuthMode('otp'); setError(''); }}
          >OTP Login</button>
        </div>

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

          {/* Password field - only show if mode is password */}
          {authMode === 'password' && (
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
          )}

          {/* OTP field - only show if mode is otp and otp is sent */}
          {authMode === 'otp' && otpSent && (
            <div className={`login-field ${otpFocused || otp ? 'active' : ''}`}>
              <label htmlFor="loginOtp">One-Time Password</label>
              <input
                id="loginOtp"
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                onFocus={() => setOtpFocused(true)}
                onBlur={() => setOtpFocused(false)}
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code from your email"
                maxLength={6}
              />
              <p className="login-otp-hint">Check your email for the verification code.</p>
            </div>
          )}

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
              <>{authMode === 'password' ? 'Sign In' : (otpSent ? 'Verify OTP' : 'Send OTP')} →</>
            )}
          </motion.button>
        </form>

        <div className="login-divider"><span>OR</span></div>

        {/* Google Sign-In */}
        {GOOGLE_CLIENT_ID ? (
          <div id="googleSignInBtn" className="google-signin-container" />
        ) : (
          <button type="button" className="google-login-btn" disabled>
            <img src="/google-logo.png" alt="Google" />
            Google Sign-In (not configured)
          </button>
        )}

        <p className="login-register-link">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>

        <p className="login-footer-text">
          Need help? <a href="mailto:hello@web-o-builts.com">Contact us</a>
        </p>
      </motion.div>

      {/* Bottom branding */}
      <p className="login-branding">© 2026 Web-o-Builts. All rights reserved.</p>
    </div>
  );
}
