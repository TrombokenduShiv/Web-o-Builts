import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBillingStatus, signAgreement, initiateAdvancePayment, getBillingDocuments } from '../../services/api';
import { FileText, Download, CreditCard, CheckCircle, Shield } from 'lucide-react';
import './Billing.css';

const slideVariants = {
  enter: dir => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  dir => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function Billing() {
  const [tab, setTab] = useState(0);
  const [prevTab, setPrevTab] = useState(0);
  const [billing, setBilling] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sigName, setSigName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payDone, setPayDone] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const checkRef = useRef(null);

  useEffect(() => {
    Promise.all([getBillingStatus(), getBillingDocuments()]).then(([b, d]) => {
      setBilling(b);
      setDocs(d);
      setLoading(false);
    });
  }, []);

  const switchTab = (idx) => {
    setPrevTab(tab);
    setTab(idx);
  };

  const dir = tab > prevTab ? 1 : -1;

  const handleSign = async () => {
    if (!agreed || !sigName.trim()) return;
    setSigning(true);
    await signAgreement(sigName);
    setSigning(false);
    setSigned(true);
  };

  const handleAgree = () => {
    setAgreed(v => !v);
    setShowCheck(true);
  };

  const handlePay = async () => {
    if (!signed) return;
    setPayLoading(true);
    await initiateAdvancePayment();
    setPayLoading(false);
    setPayDone(true);
  };

  const canSign = sigName.trim().length >= 3 && agreed;
  const canPay  = signed && !payDone;

  return (
    <div className="billing-page">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <h1 className="page-title">Billing <span className="gradient-text">&amp; Contracts</span></h1>
        <p className="page-subtitle">Manage your agreement, payments, and financial documents.</p>
      </motion.div>

      {/* Tab Bar */}
      <div className="billing-tabs">
        {['Active Agreements & Payments', 'Document Vault'].map((label, i) => (
          <button
            key={label}
            className={`billing-tab-btn ${tab === i ? 'active' : ''}`}
            onClick={() => switchTab(i)}
          >
            {tab === i && (
              <motion.div className="billing-tab-underline" layoutId="billingTabUnderline"
                transition={{ type:'spring', stiffness:400, damping:30 }} />
            )}
            {i === 0 ? <CreditCard size={15} /> : <FileText size={15} />}
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait" custom={dir}>
        {tab === 0 ? (
          <motion.div
            key="tab0"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type:'spring', stiffness:320, damping:30 }}
          >
            {/* Package Scope Card */}
            {loading ? (
              <div className="shimmer" style={{ height:100, borderRadius:16, marginBottom:20 }} />
            ) : (
              <motion.div className="billing-scope-card" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <div className="billing-scope-left">
                  <div className="billing-scope-pkg">{billing?.package}</div>
                  <p className="billing-scope-label">Project Value</p>
                  <p className="billing-scope-price">₹{billing?.total_price?.toLocaleString('en-IN')}</p>
                </div>
                <div className="billing-scope-divider" />
                <div className="billing-scope-right">
                  <div className="billing-scope-item">
                    <span className="billing-scope-dot" style={{ background: billing?.contract_signed ? '#4caf87' : '#ffb547' }} />
                    Contract {billing?.contract_signed ? 'Signed' : 'Pending Signature'}
                  </div>
                  <div className="billing-scope-item">
                    <span className="billing-scope-dot" style={{ background: billing?.advance_paid ? '#4caf87' : '#ffb547' }} />
                    Advance (30%) — ₹{billing?.advance_amount?.toLocaleString('en-IN')}
                    {billing?.advance_paid ? ' Paid' : ' Pending'}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contract — OPAQUE panel (strict readability rule) */}
            <div className="billing-contract-wrap">
              <div className="billing-contract-header">
                <Shield size={15} />
                <span>Website Development Agreement</span>
              </div>
              <div className="billing-contract-body">
                {loading ? (
                  <div className="shimmer" style={{ height:200, borderRadius:8 }} />
                ) : (
                  <pre className="billing-contract-text">{billing?.contract_text}</pre>
                )}
              </div>
            </div>

            {/* Signature field */}
            <div className="billing-sign-section">
              <div className="billing-sign-field-wrap">
                <div className={`billing-floating-field ${sigName ? 'has-value' : ''}`}>
                  <input
                    id="sigField"
                    type="text"
                    value={sigName}
                    onChange={e => setSigName(e.target.value)}
                    disabled={signed}
                    autoComplete="off"
                  />
                  <label htmlFor="sigField">Your Full Legal Name (Digital Signature)</label>
                </div>
              </div>

              {/* I Agree checkbox with SVG draw animation */}
              <label className={`billing-agree-row ${signed ? 'signed' : ''}`}>
                <div className="billing-checkbox-wrap" onClick={!signed ? handleAgree : undefined}>
                  <input type="checkbox" checked={agreed} onChange={() => {}} disabled={signed} />
                  <div className={`billing-custom-checkbox ${agreed ? 'checked' : ''}`}>
                    {(agreed || signed) && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path
                          d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span>
                  I have read and agree to the{' '}
                  <strong>Website Development Agreement</strong> above.
                </span>
              </label>

              {!signed ? (
                <motion.button
                  className={`billing-sign-btn ${canSign ? 'ready' : ''}`}
                  onClick={handleSign}
                  disabled={!canSign || signing}
                  whileTap={canSign ? { scale: 0.94 } : {}}
                  transition={{ type:'spring', stiffness:400, damping:17 }}
                >
                  {signing ? <span className="billing-spinner" /> : '✍ Sign Agreement'}
                </motion.button>
              ) : (
                <div className="billing-signed-confirm">
                  <CheckCircle size={18} color="#4caf87" /> Agreement signed successfully!
                </div>
              )}
            </div>

            {/* 30% Advance Payment Button — liquid wipe animation */}
            <div className="billing-pay-section">
              <p className="billing-pay-label">
                30% Advance Payment (₹{billing?.advance_amount?.toLocaleString('en-IN')})
              </p>
              <div className="billing-pay-btn-wrap">
                <motion.button
                  className={`billing-pay-btn ${canPay ? 'active' : ''} ${payDone ? 'done' : ''}`}
                  onClick={handlePay}
                  disabled={!canPay || payLoading}
                  whileTap={canPay ? { scale: 0.94 } : {}}
                  transition={{ type:'spring', stiffness:400, damping:17 }}
                >
                  {/* Liquid wipe fill overlay */}
                  {canPay && !payDone && (
                    <motion.span
                      className="billing-pay-fill"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                    />
                  )}
                  <span className="billing-pay-label-inner">
                    {payDone
                      ? <><CheckCircle size={16} /> Payment Complete!</>
                      : payLoading
                        ? <><span className="billing-spinner" /> Processing...</>
                        : signed
                          ? <>Pay ₹{billing?.advance_amount?.toLocaleString('en-IN')} via Razorpay →</>
                          : <>Sign the Agreement First</>
                    }
                  </span>
                </motion.button>
                {!signed && (
                  <p className="billing-pay-hint">Button unlocks after you sign the agreement above.</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tab1"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type:'spring', stiffness:320, damping:30 }}
          >
            {/* Document Vault */}
            <div className="billing-vault-card">
              <div className="billing-vault-header">
                <span>Document Name</span>
                <span>Date</span>
                <span>Type</span>
                <span>Size</span>
                <span>Download</span>
              </div>
              {loading
                ? [1,2,3].map(i => (
                    <div key={i} className="shimmer" style={{ height:52, borderRadius:8, marginBottom:4 }} />
                  ))
                : docs.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    className="billing-vault-row"
                    initial={{ opacity:0, x:-12 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <span className="billing-vault-name">
                      <FileText size={14} /> {doc.name}
                    </span>
                    <span>{doc.date}</span>
                    <span>
                      <span className={`billing-doc-type-badge ${doc.type.toLowerCase()}`}>{doc.type}</span>
                    </span>
                    <span>{doc.size}</span>
                    <a href={doc.url} className="billing-download-btn" download>
                      <Download size={14} /> Download
                    </a>
                  </motion.div>
                ))
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
