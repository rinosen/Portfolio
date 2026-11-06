/**
 * CARLO FAGASTO — PORTFOLIO INTERACTIONS
 * High-Velocity Telemetry & Motorsport Editorial Dynamics
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Theme Engine (Dark Carbon / Light Paper)
  // ---------------------------------------------------------------------------
  const html = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');

  function getPreferredTheme() {
    const saved = localStorage.getItem('carlo-portfolio-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('carlo-portfolio-theme', theme);
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'INK // DARK' : 'PAPER // LIGHT';
    }
  }

  // Initialize theme immediately
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      showToast(`THEME SWITCHED: ${next.toUpperCase()}`);
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Live Jakarta (WIB / UTC+7) Telemetry Digital Clock
  // ---------------------------------------------------------------------------
  const clockElement = document.getElementById('telemetry-clock');

  function updateJakartaTime() {
    if (!clockElement) return;
    try {
      const now = new Date();
      // Format to Asia/Jakarta timezone
      const timeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      clockElement.textContent = `${timeStr} WIB`;
    } catch (e) {
      // Fallback
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      clockElement.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} LOCAL`;
    }
  }

  updateJakartaTime();
  setInterval(updateJakartaTime, 1000);

  // ---------------------------------------------------------------------------
  // 3. Header Scroll Boundary
  // ---------------------------------------------------------------------------
  const siteHeader = document.getElementById('site-header');
  let lastScrollY = window.scrollY;

  function handleScroll() {
    if (!siteHeader) return;
    const currentScrollY = window.scrollY;
    siteHeader.classList.toggle('scrolled', currentScrollY > 24);
    lastScrollY = currentScrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ---------------------------------------------------------------------------
  // 4. Mobile Navigation Drawer
  // ---------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('mobile-open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile drawer when clicking any link
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Toast Notification System
  // ---------------------------------------------------------------------------
  const toast = document.getElementById('telemetry-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(msg) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = msg;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // ---------------------------------------------------------------------------
  // 6. Quick Copy Email with Toast Feedback
  // ---------------------------------------------------------------------------
  const copyEmailBtn = document.getElementById('btn-copy-email');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'fagastocarlo@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        showToast('EMAIL COPIED // READY TO CONNECT');
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = email;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('EMAIL COPIED: ' + email);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Interactive Project Category Filtering
  // ---------------------------------------------------------------------------
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-race-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetFilter = btn.getAttribute('data-filter');

      // Update active states
      filterButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter project cards with subtle scale transition
      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        const matches = targetFilter === 'all' || category === targetFilter;

        if (matches) {
          card.style.display = 'flex';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            if (btn.getAttribute('data-filter') !== 'all' && card.getAttribute('data-category') !== btn.getAttribute('data-filter')) {
              card.style.display = 'none';
            }
          }, 150);
        }
      });
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Driver Telemetry Card 3D Tilt Effect
  // ---------------------------------------------------------------------------
  const driverCard = document.getElementById('driver-card');
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (driverCard && !isReducedMotion && !isTouchDevice) {
    let bounds = null;

    const onMouseEnter = () => {
      bounds = driverCard.getBoundingClientRect();
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = driverCard.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const xPct = (mouseX / bounds.width) - 0.5;
      const yPct = (mouseY / bounds.height) - 0.5;

      const tiltX = (yPct * -12).toFixed(2);
      const tiltY = (xPct * 14).toFixed(2);

      driverCard.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
    };

    const onMouseLeave = () => {
      driverCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      bounds = null;
    };

    driverCard.addEventListener('mouseenter', onMouseEnter);
    driverCard.addEventListener('mousemove', onMouseMove);
    driverCard.addEventListener('mouseleave', onMouseLeave);
  }

  // ---------------------------------------------------------------------------
  // 9. Numeric Roll-Up Counters for Hero Bento Metrics
  // ---------------------------------------------------------------------------
  const counterElements = document.querySelectorAll('.counter-value');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counterElements.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-target'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const duration = 1400; // ms
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out expo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = ease * target;

        el.textContent = currentVal.toFixed(decimals);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target.toFixed(decimals);
        }
      }

      requestAnimationFrame(update);
    });
  }

  // ---------------------------------------------------------------------------
  // 10. Intersection Observer for Scroll Reveals
  // ---------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-element');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');

          // If hero metrics box is intersecting, fire counter animation
          if (entry.target.classList.contains('hero-metrics-grid') || entry.target.closest('.hero-metrics-grid')) {
            animateCounters();
          }

          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: reveal all immediately
    revealElements.forEach((el) => el.classList.add('is-revealed'));
    animateCounters();
  }

  // Ensure hero elements reveal quickly on load
  requestAnimationFrame(() => {
    document.querySelectorAll('.hero-section .reveal-element').forEach((el) => {
      el.classList.add('is-revealed');
    });
    // Trigger hero counters
    setTimeout(animateCounters, 300);
  });

  // ---------------------------------------------------------------------------
  // 11. Tactical Keyboard Shortcuts
  // ---------------------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    // Ignore keystrokes when typing inside input or textarea
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const key = e.key.toLowerCase();

    if (key === 't') {
      // Toggle theme
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      showToast(`SHORTCUT [T]: THEME ${next.toUpperCase()}`);
    } else if (key === 'p') {
      // Jump to projects
      const projectsEl = document.getElementById('projects');
      if (projectsEl) {
        projectsEl.scrollIntoView({ behavior: 'smooth' });
        showToast('SHORTCUT [P]: JUMPED TO BUILDS');
      }
    } else if (key === 'c') {
      // Jump to contact
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
        showToast('SHORTCUT [C]: JUMPED TO CONTACT');
      }
    } else if (key === 'h') {
      // Jump to home
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('SHORTCUT [H]: JUMPED TO TOP');
    }
  });

  // Telemetry ready log
  console.log(
    '%c[CF.DEV] %cTELEMETRY SYSTEM ONLINE // CARLO FAGASTO // UNTAR SEMESTER 5',
    'background: #fff; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 2px;',
    'color: #fff; font-family: monospace; font-size: 11px;'
  );
})();
