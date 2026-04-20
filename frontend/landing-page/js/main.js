/* ============================================================
   WEB-O-BUILTS — MAIN JAVASCRIPT
   ============================================================ */

(function () {
  'use strict';

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

  ctaBtn.addEventListener('click', function () {
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

    // After 3.2s → fade out + open signup modal
    setTimeout(function () {
      clearInterval(msgInterval);
      seoLabel.textContent = '🚀 ' + businessName + ' — Ready to grow!';

      setTimeout(function () {
        seoOverlay.classList.add('fade-out');
        ctaBtn.classList.remove('loading');
        setTimeout(function () {
          seoOverlay.classList.remove('active', 'fade-out');
          openAuthModal('signup');
        }, 900);
      }, 700);
    }, 3200);
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
    } else {
      showScreen('choose');
    }
  };

  window.closeAuthModal = function () {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
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

  // ── Login flow ──
  document.getElementById('loginBack').addEventListener('click', function () { showScreen('choose'); });
  document.getElementById('loginWithEmail').addEventListener('click', function () { showScreen('loginEmail'); });
  document.getElementById('loginWithPhone').addEventListener('click', function () { showScreen('loginPhone'); });
  document.getElementById('loginEmailBack').addEventListener('click', function () { showScreen('login'); });
  document.getElementById('loginPhoneBack').addEventListener('click', function () { showScreen('login'); });

  // Login form submissions (demo — just closes modal)
  document.getElementById('loginEmailForm').addEventListener('submit', function () {
    window.closeAuthModal();
  });
  document.getElementById('loginPhoneForm').addEventListener('submit', function () {
    window.closeAuthModal();
  });

  // ── Sign Up flow ──
  document.getElementById('signupBack').addEventListener('click', function () { showScreen('choose'); });
  document.getElementById('signupWithEmail').addEventListener('click', function () { showScreen('signupEmail'); });
  document.getElementById('signupWithPhone').addEventListener('click', function () { showScreen('signupPhone'); });
  document.getElementById('signupEmailBack').addEventListener('click', function () { showScreen('signup'); });
  document.getElementById('signupPhoneBack').addEventListener('click', function () { showScreen('signup'); });

  // Signup phone form → go to OTP screen
  document.getElementById('signupPhoneForm').addEventListener('submit', function () {
    startOtpFlow();
    showScreen('otp');
  });

  // Success screen close
  document.getElementById('authSuccessClose').addEventListener('click', function () {
    window.closeAuthModal();
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

  // Verify button — go to success
  document.getElementById('otpVerifyBtn').addEventListener('click', function () {
    if (otpTimerInterval) { clearInterval(otpTimerInterval); otpTimerInterval = null; }
    showScreen('success');
  });

  // Signup email → success
  document.getElementById('signupEmailForm').addEventListener('submit', function () {
    showScreen('success');
  });

})();
