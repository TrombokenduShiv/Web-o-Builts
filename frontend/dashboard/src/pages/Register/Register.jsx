import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { register, googleTokenLogin } from '../../services/api';
import './Register.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Register() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Google Identity Services ──
  const handleGoogleCredential = useCallback(async (response) => {
    setError('');
    setLoading(true);
    try {
      const result = await googleTokenLogin(response.credential);
      loginUser(result.user);
      // New Google users need onboarding
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
        const btnContainer = document.getElementById('googleSignUpBtn');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'signup_with',
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
      setTimeout(initGoogle, 300);
    }
  }, [handleGoogleCredential]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required.');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
      }

      const result = await register({
        email,
        password,
        business_name: businessName,
        industry,
        phone_number: phoneNumber,
      });

      loginUser(result.user);
      // If they filled business name in signup, go to dashboard, else onboarding
      if (businessName) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Animated blobs */}
      <div className="register-blobs" aria-hidden="true">
        <div className="register-blob rb-1" />
        <div className="register-blob rb-2" />
        <div className="register-blob rb-3" />
      </div>

      {/* Grid overlay */}
      <div className="register-grid" aria-hidden="true" />

      {/* Card */}
      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.2, 0.64, 1] }}
      >
        <div className="register-card-gloss" />

        <div className="register-logo">
          <img src="/logo-icon.png" alt="Web-o-Builts" className="register-logo-img" />
        </div>

        <h1 className="register-title">Create Your Account</h1>
        <p className="register-subtitle">Start your digital growth journey today.</p>

        {/* Google Sign-Up */}
        {GOOGLE_CLIENT_ID ? (
          <div id="googleSignUpBtn" className="google-signup-container" />
        ) : (
          <button type="button" className="google-signup-btn" disabled>
            Google Sign-Up (not configured)
          </button>
        )}

        <div className="register-divider"><span>OR</span></div>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="register-field">
            <label htmlFor="regEmail">Email Address *</label>
            <input
              id="regEmail"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="regPassword">Password *</label>
            <input
              id="regPassword"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="regBusiness">Business Name</label>
            <input
              id="regBusiness"
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="Your business or brand name"
              autoComplete="organization"
            />
          </div>

          <div className="register-row">
            <div className="register-field">
              <label htmlFor="regIndustry">Industry</label>
              <input
                id="regIndustry"
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="e.g. Retail, SaaS"
              />
            </div>

            <div className="register-field">
              <label htmlFor="regPhone">Phone</label>
              <input
                id="regPhone"
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                className="register-error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                ⚠ {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="register-submit"
            disabled={loading}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {loading ? (
              <span className="register-spinner" aria-label="Loading" />
            ) : (
              <>Create Account →</>
            )}
          </motion.button>
        </form>

        <p className="register-login-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </motion.div>

      <p className="register-branding">© 2026 Web-o-Builts. All rights reserved.</p>
    </div>
  );
}
