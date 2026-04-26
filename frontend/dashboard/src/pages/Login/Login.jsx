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
  const [otp, setOtp] = useState('');
  const [authMode, setAuthMode] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (authMode === 'password') {
        if (!email || !password) throw new Error('Please fill in all fields.');
        const { user } = await login(email, password);
        loginUser(user);
        navigate('/dashboard');
      } else if (authMode === 'otp') {
        if (!otpSent) {
          if (!email) throw new Error('Please enter your email.');
          // Simulate OTP generation
          await new Promise(r => setTimeout(r, 800));
          setOtpSent(true);
        } else {
          if (!otp) throw new Error('Please enter the OTP.');
          // Simulate OTP verification
          await new Promise(r => setTimeout(r, 800));
          if (otp !== '123456') throw new Error('Invalid OTP. Use 123456');
          // Mock login success
          const { user } = await login(email, 'password');
          loginUser(user);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth URL
    window.location.href = 'http://localhost:8000/api/accounts/google/login/';
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
                placeholder="123456"
                maxLength={6}
              />
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

        <button type="button" className="google-login-btn" onClick={handleGoogleLogin}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
          Continue with Google
        </button>

        <p className="login-footer-text">
          Need help? <a href="mailto:hello@web-o-builts.com">Contact us</a>
        </p>
      </motion.div>

      {/* Bottom branding */}
      <p className="login-branding">© 2026 Web-o-Builts. All rights reserved.</p>
    </div>
  );
}
