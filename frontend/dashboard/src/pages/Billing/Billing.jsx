import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBillingStatus, signAgreement, initiateAdvancePayment, getBillingDocuments, verifyRazorpayPayment } from '../../services/api';
import { FileText, Download, CreditCard, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Billing.css';

const slideVariants = {
  enter: dir => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  dir => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

/* ── Policy Document Content (full clauses) ── */
const PRIVACY_POLICY_TEXT = `PRIVACY POLICY — Last Updated: May 1, 2026

This Privacy Policy describes how Web-o-Builts collects, uses, processes, stores, and protects personal data of users in compliance with applicable Indian laws, including the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000.

1. DEFINITIONS: "Personal Data" means any data about an individual who is identifiable by or in relation to such data. "Processing" includes collection, storage, use, disclosure, or deletion of data. "Data Principal" refers to the individual to whom the personal data relates.

2. INFORMATION WE COLLECT: Personal Identification (Full Name, Email, Phone); Business Information (name, status); Account Information (login credentials); Transactional Information (payment details via Fiverr); Technical & Usage Data (IP, browser, device, analytics).

3. PURPOSE: To communicate regarding projects; provide web development services; manage accounts; send marketing communications; improve services through analytics; comply with legal obligations.

4. LEGAL BASIS: Your consent; contractual obligations; legitimate business interests; compliance with laws.

5. DATA STORAGE: Cloud-based platforms, Fiverr infrastructure, internal databases including Google Sheets. Data retained only as long as necessary.

6. DATA SHARING: We do not sell personal data. We may share with analytics providers (Google Analytics), payment processors (Fiverr), hosting providers. Third parties must maintain confidentiality.

7. DATA SECURITY: Reasonable technical and organizational measures implemented. No absolute guarantee of security.

8. USER RIGHTS: Access, correction, and withdrawal of consent. Contact: webobuilts@gmail.com

9. CHILDREN'S PRIVACY: Services not intended for individuals under 18.

10. COOKIES: No direct cookies. Third-party tools may use tracking technologies.

11. INTERNATIONAL TRANSFER: Data may be processed outside India with applicable safeguards.

12. MARKETING: Opt out at any time by contacting us.

13. THIRD-PARTY LINKS: Not responsible for third-party privacy practices.

14. GOVERNING LAW: Laws of India. Jurisdiction: Chandigarh and Assam, India.

15. CHANGES: May be updated at any time. Effective upon posting.

16. CONTACT: webobuilts@gmail.com`;

const TERMS_OF_SERVICE_TEXT = `TERMS OF SERVICE — Last Updated: May 1, 2026

These Terms govern your use of services provided by Web-o-Builts, a freelance web development service provider operating in India.

1. SERVICES: Static/dynamic website development, full-stack solutions, customization, SEO optimization, e-commerce integration. Delivered based on agreed scope.

2. ELIGIBILITY: Must be 18+ years of age.

3. USER RESPONSIBILITIES: Provide accurate information; submit content on time; ensure rights to content; no illegal use.

4. PAYMENTS: Processed via Fiverr or agreed platforms only. Prices communicated beforehand. Work begins after payment confirmation.

5. REVISIONS: Based on selected package. Extra revisions may incur charges. Major scope changes treated as new project.

6. PROJECT DELIVERY: Timelines depend on complexity. Client-caused delays not our responsibility. Complete when agreed features implemented.

7. INTELLECTUAL PROPERTY: Ownership transferred upon full payment. We may showcase in portfolio.

8. THIRD-PARTY SERVICES: We may integrate hosting, domain, payment gateways. Not responsible for their performance/policies.

9. LIMITATION OF LIABILITY: No liability for indirect/incidental/consequential damages. Not responsible for business losses, downtime, data loss. Total liability limited to amount paid.

10. TERMINATION: We may refuse/terminate service at discretion. No refunds for completed/partial work unless required by platform policies.

11. REFUND POLICY: Governed by Fiverr's policies. No refunds after substantial work. Partial refunds at discretion.

12. DATA AND PRIVACY: Governed by our Privacy Policy.

13. INTERNATIONAL CLIENTS: Must comply with local laws.

14. GOVERNING LAW: Laws of India. Jurisdiction: Chandigarh and Assam, India.

15. CHANGES: May be updated anytime. Continued use constitutes acceptance.

16. CONTACT: webobuilts@gmail.com`;

const REFUND_POLICY_TEXT = `REFUND POLICY — Last Updated: May 1, 2026

This Refund Policy outlines terms under which Web-o-Builts provides refunds for services offered via our website and Fiverr.

1. GENERAL: All sales generally non-refundable once work has commenced. Refunds only under specific conditions.

2. PLATFORM-BASED PAYMENTS: Fiverr payments subject to Fiverr's policies. Requests through Fiverr's resolution system.

3. ELIGIBILITY: Project not started; unable to deliver agreed service; mutual cancellation agreement.

4. NON-REFUNDABLE: Work started/completed; client-caused delays; change of mind; out-of-scope requests; subjective dissatisfaction.

5. PARTIAL REFUNDS: At discretion for partially completed projects or exceptional circumstances.

6. REVISIONS: Revisions per package. Refunds not granted for revision-resolvable issues.

7. PROJECT ABANDONMENT: No response for 7+ days = abandoned. No refunds; project marked complete.

8. CHARGEBACKS: Unauthorized chargebacks discouraged. Evidence of work may be provided. Legal action for fraud.

9. PROCESSING: Via original payment method. Timing depends on platform.

10. MODIFICATIONS: May be modified anytime.

11. GOVERNING LAW: Laws of India. Jurisdiction: Chandigarh and Assam, India.

12. CONTACT: webobuilts@gmail.com`;

export default function Billing() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [prevTab, setPrevTab] = useState(0);
  const [billing, setBilling] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sigName, setSigName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedRefund, setAgreedRefund] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payDone, setPayDone] = useState(false);

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
    if (!canSign) return;
    setSigning(true);
    try {
      await signAgreement(sigName);
    } catch (e) {
      console.warn('Agreement sign error:', e);
    }
    setSigning(false);
    setSigned(true);
  };

  const handlePay = async () => {
    if (!signed) return;
    setPayLoading(true);
    try {
      const orderData = await initiateAdvancePayment();
      const options = {
        key: 'rzp_test_dummy_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Web-o-Builts',
        description: '30% Advance Payment',
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            await verifyRazorpayPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );
            setPayDone(true);
          } catch (verifyErr) {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.owner_name || '',
          email: user?.email || '',
        },
        theme: { color: '#e91e8c' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert('Payment Failed: ' + response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initiate payment.');
    } finally {
      setPayLoading(false);
    }
  };

  const allPoliciesAgreed = agreedPrivacy && agreedTerms && agreedRefund;
  const canSign = sigName.trim().length >= 3 && agreed && allPoliciesAgreed;
  const canPay  = signed && !payDone;

  const renderPolicyCheckbox = (label, checked, onChange, docName) => (
    <label className={`billing-agree-row ${signed ? 'signed' : ''}`}>
      <div className="billing-checkbox-wrap" onClick={!signed ? onChange : undefined}>
        <input type="checkbox" checked={checked} onChange={() => {}} disabled={signed} />
        <div className={`billing-custom-checkbox ${checked ? 'checked' : ''}`}>
          {(checked || signed) && (
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
      <span>I have read and agree to the <strong>{docName}</strong>.</span>
    </label>
  );

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

            {/* Contract — Website Development Agreement */}
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

            {/* Privacy Policy Document */}
            <div className="billing-contract-wrap">
              <div className="billing-contract-header">
                <Shield size={15} />
                <span>Privacy Policy</span>
              </div>
              <div className="billing-contract-body">
                <pre className="billing-contract-text">{PRIVACY_POLICY_TEXT}</pre>
              </div>
            </div>

            {/* Terms of Service Document */}
            <div className="billing-contract-wrap">
              <div className="billing-contract-header">
                <Shield size={15} />
                <span>Terms of Service</span>
              </div>
              <div className="billing-contract-body">
                <pre className="billing-contract-text">{TERMS_OF_SERVICE_TEXT}</pre>
              </div>
            </div>

            {/* Refund Policy Document */}
            <div className="billing-contract-wrap">
              <div className="billing-contract-header">
                <Shield size={15} />
                <span>Refund Policy</span>
              </div>
              <div className="billing-contract-body">
                <pre className="billing-contract-text">{REFUND_POLICY_TEXT}</pre>
              </div>
            </div>

            {/* Signature & Agreement Section */}
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

              {/* Agreement checkbox */}
              <label className={`billing-agree-row ${signed ? 'signed' : ''}`}>
                <div className="billing-checkbox-wrap" onClick={!signed ? () => setAgreed(v => !v) : undefined}>
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

              {/* Policy agreement checkboxes */}
              {renderPolicyCheckbox('privacy', agreedPrivacy, () => setAgreedPrivacy(v => !v), 'Privacy Policy')}
              {renderPolicyCheckbox('terms', agreedTerms, () => setAgreedTerms(v => !v), 'Terms of Service')}
              {renderPolicyCheckbox('refund', agreedRefund, () => setAgreedRefund(v => !v), 'Refund Policy')}

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

            {/* 30% Advance Payment Button */}
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
                  <p className="billing-pay-hint">Button unlocks after you sign the agreement and accept all policies above.</p>
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
