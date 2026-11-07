/**
 * Carlo Fagasto — Scroll-Driven Portfolio
 * GSAP ScrollTrigger powered animations
 */

// Disable browser premature scroll restoration immediately
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}
window.scrollTo(0, 0);

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  initHeroVideo();
  initHeader();
  initMobileNav();
  initNavScroll();
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

  window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  });
});

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

  const reveals = document.querySelectorAll('.section-hero .reveal');
  reveals.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.6 + i * 0.15, ease: 'expo.out' }
    );
  });
}

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

function initHorizontalScroll() {
  const track = document.querySelector('.horizontal-track');
  if (!track) return;

  // Mobile and tablet fall back to vertical flow via CSS
  if (window.innerWidth <= 860) return;

  // Calculate distance so the final card rests centered in viewport
  const getDistanceToCenter = () => {
    const lastPanel = track.querySelector('.h-panel-metrics') || track.lastElementChild;
    if (!lastPanel) return Math.max(0, track.scrollWidth - window.innerWidth);
    const cardCenter = lastPanel.offsetLeft + (lastPanel.offsetWidth / 2);
    const winCenter = window.innerWidth / 2;
    return Math.max(0, cardCenter - winCenter);
  };

  const pauseBuffer = 200; // reading buffer while Box 4 is held centered before unpinning

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.section-horizontal',
      start: 'top top',
      end: () => '+=' + (getDistanceToCenter() + pauseBuffer),
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    }
  });

  tl.to(track, {
    x: () => -getDistanceToCenter(),
    ease: 'none',
    duration: 1,
  });

  // Hold centered panel briefly before unpinning
  tl.to({}, { duration: 0.2 });

  const cards = track.querySelectorAll('.story-card');
  cards.forEach((card, index) => {
    // First card is already visible with the intro panel
    if (index > 0) {
      gsap.fromTo(card,
        { opacity: 0.7, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            containerAnimation: tl,
            start: 'left 92%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }
  });
}

function initNavScroll() {
  document.querySelectorAll('.nav-link, .nav-brand, .nav-cta').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        scrollToTarget(href, 'smooth');
      }
    });
  });
}

function scrollToTarget(hash, behavior = 'smooth') {
  if (!hash || hash === '#') return;
  const target = document.querySelector(hash);
  if (!target) return;

  const st = ScrollTrigger.getAll().find(s => s.trigger === target);
  const targetY = st ? st.start : target.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: targetY,
    behavior: behavior
  });
}

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

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (btn) {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// Fallback layout when reduced motion is preferred
function showAllContent() {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));

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
