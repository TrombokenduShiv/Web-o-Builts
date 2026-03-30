import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../services/api';
import { User, Lock, CheckCircle } from 'lucide-react';
import './Settings.css';

function FloatingField({ id, label, type='text', value, onChange, disabled, placeholder }) {
  return (
    <div className={`set-floating-field ${value ? 'has-value' : ''}`}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete="off"
        placeholder=" "
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();

  // Profile form
  const [phone, setPhone]     = useState('+91 98765 43210');
  const [address, setAddress] = useState('123, Business Park, Mumbai');
  const [website, setWebsite] = useState('sharmaenterprises.com');
  const [profLoading, setProfLoading] = useState(false);
  const [profSuccess, setProfSuccess] = useState(false);

  // Password form
  const [oldPass, setOldPass]   = useState('');
  const [newPass, setNewPass]   = useState('');
  const [confPass, setConfPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError]     = useState('');

  const handleProfile = async e => {
    e.preventDefault();
    setProfLoading(true);
    setProfSuccess(false);
    await updateProfile({ phone, address, website });
    setProfLoading(false);
    setProfSuccess(true);
    setTimeout(() => setProfSuccess(false), 3000);
  };

  const handlePassword = async e => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);
    if (newPass !== confPass) { setPassError('Passwords do not match.'); return; }
    if (newPass.length < 8)   { setPassError('Password must be at least 8 characters.'); return; }
    setPassLoading(true);
    try {
      await changePassword(oldPass, newPass);
      setPassSuccess(true);
      setOldPass(''); setNewPass(''); setConfPass('');
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err) {
      setPassError(err.message);
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="set-page">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <h1 className="page-title">Profile <span className="gradient-text">&amp; Settings</span></h1>
        <p className="page-subtitle">Manage your business profile and account security.</p>
      </motion.div>

      {/* Business Profile */}
      <motion.div className="set-card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
        <div className="set-card-header">
          <div className="set-card-icon"><User size={18} /></div>
          <div>
            <h2 className="set-section-title">Business Profile</h2>
            <p className="set-section-sub">Update your contact and business information.</p>
          </div>
        </div>

        {/* Avatar preview */}
        <div className="set-avatar-row">
          <div className="set-avatar-big">{user?.avatar_initials || 'RS'}</div>
          <div>
            <p className="set-avatar-name">{user?.owner_name}</p>
            <p className="set-avatar-email">{user?.email}</p>
            <button className="set-avatar-upload-btn">Upload Logo</button>
          </div>
        </div>

        <form className="set-form" onSubmit={handleProfile}>
          <div className="set-form-grid">
            <FloatingField id="setBizName"  label="Business Name" value={user?.business_name || ''} onChange={() => {}} disabled />
            <FloatingField id="setOwner"    label="Owner Name"    value={user?.owner_name || ''}    onChange={() => {}} disabled />
            <FloatingField id="setPhone"    label="Mobile Number" value={phone}    onChange={e => setPhone(e.target.value)} />
            <FloatingField id="setWebsite"  label="Website / Domain" value={website} onChange={e => setWebsite(e.target.value)} />
            <FloatingField id="setAddress"  label="Business Address" value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div className="set-form-footer">
            <motion.button
              type="submit"
              className="set-submit-btn"
              disabled={profLoading}
              whileTap={{ scale: 0.94 }}
              transition={{ type:'spring', stiffness:400, damping:17 }}
            >
              {profLoading
                ? <><span className="set-spinner" /> Saving...</>
                : profSuccess
                  ? <><CheckCircle size={16} /> Saved!</>
                  : 'Save Profile'
              }
            </motion.button>
            {profSuccess && (
              <motion.p className="set-success-msg" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <CheckCircle size={14} /> Profile updated successfully.
              </motion.p>
            )}
          </div>
        </form>
      </motion.div>

      {/* Security */}
      <motion.div className="set-card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <div className="set-card-header">
          <div className="set-card-icon set-card-icon-sec"><Lock size={18} /></div>
          <div>
            <h2 className="set-section-title">Security</h2>
            <p className="set-section-sub">Change your account password.</p>
          </div>
        </div>

        <form className="set-form" onSubmit={handlePassword}>
          <div className="set-form-grid set-form-grid-single">
            <FloatingField id="setOldPass"  type="password" label="Current Password" value={oldPass}  onChange={e => setOldPass(e.target.value)} />
            <FloatingField id="setNewPass"  type="password" label="New Password"     value={newPass}  onChange={e => setNewPass(e.target.value)} />
            <FloatingField id="setConfPass" type="password" label="Confirm New Password" value={confPass} onChange={e => setConfPass(e.target.value)} />
          </div>

          {passError && (
            <motion.p className="set-error-msg" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              ⚠ {passError}
            </motion.p>
          )}

          <div className="set-form-footer">
            <motion.button
              type="submit"
              className="set-submit-btn set-submit-btn-sec"
              disabled={passLoading}
              whileTap={{ scale: 0.94 }}
              transition={{ type:'spring', stiffness:400, damping:17 }}
            >
              {passLoading
                ? <><span className="set-spinner" /> Updating...</>
                : passSuccess
                  ? <><CheckCircle size={16} /> Password Changed!</>
                  : 'Change Password'
              }
            </motion.button>

            {passSuccess && (
              <motion.p className="set-success-msg" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <CheckCircle size={14} /> Password changed successfully.
              </motion.p>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
