/* ============================================================
   WEB-O-BUILTS — MAIN JAVASCRIPT (Simplified)
   Auth modal removed — all auth redirects to Dashboard
   ============================================================ */

(function () {
  'use strict';

  /* ── API Configuration ── */
  var API_BASE = (window.__CONFIG && window.__CONFIG.API_BASE) || 'http://localhost:8000';
  var DASHBOARD_URL = (window.__CONFIG && window.__CONFIG.DASHBOARD_URL) || 'http://localhost:5173';

  /* ────────────────────────────────────────────
     1. THEME TOGGLE (with liquid wave)
  ──────────────────────────────────────────── */
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeWaveCircle = document.getElementById('themeWaveCircle');

  const savedTheme = localStorage.getItem('wob-theme') || 'dark';
  htmlEl.setAttribute('data-theme', savedTheme);
  themeToggle.setAttribute('aria-checked', savedTheme === 'dark' ? 'true' : 'false');

  themeToggle.addEventListener('click', function () {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

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
     3. CLIENT PORTAL BUTTON → Redirect to Dashboard
  ──────────────────────────────────────────── */
  var portalBtn = document.getElementById('portalBtn');
  if (portalBtn) {
    portalBtn.addEventListener('click', function () {
      window.location.href = DASHBOARD_URL + '/login';
    });
  }

  /* ────────────────────────────────────────────
     3a. FOOTER REDIRECT BUTTONS
  ──────────────────────────────────────────── */
  var footerGetStarted = document.getElementById('footerGetStarted');
  if (footerGetStarted) {
    footerGetStarted.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = DASHBOARD_URL + '/register';
    });
  }

  var footerClientPortal = document.getElementById('footerClientPortal');
  if (footerClientPortal) {
    footerClientPortal.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = DASHBOARD_URL + '/login';
    });
  }

  var footerScheduleCall = document.getElementById('footerScheduleCall');
  if (footerScheduleCall) {
    footerScheduleCall.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = DASHBOARD_URL + '/register';
    });
  }

  /* ────────────────────────────────────────────
     4. CTA — ANALYZE MY GROWTH
  ──────────────────────────────────────────── */
  const ctaBtn = document.getElementById('ctaBtn');
  const seoOverlay = document.getElementById('seoOverlay');
  const seoLabel = document.getElementById('seoLabel');
  const businessInput = document.getElementById('businessNameInput');

  /* ────────────────────────────────────────────
     4b. MIC BUTTON — Voice Input (Web Speech API)
  ──────────────────────────────────────────── */
  const micBtn = document.getElementById('micBtn');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
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
      e.preventDefault();
      e.stopPropagation();
      if (isRecording) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (err) {
          console.warn('Mic start error:', err);
        }
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
     4c. BUBBLE BURST SYSTEM
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

    setTimeout(function () {
      if (backdrop.parentNode) backdrop.remove();
    }, 8000);
  }

  /* ────────────────────────────────────────────
     4d. POPULATE REPORT DATA
  ──────────────────────────────────────────── */
  function populateReport(data) {
    var subtitle = document.getElementById('analysisSubtitle');
    if (subtitle) subtitle.textContent = 'Growth projection for ' + data.business_name;

    var scoreEl = document.getElementById('seoScoreValue');
    var scoreCircle = document.getElementById('scoreCircle');
    if (scoreEl && data.seo_score !== undefined) {
      animateCounter(scoreEl, 0, data.seo_score, 1200);
      if (scoreCircle) {
        var circumference = 326.73;
        var offset = circumference - (data.seo_score / 100) * circumference;
        setTimeout(function () {
          scoreCircle.style.strokeDashoffset = offset;
        }, 300);
      }
    }

    var growthEl = document.getElementById('analysisGrowthValue');
    var trafficEl = document.getElementById('analysisTrafficValue');
    if (growthEl) growthEl.textContent = '+' + data.projected_increase_percentage + '%';
    if (trafficEl && data.predicted_growth && data.predicted_growth.length > 0) {
      var lastTraffic = data.predicted_growth[data.predicted_growth.length - 1].visitors;
      trafficEl.textContent = lastTraffic.toLocaleString();
    }

    if (data.predicted_growth) {
      var bars = document.querySelectorAll('#reportChart .chart-bar');
      var maxVisitors = Math.max.apply(null, data.predicted_growth.map(function (g) { return g.visitors; }));
      data.predicted_growth.forEach(function (item, idx) {
        if (bars[idx]) {
          var pct = Math.round((item.visitors / maxVisitors) * 100);
          bars[idx].style.setProperty('--h', pct + '%');
          var label = bars[idx].querySelector('.chart-label');
          if (label) label.textContent = item.month.split(' ')[0];
        }
      });
    }

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
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (end - start) * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  /* ────────────────────────────────────────────
     4e. GENERATE FALLBACK DATA
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
     4f. CTA CLICK HANDLER
  ──────────────────────────────────────────── */
  ctaBtn.addEventListener('click', async function () {
    if (ctaBtn.classList.contains('loading')) return;

    const businessName = businessInput.value.trim();

    // Require business name input
    if (!businessName) {
      businessInput.focus();
      businessInput.placeholder = '⚠ Please enter your business name first...';
      businessInput.classList.add('input-shake');
      setTimeout(function () {
        businessInput.classList.remove('input-shake');
        businessInput.placeholder = 'Enter your business name...';
      }, 2000);
      return;
    }

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

    populateReport(reportData);

    setTimeout(function () {
      seoOverlay.classList.add('fade-out');
      ctaBtn.classList.remove('loading');
      setTimeout(function () {
        seoOverlay.classList.remove('active', 'fade-out');

        var container = document.getElementById('bubbleBurstContainer');
        spawnBubbleBurst(container, 25);
        spawnBackdropBubbles();

        // Open analysis modal
        openAnalysisModal();
      }, 900);
    }, 700);
  });

  // Allow Enter key on input
  businessInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      ctaBtn.click();
    }
  });

  // Ensure input is interactable
  businessInput.addEventListener('click', function () {
    this.focus();
  });

  /* ────────────────────────────────────────────
     5. SCROLL REVEAL
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

  setTimeout(function () {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }, 4000);

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
     7. PRO PACKAGE CTA — Redirect to Dashboard Register
  ──────────────────────────────────────────── */
  const proCTA = document.getElementById('proCTA');
  if (proCTA) {
    proCTA.addEventListener('click', function () {
      window.location.href = DASHBOARD_URL + '/register';
    });
  }

  /* ────────────────────────────────────────────
     8. SMOOTH ANCHOR SCROLL
  ──────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return; // Skip # only links
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ────────────────────────────────────────────
     9. PARALLAX — BLOBS
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
     10. REVEAL HERO IMMEDIATELY
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
     11. ANALYSIS MODAL (simplified — no auth screens)
  ──────────────────────────────────────────── */
  const authModal = document.getElementById('authModal');
  const authClose = document.getElementById('authClose');

  function openAnalysisModal() {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeAnalysisModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
    var backdrop = document.getElementById('backdropBubbles');
    if (backdrop) backdrop.remove();
  }

  // Expose globally for compatibility
  window.openAuthModal = function (mode) {
    if (mode === 'analysis') {
      openAnalysisModal();
    } else {
      // All other auth actions redirect to dashboard
      window.location.href = DASHBOARD_URL + '/login';
    }
  };

  window.closeAuthModal = closeAnalysisModal;

  // Close button
  authClose.addEventListener('click', closeAnalysisModal);

  // Click outside
  authModal.addEventListener('click', function (e) {
    if (e.target === authModal) closeAnalysisModal();
  });

  // Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && authModal.classList.contains('active')) {
      closeAnalysisModal();
    }
  });

  // Claim button → redirect to dashboard register
  var claimBtn = document.getElementById('analysisClaimBtn');
  if (claimBtn) {
    claimBtn.addEventListener('click', function () {
      window.location.href = DASHBOARD_URL + '/register';
    });
  }

})();
