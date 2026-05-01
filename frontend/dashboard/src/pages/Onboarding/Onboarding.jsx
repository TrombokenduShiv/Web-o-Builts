import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/api';
import './Onboarding.css';

export default function Onboarding() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState(user?.business_name || '');
  const [industry, setIndustry] = useState(user?.industry || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!businessName.trim()) {
      setError('Business name is required to get started.');
      return;
    }

    setLoading(true);
    try {
      const updatedData = {
        business_name: businessName.trim(),
        industry: industry.trim(),
        phone_number: phoneNumber.trim(),
      };

      const result = await updateProfile(updatedData);
      // Update local user data
      loginUser({ ...user, ...updatedData, is_new: false });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-blobs" aria-hidden="true">
        <div className="onboarding-blob ob-1" />
        <div className="onboarding-blob ob-2" />
      </div>
      <div className="onboarding-grid" aria-hidden="true" />

      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.34, 1.2, 0.64, 1] }}
      >
        <div className="onboarding-card-gloss" />

        <div className="onboarding-logo">
          <img src="/logo-icon.png" alt="Web-o-Builts" className="onboarding-logo-img" />
        </div>

        <h1 className="onboarding-title">Welcome to Web-o-Builts! 🎉</h1>
        <p className="onboarding-subtitle">
          Tell us about your business so we can tailor your experience.
        </p>

        {/* Progress dots */}
        <div className="onboarding-progress">
          <div className="onboarding-progress-dot active" />
          <div className={`onboarding-progress-dot ${businessName ? 'active' : ''}`} />
          <div className={`onboarding-progress-dot ${industry ? 'active' : ''}`} />
        </div>

        <form className="onboarding-form" onSubmit={handleSubmit} noValidate>
          <div className="onboarding-field">
            <label htmlFor="obBusiness">Business Name *</label>
            <input
              id="obBusiness"
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="Your business or brand name"
              autoComplete="organization"
              autoFocus
            />
          </div>

          <div className="onboarding-row">
            <div className="onboarding-field">
              <label htmlFor="obIndustry">Industry</label>
              <input
                id="obIndustry"
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="e.g. Retail, SaaS"
              />
            </div>
            <div className="onboarding-field">
              <label htmlFor="obPhone">Phone Number</label>
              <input
                id="obPhone"
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="onboarding-field">
            <label htmlFor="obWebsite">Current Website (optional)</label>
            <input
              id="obWebsite"
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://your-website.com"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                className="onboarding-error"
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
            className="onboarding-submit"
            disabled={loading}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {loading ? (
              <span className="onboarding-spinner" aria-label="Loading" />
            ) : (
              <>Let's Get Started 🚀</>
            )}
          </motion.button>
        </form>

        <p className="onboarding-skip">
          <button type="button" onClick={handleSkip}>Skip for now →</button>
        </p>
      </motion.div>

      <p className="onboarding-branding">© 2026 Web-o-Builts. All rights reserved.</p>
    </div>
  );
}
