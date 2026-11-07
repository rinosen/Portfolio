/**
 * Carlo Fagasto — Scroll-Driven Portfolio
 * GSAP ScrollTrigger powered animations
 */

const THEME_KEY = 'carlo-portfolio-theme';

document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  initTheme();
  initHeroVideo();
  initHeader();
  initMobileNav();
  initHeroEntrance(prefersReduced);

  if (!prefersReduced) {
    initHeroParallax();
    initHorizontalScroll();
    initSkillsScroll();
    initProjectReveals();
    initContactReveals();
  } else {
    showAllContent();
  }

  initCounters();
  initBackToTop();
});

/* ═══ THEME ═══ */

function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem(THEME_KEY);
  // Default theme is LIGHT mode as requested
  const theme = saved || 'light';

  document.documentElement.setAttribute('data-theme', theme);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
  });
}

/* ═══ HERO VIDEO ═══ */

function initHeroVideo() {
  const video = document.querySelector('.hero-bg-video');
  if (!video) return;
  video.muted = true;
  video.play().catch(() => {
    const resume = () => {
      video.play().catch(() => {});
    };
    window.addEventListener('click', resume, { once: true });
    window.addEventListener('touchstart', resume, { once: true });
    window.addEventListener('scroll', resume, { once: true });
  });
}

/* ═══ HEADER ═══ */

function initHeader() {
  const header = document.getElementById('site-header');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', window.scrollY > 24);
      ticking = false;
    });
  }, { passive: true });
}

/* ═══ MOBILE NAV ═══ */

function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const links = document.getElementById('nav-links');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });
}

/* ═══ HERO ENTRANCE ═══ */

function initHeroEntrance(prefersReduced) {
  const portrait = document.querySelector('.hero-portrait');

  if (portrait.complete) {
    portrait.classList.add('loaded');
  } else {
    portrait.addEventListener('load', () => portrait.classList.add('loaded'));
  }

  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  // Staggered text entrance
  const reveals = document.querySelectorAll('.section-hero .reveal');
  reveals.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.6 + i * 0.15, ease: 'expo.out' }
    );
  });
}

/* ═══ HERO PARALLAX ═══ */

function initHeroParallax() {
  const portrait = document.querySelector('.hero-portrait');
  const nameBackdrop = document.querySelector('.hero-name-backdrop');
  const bottomInfo = document.querySelector('.hero-bottom-info');
  const statusTop = document.querySelector('.hero-status-top');
  const bgVideo = document.querySelector('.hero-bg-video');

  if (portrait) {
    gsap.to(portrait, {
      yPercent: 12,
      scale: 1.04,
      scrollTrigger: {
        trigger: '.section-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }

  if (nameBackdrop) {
    gsap.to(nameBackdrop, {
      yPercent: -20,
      opacity: 0.1,
      scrollTrigger: {
        trigger: '.section-hero',
        start: 'top top',
        end: '70% top',
        scrub: 1,
      }
    });
  }

  if (bottomInfo) {
    gsap.to(bottomInfo, {
      opacity: 0,
      y: -20,
      scrollTrigger: {
        trigger: '.section-hero',
        start: '20% top',
        end: '60% top',
        scrub: 1,
        onLeaveBack: () => {
          gsap.set(bottomInfo, { opacity: 1, y: 0 });
          if (statusTop) gsap.set(statusTop, { opacity: 1, y: 0 });
        }
      }
    });
  }

  if (bgVideo) {
    gsap.to(bgVideo, {
      yPercent: 15,
      scrollTrigger: {
        trigger: '.section-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }
}

/* ═══ HORIZONTAL SCROLL ═══ */

function initHorizontalScroll() {
  const track = document.querySelector('.horizontal-track');
  if (!track) return;

  const panels = track.querySelectorAll('.h-panel');
  const totalWidth = track.scrollWidth - window.innerWidth;

  // Main horizontal tween — store reference for containerAnimation
  const scrollTween = gsap.to(track, {
    x: -totalWidth,
    ease: 'none',
    scrollTrigger: {
      trigger: '.section-horizontal',
      start: 'top top',
      end: () => '+=' + totalWidth,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    }
  });

  // Reveal each panel as it enters the viewport during horizontal scroll
  panels.forEach((panel) => {
    const card = panel.querySelector('.story-card');
    const metricGrid = panel.querySelector('.metric-grid');

    if (card) {
      gsap.fromTo(card,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'expo.out',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: 'left 75%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }

    if (metricGrid) {
      gsap.fromTo(metricGrid.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'expo.out',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: 'left 75%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }
  });
}

/* ═══ SKILLS HORIZONTAL ═══ */

function initSkillsScroll() {
  const track = document.querySelector('.skills-track');
  if (!track) return;

  const totalScroll = track.scrollWidth - window.innerWidth;

  gsap.to(track, {
    x: -totalScroll,
    ease: 'none',
    scrollTrigger: {
      trigger: '.skills-horizontal-wrap',
      start: 'top 60%',
      end: () => '+=' + totalScroll,
      scrub: 1,
      invalidateOnRefresh: true,
    }
  });
}

/* ═══ PROJECT REVEALS ═══ */

function initProjectReveals() {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  });
}

/* ═══ CONTACT REVEALS ═══ */

function initContactReveals() {
  const items = document.querySelectorAll('.section-contact .reveal');

  items.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.9, delay: i * 0.1, ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  });
}

/* ═══ COUNTERS ═══ */

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        runCounters(counters);
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
}

function runCounters(counters) {
  counters.forEach(el => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals) || 0;
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = eased * target;

      el.textContent = current.toFixed(decimals);

      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }

    requestAnimationFrame(tick);
  });
}

/* ═══ BACK TO TOP ═══ */

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (btn) {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ═══ FALLBACK: show all content when reduced motion ═══ */

function showAllContent() {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));

  // Make horizontal sections show vertically when no scroll animations
  const track = document.querySelector('.horizontal-track');
  if (track) {
    track.style.display = 'flex';
    track.style.flexDirection = 'column';
    track.style.width = '100%';

    track.querySelectorAll('.h-panel').forEach(p => {
      p.style.width = '100%';
      p.style.height = 'auto';
      p.style.minHeight = '60vh';
    });
  }
}
