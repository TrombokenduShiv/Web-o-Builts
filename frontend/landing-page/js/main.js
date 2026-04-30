/* ============================================================
   WEB-O-BUILTS — MAIN JAVASCRIPT
   ============================================================ */

(function () {
  'use strict';

  /* ── API Configuration ── */
  var API_BASE = (window.__CONFIG && window.__CONFIG.API_BASE) || 'http://localhost:8000';
  var DASHBOARD_URL = (window.__CONFIG && window.__CONFIG.DASHBOARD_URL) || 'http://localhost:5173';
  var GOOGLE_CLIENT_ID = (window.__CONFIG && window.__CONFIG.GOOGLE_CLIENT_ID) || '';

  /* ────────────────────────────────────────────
     1. THEME TOGGLE (with liquid wave)
  ──────────────────────────────────────────── */
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeWaveCircle = document.getElementById('themeWaveCircle');

  // Load saved theme — default is DARK
  const savedTheme = localStorage.getItem('wob-theme') || 'dark';
  htmlEl.setAttribute('data-theme', savedTheme);
  themeToggle.setAttribute('aria-checked', savedTheme === 'dark' ? 'true' : 'false');

  themeToggle.addEventListener('click', function () {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    // Trigger liquid wave
    themeWaveCircle.classList.add('expand');

    setTimeout(function () {
      htmlEl.setAttribute('data-theme', newTheme);
      themeToggle.setAttribute('aria-checked', String(!isDark));
      localStorage.setItem('wob-theme', newTheme);
    }, 400);

    setTimeout(function () {
      themeWaveCircle.classList.remove('expand');
    }, 1000);
  });

  /* ────────────────────────────────────────────
     2. NAVBAR SCROLL BEHAVIOUR
  ──────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ────────────────────────────────────────────
     3. CTA — ANALYZE MY GROWTH
  ──────────────────────────────────────────── */
  const ctaBtn = document.getElementById('ctaBtn');
  const seoOverlay = document.getElementById('seoOverlay');
  const seoLabel = document.getElementById('seoLabel');
  const businessInput = document.getElementById('businessNameInput');

  /* ────────────────────────────────────────────
     3b. MIC BUTTON — Voice Input (Web Speech API)
  ──────────────────────────────────────────── */
  const micBtn = document.getElementById('micBtn');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    // Browser doesn't support it — dim the button
    micBtn.classList.add('unsupported');
    micBtn.title = 'Voice input not supported in this browser';
  } else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let isRecording = false;

    micBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });

    recognition.addEventListener('start', function () {
      isRecording = true;
      micBtn.classList.add('recording');
      micBtn.setAttribute('aria-label', 'Stop recording');
      businessInput.placeholder = 'Listening...';
      businessInput.focus();
    });

    recognition.addEventListener('result', function (e) {
      const transcript = Array.from(e.results)
        .map(function (r) { return r[0].transcript; })
        .join('');
      businessInput.value = transcript;
    });

    recognition.addEventListener('end', function () {
      isRecording = false;
      micBtn.classList.remove('recording');
      micBtn.setAttribute('aria-label', 'Voice input');
      businessInput.placeholder = 'Enter your business name...';
    });

    recognition.addEventListener('error', function (e) {
      isRecording = false;
      micBtn.classList.remove('recording');
      micBtn.setAttribute('aria-label', 'Voice input');
      businessInput.placeholder = 'Enter your business name...';
      if (e.error !== 'aborted') {
        businessInput.placeholder = 'Mic error — try again';
        setTimeout(function () {
          businessInput.placeholder = 'Enter your business name...';
        }, 2000);
      }
    });
  }

  const seoMessages = [
    'Scanning your market...',
    'Analysing competitors...',
    'Predicting traffic growth...',
    'Calculating SEO potential...',
    'Building your report...',
  ];

  /* ────────────────────────────────────────────
     3c. BUBBLE BURST SYSTEM
  ──────────────────────────────────────────── */
  var bubbleColors = [
    'rgba(124, 58, 237, 0.55)',
    'rgba(168, 85, 247, 0.50)',
    'rgba(236, 72, 153, 0.45)',
    'rgba(244, 63, 94, 0.40)',
    'rgba(139, 92, 246, 0.50)',
    'rgba(192, 132, 252, 0.45)',
    'rgba(249, 115, 22, 0.35)',
    'rgba(34, 197, 94, 0.35)',
  ];

  function spawnBubbleBurst(container, count) {
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var bubble = document.createElement('div');
      bubble.classList.add('bubble-particle');
      var size = Math.random() * 18 + 6;
      var x = Math.random() * 100;
      var y = Math.random() * 100;
      var dx = (Math.random() - 0.5) * 200;
      var dy = (Math.random() - 0.5) * 200;
      var dur = Math.random() * 3 + 2;
      var delay = Math.random() * 1.5;
      var color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];

      bubble.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + x + '%;top:' + y + '%;' +
        'background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), ' + color + ');' +
        'border: 1px solid rgba(255,255,255,0.15);' +
        '--dx:' + dx + 'px;--dy:' + dy + 'px;' +
        '--dur:' + dur + 's;--delay:' + delay + 's;';

      container.appendChild(bubble);
    }
  }

  /* Also spawn bubbles on the modal backdrop */
  function spawnBackdropBubbles() {
    var existing = document.getElementById('backdropBubbles');
    if (existing) existing.remove();

    var backdrop = document.createElement('div');
    backdrop.id = 'backdropBubbles';
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:8999;pointer-events:none;overflow:hidden;';

    var authModal = document.getElementById('authModal');
    authModal.parentNode.insertBefore(backdrop, authModal);

    for (var i = 0; i < 30; i++) {
      var bubble = document.createElement('div');
      bubble.classList.add('bubble-particle');
      var size = Math.random() * 30 + 8;
      var x = Math.random() * 100;
      var y = Math.random() * 100;
      var dx = (Math.random() - 0.5) * 300;
      var dy = (Math.random() - 0.5) * 300;
      var dur = Math.random() * 4 + 3;
      var delay = Math.random() * 2;
      var color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];

      bubble.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + x + '%;top:' + y + '%;' +
        'background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), ' + color + ');' +
        'border: 1px solid rgba(255,255,255,0.08);' +
        '--dx:' + dx + 'px;--dy:' + dy + 'px;' +
        '--dur:' + dur + 's;--delay:' + delay + 's;';

      backdrop.appendChild(bubble);
    }

    // Auto-cleanup after 8 seconds
    setTimeout(function () {
      if (backdrop.parentNode) backdrop.remove();
    }, 8000);
  }

  /* ────────────────────────────────────────────
     3d. POPULATE REPORT DATA
  ──────────────────────────────────────────── */
  function populateReport(data) {
    // Title & subtitle
    var subtitle = document.getElementById('analysisSubtitle');
    if (subtitle) subtitle.textContent = 'Growth projection for ' + data.business_name;

    // SEO Score Ring
    var scoreEl = document.getElementById('seoScoreValue');
    var scoreCircle = document.getElementById('scoreCircle');
    if (scoreEl && data.seo_score !== undefined) {
      // Animate the number counting up
      animateCounter(scoreEl, 0, data.seo_score, 1200);
      // Animate the SVG ring
      if (scoreCircle) {
        var circumference = 326.73;
        var offset = circumference - (data.seo_score / 100) * circumference;
        setTimeout(function () {
          scoreCircle.style.strokeDashoffset = offset;
        }, 300);
      }
    }

    // Growth & Traffic
    var growthEl = document.getElementById('analysisGrowthValue');
    var trafficEl = document.getElementById('analysisTrafficValue');
    if (growthEl) growthEl.textContent = '+' + data.projected_increase_percentage + '%';
    if (trafficEl && data.predicted_growth && data.predicted_growth.length > 0) {
      var lastTraffic = data.predicted_growth[data.predicted_growth.length - 1].visitors;
      trafficEl.textContent = lastTraffic.toLocaleString();
    }

    // Mini chart
    if (data.predicted_growth) {
      var bars = document.querySelectorAll('#reportChart .chart-bar');
      var maxVisitors = Math.max.apply(null, data.predicted_growth.map(function (g) { return g.visitors; }));
      data.predicted_growth.forEach(function (item, idx) {
        if (bars[idx]) {
          var pct = Math.round((item.visitors / maxVisitors) * 100);
          bars[idx].style.setProperty('--h', pct + '%');
          var label = bars[idx].querySelector('.chart-label');
          if (label) label.textContent = item.month.split(' ')[0]; // e.g. "Apr"
        }
      });
    }

    // Recommendations
    if (data.recommendations) {
      data.recommendations.forEach(function (rec, idx) {
        var pill = document.getElementById('rec' + (idx + 1));
        if (pill) {
          var dot = pill.querySelector('.rec-dot');
          var text = pill.querySelector('.rec-text');
          if (dot) {
            dot.className = 'rec-dot ' + (rec.impact === 'High' ? 'high' : 'medium');
          }
          if (text) text.textContent = rec.title;
        }
      });
    }

    // Summary
    var summaryEl = document.getElementById('reportSummary');
    if (summaryEl && data.summary) {
      summaryEl.textContent = data.summary;
    }
  }

  function animateCounter(el, start, end, duration) {
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      el.textContent = Math.round(start + (end - start) * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  /* ────────────────────────────────────────────
     3e. GENERATE FALLBACK DATA (when API is offline)
  ──────────────────────────────────────────── */
  function generateFallbackData(businessName) {
    var seoScore = Math.floor(Math.random() * 35) + 28;
    var projected = Math.floor(Math.random() * 56) + 65;
    var baseTraffic = Math.floor(Math.random() * 1500) + 500;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var now = new Date();
    var growth = [];
    for (var i = 0; i < 6; i++) {
      var d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      growth.push({
        month: months[d.getMonth()] + ' ' + d.getFullYear(),
        visitors: Math.round(baseTraffic * (1 + i * 0.15 + (Math.random() - 0.5) * 0.1))
      });
    }
    return {
      business_name: businessName,
      seo_score: seoScore,
      projected_increase_percentage: projected,
      predicted_growth: growth,
      recommendations: [
        { title: 'Technical SEO Overhaul', impact: 'High' },
        { title: 'Content Strategy', impact: 'High' },
        { title: 'Local SEO Optimization', impact: 'Medium' },
      ],
      summary: businessName + ' currently has significant untapped growth potential. ' +
               'With targeted SEO improvements, we project a ' + projected + '% increase ' +
               'in organic traffic over 6 months.'
    };
  }

  /* ────────────────────────────────────────────
     3f. CTA CLICK HANDLER
  ──────────────────────────────────────────── */
  ctaBtn.addEventListener('click', async function () {
    if (ctaBtn.classList.contains('loading')) return;

    const businessName = businessInput.value.trim() || 'Your Business';

    // Button → loading state
    ctaBtn.classList.add('loading');

    // Show overlay
    seoOverlay.classList.add('active');

    // Cycle messages
    let msgIndex = 0;
    seoLabel.textContent = seoMessages[0];

    const msgInterval = setInterval(function () {
      msgIndex++;
      if (msgIndex < seoMessages.length) {
        seoLabel.textContent = seoMessages[msgIndex];
      }
    }, 600);

    var reportData = null;

    try {
      const response = await fetch(API_BASE + '/api/marketing/analyze-growth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_name: businessName })
      });
      reportData = await response.json();
    } catch (err) {
      console.warn('API unavailable, using fallback data:', err);
      reportData = generateFallbackData(businessName);
    }

    clearInterval(msgInterval);
    seoLabel.textContent = '🚀 ' + reportData.business_name + ' — Ready to grow!';

    // Populate the report BEFORE showing the modal
    populateReport(reportData);

    setTimeout(function () {
      seoOverlay.classList.add('fade-out');
      ctaBtn.classList.remove('loading');
      setTimeout(function () {
        seoOverlay.classList.remove('active', 'fade-out');

        // Spawn bubble bursts
        var container = document.getElementById('bubbleBurstContainer');
        spawnBubbleBurst(container, 25);
        spawnBackdropBubbles();

        // Open the analysis modal
        openAuthModal('analysis');
      }, 900);
    }, 700);
  });

  // Allow Enter key on input
  businessInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') ctaBtn.click();
  });

  /* ────────────────────────────────────────────
     4. SCROLL REVEAL
  ──────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.04,
    rootMargin: '0px 0px 60px 0px',
  });

  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  // Fallback: reveal all after 4s in case observer doesn't fire
  setTimeout(function () {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }, 4000);

  /* ────────────────────────────────────────────
     5. HERO INPUT — GRADIENT BORDER ANIMATION
  ──────────────────────────────────────────── */
  // Already handled via CSS :focus-within — nothing extra needed.

  /* ────────────────────────────────────────────
     6. CARD HOVER — BUBBLE SPRING CLICK
  ──────────────────────────────────────────── */
  document.querySelectorAll('.why-card, .pkg-card').forEach(function (card) {
    card.addEventListener('mousedown', function () {
      card.style.transform = 'scale(0.97) translateY(' + (card.classList.contains('why-card') ? '-4px' : '-6px') + ')';
    });

    card.addEventListener('mouseup', function () {
      card.style.transform = '';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ────────────────────────────────────────────
     7. PRO PACKAGE CTA — Open signup modal
  ──────────────────────────────────────────── */
  const proCTA = document.getElementById('proCTA');
  if (proCTA) {
    proCTA.addEventListener('click', function () {
      openAuthModal('signup');
    });
  }

  /* ────────────────────────────────────────────
     8. SMOOTH ANCHOR SCROLL
  ──────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ────────────────────────────────────────────
     9. PARALLAX — BLOBS (subtle mouse tracking)
  ──────────────────────────────────────────── */
  const blobs = document.querySelectorAll('.blob');

  window.addEventListener('mousemove', function (e) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    blobs.forEach(function (blob, i) {
      const factor = (i + 1) * 3;
      blob.style.transform = blob.style.transform
        .split('translate(')[0]
        + ' translate(' + (dx * factor) + 'px, ' + (dy * factor) + 'px)';
    });
  }, { passive: true });

  /* ────────────────────────────────────────────
     10. REVEAL HERO IMMEDIATELY (above fold)
  ──────────────────────────────────────────── */
  function revealHeroContent() {
    const heroEls = document.querySelectorAll('.hero-content .reveal');
    heroEls.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('visible');
      }, 100 + i * 120);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealHeroContent);
  } else {
    revealHeroContent();
  }

  /* ────────────────────────────────────────────
     11. AUTH MODAL SYSTEM
  ──────────────────────────────────────────── */
  const authModal = document.getElementById('authModal');
  const authClose = document.getElementById('authClose');

  // Screen IDs
  const SCREENS = {
    analysis:     'authScreenAnalysis',
    choose:       'authScreenChoose',
    login:        'authScreenLogin',
    loginEmail:   'authScreenLoginEmail',
    loginPhone:   'authScreenLoginPhone',
    signup:       'authScreenSignup',
    signupEmail:  'authScreenSignupEmail',
    signupPhone:  'authScreenSignupPhone',
    otp:          'authScreenOTP',
    success:      'authScreenSuccess',
  };

  function showScreen(screenKey) {
    Object.values(SCREENS).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('auth-screen-hidden');
    });
    const target = document.getElementById(SCREENS[screenKey]);
    if (target) {
      target.classList.remove('auth-screen-hidden');
      target.classList.add('auth-screen-enter');
      setTimeout(function () { target.classList.remove('auth-screen-enter'); }, 400);
    }
  }

  // Expose globally so inline onclick handlers work
  window.openAuthModal = function (startScreen) {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (startScreen === 'login') {
      showScreen('login');
    } else if (startScreen === 'signup') {
      showScreen('signup');
    } else if (startScreen === 'analysis') {
      showScreen('analysis');
    } else {
      showScreen('choose');
    }
  };

  window.closeAuthModal = function () {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
    // Remove backdrop bubbles
    var backdrop = document.getElementById('backdropBubbles');
    if (backdrop) backdrop.remove();
    setTimeout(function () { showScreen('choose'); }, 400);
  };

  // Close button
  authClose.addEventListener('click', window.closeAuthModal);

  // Click outside modal card
  authModal.addEventListener('click', function (e) {
    if (e.target === authModal) window.closeAuthModal();
  });

  // Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && authModal.classList.contains('active')) {
      window.closeAuthModal();
    }
  });

  // ── Choose screen ──
  document.getElementById('chooseLogin').addEventListener('click', function () { showScreen('login'); });
  document.getElementById('chooseSignup').addEventListener('click', function () { showScreen('signup'); });

  // ── Analysis screen ──
  const claimBtn = document.getElementById('analysisClaimBtn');
  if (claimBtn) {
    claimBtn.addEventListener('click', function () { showScreen('signup'); });
  }

  // ── Login flow ──
  document.getElementById('loginBack').addEventListener('click', function () { showScreen('choose'); });
  document.getElementById('loginWithEmail').addEventListener('click', function () { showScreen('loginEmail'); });
  document.getElementById('loginWithPhone').addEventListener('click', function () { showScreen('loginPhone'); });
  document.getElementById('loginEmailBack').addEventListener('click', function () { showScreen('login'); });
  document.getElementById('loginPhoneBack').addEventListener('click', function () { showScreen('login'); });

  // Login form submissions → call real API then redirect
  document.getElementById('loginEmailForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value;
    var pass = document.getElementById('loginPassword').value;
    if (!email || !pass) return;
    var btn = document.getElementById('loginEmailSubmit');
    btn.textContent = 'Signing in...';
    btn.disabled = true;
    try {
      var res = await fetch(API_BASE + '/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pass })
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid credentials');
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      window.location.href = DASHBOARD_URL + '/dashboard';
    } catch (err) {
      alert(err.message);
      btn.textContent = 'Login →';
      btn.disabled = false;
    }
  });
  document.getElementById('loginPhoneForm').addEventListener('submit', function () {
    showScreen('otp');
    startOtpFlow();
  });

  // ── Sign Up flow ──
  document.getElementById('signupBack').addEventListener('click', function () { showScreen('choose'); });
  document.getElementById('signupWithEmail').addEventListener('click', function () { showScreen('signupEmail'); });
  document.getElementById('signupWithPhone').addEventListener('click', function () { showScreen('signupPhone'); });
  document.getElementById('signupEmailBack').addEventListener('click', function () { showScreen('signup'); });
  document.getElementById('signupPhoneBack').addEventListener('click', function () { showScreen('signup'); });

  // Signup phone form → go to OTP screen
  document.getElementById('signupPhoneForm').addEventListener('submit', function (e) {
    e.preventDefault();
    startOtpFlow();
    showScreen('otp');
  });

  // Success screen close → go to dashboard
  document.getElementById('authSuccessClose').addEventListener('click', function () {
    window.location.href = DASHBOARD_URL + '/dashboard';
  });

  /* ────────────────────────────────────────────
     12. OTP SCREEN LOGIC
  ──────────────────────────────────────────── */
  var otpTimerInterval = null;

  function startOtpTimer() {
    var timerCount = document.getElementById('otpTimerCount');
    var timerLabel = document.getElementById('otpTimerLabel');
    var resendBtn  = document.getElementById('otpResendBtn');

    // Reset display
    var seconds = 60;
    timerCount.textContent = seconds;
    timerLabel.style.display = 'inline';
    resendBtn.style.display  = 'none';

    // Clear any existing interval
    if (otpTimerInterval) clearInterval(otpTimerInterval);

    otpTimerInterval = setInterval(function () {
      seconds--;
      timerCount.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(otpTimerInterval);
        otpTimerInterval = null;
        timerLabel.style.display = 'none';
        resendBtn.style.display  = 'inline-flex';
      }
    }, 1000);
  }

  function resetOtpBoxes() {
    ['otp1','otp2','otp3','otp4'].forEach(function (id) {
      document.getElementById(id).value = '';
    });
    document.getElementById('otp1').focus();
  }

  function startOtpFlow() {
    resetOtpBoxes();
    startOtpTimer();
  }

  // Auto-advance & backspace handling between OTP boxes
  var otpInputs = document.querySelectorAll('.otp-input');
  otpInputs.forEach(function (input, idx) {
    input.addEventListener('input', function () {
      // Allow only digits
      this.value = this.value.replace(/[^0-9]/g, '');
      if (this.value.length === 1 && idx < otpInputs.length - 1) {
        otpInputs[idx + 1].focus();
      }
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !this.value && idx > 0) {
        otpInputs[idx - 1].focus();
      }
    });
    // Select all text on focus
    input.addEventListener('focus', function () { this.select(); });
  });

  // OTP back button — stop timer, go back to signup phone
  document.getElementById('otpBack').addEventListener('click', function () {
    if (otpTimerInterval) { clearInterval(otpTimerInterval); otpTimerInterval = null; }
    showScreen('signupPhone');
  });

  // Resend button — restart timer
  document.getElementById('otpResendBtn').addEventListener('click', function () {
    resetOtpBoxes();
    startOtpTimer();
  });

  // Verify button — go to success then redirect
  document.getElementById('otpVerifyBtn').addEventListener('click', function () {
    if (otpTimerInterval) { clearInterval(otpTimerInterval); otpTimerInterval = null; }
    showScreen('success');
  });

  // Signup email → call real API
  document.getElementById('signupEmailForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var name = document.getElementById('signupName').value;
    var email = document.getElementById('signupEmail').value;
    var pass = document.getElementById('signupPassword').value;
    if (!email || !pass) return;
    var btn = document.getElementById('signupEmailSubmit');
    btn.textContent = 'Creating...';
    btn.disabled = true;
    try {
      var res = await fetch(API_BASE + '/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pass, business_name: name || '' })
      });
      var data = await res.json();
      if (!res.ok) {
        var key = Object.keys(data)[0];
        throw new Error(Array.isArray(data[key]) ? data[key][0] : (data[key] || 'Registration failed'));
      }
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('wcs-dash-user', JSON.stringify(data.user));
      showScreen('success');
    } catch (err) {
      alert(err.message);
      btn.textContent = 'Create Account →';
      btn.disabled = false;
    }
  });

})();
