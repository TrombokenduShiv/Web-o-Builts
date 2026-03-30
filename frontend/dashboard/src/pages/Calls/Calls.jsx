import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableSlots, bookCall, getCallHistory, initiateSecondCallPayment } from '../../services/api';
import { Video, Clock, CheckCircle, ChevronRight, Phone } from 'lucide-react';
import './Calls.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Calls() {
  const [slots, setSlots] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [topics, setTopics] = useState('');
  const [step, setStep] = useState('pick'); // pick | confirm | booked
  const [meetLink, setMeetLink] = useState('');
  const [booking, setBooking] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payDone, setPayDone] = useState(false);

  useEffect(() => {
    Promise.all([getAvailableSlots(), getCallHistory()]).then(([s, h]) => {
      setSlots(s);
      setHistory(h);
      setLoading(false);
    });
  }, []);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    setBooking(true);
    const slot = `${selectedDate.date}T${selectedTime}:00Z`;
    const result = await bookCall(slot, topics);
    setMeetLink(result.meet_link);
    setBooking(false);
    setStep('booked');
  };

  const handlePaySecondCall = async () => {
    setPayLoading(true);
    await initiateSecondCallPayment();
    setPayLoading(false);
    setPayDone(true);
  };

  // Group slots into weeks for calendar display
  const slotMap = {};
  slots.forEach(s => { slotMap[s.date] = s.times; });

  return (
    <div className="calls-page">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
        <h1 className="page-title">Scheduling <span className="gradient-text">&amp; Calls</span></h1>
        <p className="page-subtitle">Book your discovery call and manage your consultation pipeline.</p>
      </motion.div>

      {/* ── First Call Section ── */}
      <motion.div className="calls-card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
        <div className="calls-card-header">
          <div className="calls-card-icon-wrap"><Phone size={18} /></div>
          <div>
            <h2 className="calls-section-title">Discovery Call <span className="calls-free-badge">Free</span></h2>
            <p className="calls-section-sub">30-minute session via Google Meet</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'pick' && (
            <motion.div key="pick" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              {/* Calendar grid */}
              <div className="calls-calendar-label">Select a Date</div>
              {loading ? (
                <div className="calls-calendar-grid">
                  {[...Array(10)].map((_,i) => (
                    <div key={i} className="shimmer" style={{ height:72, borderRadius:14 }} />
                  ))}
                </div>
              ) : (
                <div className="calls-calendar-grid">
                  {slots.map(slot => {
                    const d = new Date(slot.date + 'T00:00:00');
                    const isSelected = selectedDate?.date === slot.date;
                    return (
                      <motion.button
                        key={slot.date}
                        className={`cal-day ${isSelected ? 'selected' : ''}`}
                        onClick={() => { setSelectedDate(slot); setSelectedTime(null); }}
                        whileTap={{ scale: 0.88 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      >
                        <span className="cal-day-name">{DAYS[d.getDay()]}</span>
                        <span className="cal-day-num">{d.getDate()}</span>
                        <span className="cal-day-month">{MONTHS[d.getMonth()]}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Time slots */}
              <AnimatePresence>
                {selectedDate && (
                  <motion.div
                    initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                  >
                    <div className="calls-calendar-label" style={{ marginTop:20 }}>Select a Time</div>
                    <div className="calls-time-grid">
                      {selectedDate.times.map(t => (
                        <motion.button
                          key={t}
                          className={`calls-time-pill ${selectedTime === t ? 'selected' : ''}`}
                          onClick={() => setSelectedTime(t)}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                          {t}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Topics */}
              <AnimatePresence>
                {selectedTime && (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="calls-topics-wrap">
                    <label className="calls-input-label">Discussion Topics (optional)</label>
                    <textarea
                      className="calls-textarea"
                      placeholder="e.g. website redesign, SEO goals, competitor analysis..."
                      value={topics}
                      onChange={e => setTopics(e.target.value)}
                      rows={3}
                    />
                    <motion.button
                      className="btn-primary calls-book-btn"
                      onClick={() => setStep('confirm')}
                      whileTap={{ scale: 0.93 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      Review Booking <ChevronRight size={16} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div key="confirm" className="calls-confirm-box"
              initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
              <h3 className="calls-confirm-title">Confirm Your Booking</h3>
              <div className="calls-confirm-row"><span>📅 Date</span><strong>{selectedDate?.date}</strong></div>
              <div className="calls-confirm-row"><span>⏰ Time</span><strong>{selectedTime} IST</strong></div>
              <div className="calls-confirm-row"><span>📝 Topics</span><strong>{topics || 'None specified'}</strong></div>
              <div className="calls-confirm-actions">
                <button className="btn-outline" onClick={() => setStep('pick')}>← Back</button>
                <motion.button
                  className="btn-primary"
                  onClick={handleBook}
                  disabled={booking}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type:'spring', stiffness:400, damping:17 }}
                >
                  {booking ? <span className="calls-spinner" /> : 'Confirm Booking ✓'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'booked' && (
            <motion.div key="booked" className="calls-booked-box"
              initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
              transition={{ type:'spring', stiffness:300 }}>
              <CheckCircle size={48} color="#4caf87" />
              <h3 className="calls-booked-title">Call Confirmed! 🎉</h3>
              <p className="calls-booked-sub">We'll send you a reminder 30 minutes before.</p>
              <a href={meetLink} target="_blank" rel="noopener noreferrer" className="calls-meet-link">
                <Video size={16} /> Join Google Meet
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Second Call (₹99) ── */}
      <motion.div className="calls-card calls-second-card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <div className="calls-card-header">
          <div className="calls-card-icon-wrap calls-icon-paid"><Video size={18} /></div>
          <div>
            <h2 className="calls-section-title">Strategy Call <span className="calls-price-badge">₹99</span></h2>
            <p className="calls-section-sub">60-minute in-depth strategy and planning session</p>
          </div>
        </div>
        <p className="calls-second-desc">
          In this session, we deep-dive into your SEO keyword strategy, content roadmap, competitor gaps, and
          finalise your website architecture. This ensures your website is built to rank from day one.
        </p>
        <div className="calls-second-perks">
          {['Keyword Research Report', 'Competitor Analysis', 'Content Roadmap', 'Site Architecture Plan'].map(p => (
            <div key={p} className="calls-perk"><CheckCircle size={14} /> {p}</div>
          ))}
        </div>
        <motion.button
          className={`calls-razorpay-btn ${payLoading ? 'processing' : ''} ${payDone ? 'done' : ''}`}
          onClick={handlePaySecondCall}
          disabled={payLoading || payDone}
          whileTap={{ scale: 0.94 }}
          transition={{ type:'spring', stiffness:400, damping:17 }}
        >
          {payDone
            ? <><CheckCircle size={16} /> Paid — Call Booked!</>
            : payLoading
              ? <><span className="calls-spinner" /> Processing Payment...</>
              : <>Pay ₹99 via Razorpay &amp; Book Call <ChevronRight size={16} /></>
          }
        </motion.button>
      </motion.div>

      {/* ── Call History ── */}
      <motion.div className="calls-card" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
        <h2 className="calls-section-title" style={{ marginBottom:16 }}>
          <Clock size={16} /> Call History
        </h2>
        {history.length === 0
          ? <p className="calls-empty">No past calls yet.</p>
          : (
            <div className="calls-history-table">
              <div className="calls-history-head">
                <span>Type</span><span>Date</span><span>Duration</span><span>Status</span><span>Recording</span>
              </div>
              {history.map(c => (
                <div key={c.id} className="calls-history-row">
                  <span>{c.type}</span>
                  <span>{c.date}</span>
                  <span>{c.duration}</span>
                  <span className="calls-status-chip done">{c.status}</span>
                  <a href={c.meet_link} className="calls-history-link">View →</a>
                </div>
              ))}
            </div>
          )
        }
      </motion.div>
    </div>
  );
}
