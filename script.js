/**
 * Supported UI theme modes.
 * @typedef {'dark' | 'light'} ThemeMode
 */

/**
 * Configuration options for dynamic typewriter text effects.
 * @typedef {Object} TypewriterConfig
 * @property {string[]} words - Phrases to sequentially type and erase.
 * @property {number} typingSpeedMs - Milliseconds between character insertions.
 * @property {number} deletingSpeedMs - Milliseconds between character deletions.
 * @property {number} pauseDurationMs - Delay before erasing completed word.
 * @property {number} restartDelayMs - Delay before starting the next word.
 */

/**
 * 3D perspective rotation angles.
 * @typedef {Object} TiltCoordinates
 * @property {number} tiltX - Rotation in degrees around the X axis.
 * @property {number} tiltY - Rotation in degrees around the Y axis.
 */

/**
 * Numerical parameters for animated telemetry counters.
 * @typedef {Object} CounterMetrics
 * @property {number} target - Numerical ending value.
 * @property {number} decimals - Precision decimal places.
 * @property {number} durationMs - Animation runtime in milliseconds.
 */

/**
 * Toast notification controller interface.
 * @typedef {Object} ToastController
 * @property {(message: string, durationMs?: number) => void} show - Dispatches a toast message.
 */

const THEME_STORAGE_KEY = 'carlo-portfolio-theme';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';
const HEADER_SCROLL_THRESHOLD_PX = 24;

/**
 * Default dictionary of technical specializations for Carlo Fagasto.
 * @type {readonly string[]}
 */
const DEFAULT_TYPEWRITER_WORDS = Object.freeze([
  'Data Analytics',
  'Machine Learning',
  'Full-Stack Web',
  'Predictive Models',
  'Short-Form Video'
]);

function initializePortfolio() {
  'use strict';

    const toastService = createToastNotifier(
    document.getElementById('telemetry-toast'),
    document.getElementById('toast-message')
  );

    initThemeEngine(toastService);
  initTelemetryClock(document.getElementById('telemetry-clock'));
  initHeroTypewriter(document.getElementById('hero-typewriter'));
  initHeaderScrollWatcher(document.getElementById('site-header'));
  initMobileNavigation(
    document.getElementById('mobile-toggle'),
    document.getElementById('nav-menu')
  );
  initEmailClipboard(document.getElementById('btn-copy-email'), toastService);
  initProjectFiltering(
    document.querySelectorAll('.filter-btn'),
    document.querySelectorAll('.project-race-card')
  );
  initCardTiltEffect(document.getElementById('driver-card'));
  initScrollAndMetricReveals();
  initTacticalKeyboardShortcuts(toastService);

    logSystemDiagnostics();
}

function initHeroTypewriter(targetElement) {
  if (!targetElement) return;

  const words = extractTypewriterWords(targetElement, DEFAULT_TYPEWRITER_WORDS);
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fallback for prefers-reduced-motion
  if (isReducedMotion) {
    targetElement.textContent = words[0] || 'Data Analytics';
    return;
  }

  /** @type {TypewriterConfig} */
  const config = {
    words: [...words],
    typingSpeedMs: 70,
    deletingSpeedMs: 40,
    pauseDurationMs: 2000,
    restartDelayMs: 400
  };

  startTypewriterLoop(targetElement, config);
}

function startTypewriterLoop(element, config) {
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timerId = 0;

  function step() {
    const activeWord = config.words[wordIndex];

    if (isDeleting) {
      charIndex--;
      element.textContent = activeWord.substring(0, charIndex);
    } else {
      charIndex++;
      element.textContent = activeWord.substring(0, charIndex);
    }

    // Keep accessible label synchronized
    const container = element.closest('.hero-typewriter-container');
    if (container) {
      container.setAttribute('aria-label', activeWord);
    }

    let delay = isDeleting ? config.deletingSpeedMs : config.typingSpeedMs;

    if (!isDeleting && charIndex === activeWord.length) {
      delay = config.pauseDurationMs;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % config.words.length;
      delay = config.restartDelayMs;
    }

    timerId = window.setTimeout(step, delay);
  }

  timerId = window.setTimeout(step, config.typingSpeedMs);

  return function stop() {
    window.clearTimeout(timerId);
  };
}

function extractTypewriterWords(element, fallbackWords) {
  const rawData = element.getAttribute('data-words');
  if (!rawData) return [...fallbackWords];

  try {
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...fallbackWords];
  } catch (parseError) {
    return [...fallbackWords];
  }
}

function initThemeEngine(toastService) {
  const rootElement = document.documentElement;
  const toggleButton = document.getElementById('theme-toggle');
  const labelElement = document.getElementById('theme-label');

  const currentTheme = getPreferredTheme();
  applyTheme(currentTheme, rootElement, labelElement);

  if (!toggleButton) return;

  toggleButton.addEventListener('click', () => {
    const activeTheme = rootElement.getAttribute('data-theme') === DARK_THEME ? DARK_THEME : LIGHT_THEME;
    const nextTheme = activeTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;

    applyTheme(nextTheme, rootElement, labelElement);
    toastService.show(`THEME SWITCHED: ${nextTheme.toUpperCase()}`);
  });
}

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === DARK_THEME || saved === LIGHT_THEME) {
    return saved;
  }
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return systemPrefersDark ? DARK_THEME : LIGHT_THEME;
}

function applyTheme(theme, root, label) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  if (label) {
    label.textContent = theme === DARK_THEME ? 'INK // DARK' : 'PAPER // LIGHT';
  }
}

function initTelemetryClock(clockElement) {
  if (!clockElement) return;

  function renderClock() {
    clockElement.textContent = formatJakartaTime(new Date());
  }

  renderClock();
  setInterval(renderClock, 1000);
}

function formatJakartaTime(date) {
  try {
    const formatted = date.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    return `${formatted} WIB`;
  } catch (error) {
    const pad = (value) => String(value).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} LOCAL`;
  }
}

function initHeaderScrollWatcher(headerElement) {
  if (!headerElement) return;

  function updateHeaderState() {
    const isPastThreshold = window.scrollY > HEADER_SCROLL_THRESHOLD_PX;
    headerElement.classList.toggle('scrolled', isPastThreshold);
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();
}

function initMobileNavigation(toggleButton, menuContainer) {
  if (!toggleButton || !menuContainer) return;

  function closeMenu() {
    menuContainer.classList.remove('mobile-open');
    toggleButton.classList.remove('active');
    toggleButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isNowOpen = menuContainer.classList.toggle('mobile-open');
    toggleButton.classList.toggle('active', isNowOpen);
    toggleButton.setAttribute('aria-expanded', String(isNowOpen));
    document.body.style.overflow = isNowOpen ? 'hidden' : '';
  }

  toggleButton.addEventListener('click', toggleMenu);

  menuContainer.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

function createToastNotifier(toastContainer, messageContainer) {
  let activeTimer = null;

  return {
    show(message, durationMs = 2800) {
      if (!toastContainer || !messageContainer) return;

      messageContainer.textContent = message;
      toastContainer.classList.add('show');

      clearTimeout(activeTimer);

      activeTimer = setTimeout(() => {
        toastContainer.classList.remove('show');
      }, durationMs);
    }
  };
}

function initEmailClipboard(copyButton, toastService) {
  if (!copyButton) return;

  copyButton.addEventListener('click', async () => {
    const targetEmail = copyButton.getAttribute('data-email') || 'fagastocarlo@gmail.com';
    const isSuccess = await copyTextToClipboard(targetEmail);

    if (isSuccess) {
      toastService.show('EMAIL COPIED // READY TO CONNECT');
    } else {
      toastService.show(`EMAIL: ${targetEmail}`);
    }
  });
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (clipboardError) {
      // Fall through to legacy DOM copy
    }
  }

  return copyTextUsingFallback(text);
}

function copyTextUsingFallback(text) {
  const temporaryTextarea = document.createElement('textarea');
  temporaryTextarea.value = text;
  temporaryTextarea.style.position = 'fixed';
  temporaryTextarea.style.opacity = '0';
  document.body.appendChild(temporaryTextarea);
  temporaryTextarea.select();

  let succeeded = false;
  try {
    succeeded = document.execCommand('copy');
  } catch (execError) {
    succeeded = false;
  }

  document.body.removeChild(temporaryTextarea);
  return succeeded;
}

function initProjectFiltering(filterButtons, projectCards) {
  if (filterButtons.length === 0 || projectCards.length === 0) return;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedFilter = button.getAttribute('data-filter') || 'all';

      updateFilterButtonStates(filterButtons, button);
      applyFilterToCards(projectCards, selectedFilter);
    });
  });
}

function updateFilterButtonStates(buttons, activeButton) {
  buttons.forEach((btn) => {
    const isSelected = btn === activeButton;
    btn.classList.toggle('active', isSelected);
    btn.setAttribute('aria-selected', String(isSelected));
  });
}

function applyFilterToCards(cards, filterCategory) {
  cards.forEach((cardNode) => {
    if (!(cardNode instanceof HTMLElement)) return;

    const itemCategory = cardNode.getAttribute('data-category');
    const matchesFilter = filterCategory === 'all' || itemCategory === filterCategory;

    if (matchesFilter) {
      showProjectCard(cardNode);
    } else {
      hideProjectCard(cardNode, filterCategory);
    }
  });
}

function showProjectCard(card) {
  card.style.display = 'flex';
  requestAnimationFrame(() => {
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });
}

function hideProjectCard(card, currentFilter) {
  card.style.opacity = '0';
  card.style.transform = 'translateY(12px)';

  setTimeout(() => {
    const cardCategory = card.getAttribute('data-category');
    if (currentFilter !== 'all' && cardCategory !== currentFilter) {
      card.style.display = 'none';
    }
  }, 150);
}

// 9. 3D PERSPECTIVE CARD TILT MODULE

function initCardTiltEffect(cardElement) {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (!cardElement || isReducedMotion || isTouchDevice) return;

  /** @type {DOMRect | null} */
  let cachedBoundingBox = null;

  cardElement.addEventListener('mouseenter', () => {
    cachedBoundingBox = cardElement.getBoundingClientRect();
  });

  cardElement.addEventListener('mousemove', (event) => {
    if (!cachedBoundingBox) {
      cachedBoundingBox = cardElement.getBoundingClientRect();
    }
    const { tiltX, tiltY } = calculateCardTilt(event.clientX, event.clientY, cachedBoundingBox);
    cardElement.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
  });

  cardElement.addEventListener('mouseleave', () => {
    cardElement.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    cachedBoundingBox = null;
  });
}

function calculateCardTilt(clientX, clientY, bounds) {
  const horizontalFraction = ((clientX - bounds.left) / bounds.width) - 0.5;
  const verticalFraction = ((clientY - bounds.top) / bounds.height) - 0.5;

  const tiltX = parseFloat((verticalFraction * -12).toFixed(2));
  const tiltY = parseFloat((horizontalFraction * 14).toFixed(2));

  return { tiltX, tiltY };
}

// 10. NUMERIC ROLL-UP COUNTERS & SCROLL REVEALS
let hasMetricCountersAnimated = false;

function initScrollAndMetricReveals() {
  const revealTargets = document.querySelectorAll('.reveal-element');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(handleIntersectionReveal, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    // Fallback when IntersectionObserver is unavailable
    revealTargets.forEach((element) => element.classList.add('is-revealed'));
    runAllMetricCounters();
  }

  // Reveal hero elements immediately
  requestAnimationFrame(() => {
    document.querySelectorAll('.hero-section .reveal-element').forEach((element) => {
      element.classList.add('is-revealed');
    });
    setTimeout(runAllMetricCounters, 300);
  });
}

function handleIntersectionReveal(entries, observerInstance) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add('is-revealed');

    const isHeroMetrics = entry.target.classList.contains('hero-metrics-grid') ||
                          entry.target.closest('.hero-metrics-grid') !== null;

    if (isHeroMetrics) {
      runAllMetricCounters();
    }

    observerInstance.unobserve(entry.target);
  });
}

function runAllMetricCounters() {
  if (hasMetricCountersAnimated) return;
  hasMetricCountersAnimated = true;

  const counterNodes = document.querySelectorAll('.counter-value');
  counterNodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;

    const targetValue = parseFloat(node.getAttribute('data-target') || '0');
    const decimalPlaces = parseInt(node.getAttribute('data-decimals') || '0', 10);

    /** @type {CounterMetrics} */
    const metrics = {
      target: targetValue,
      decimals: decimalPlaces,
      durationMs: 1400
    };

    animateSingleCounter(node, metrics);
  });
}

function animateSingleCounter(element, metrics) {
  const startTime = performance.now();

  function tick(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / metrics.durationMs, 1);
    const easedProgress = calculateEaseOutExpo(progress);
    const currentValue = easedProgress * metrics.target;

    element.textContent = currentValue.toFixed(metrics.decimals);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = metrics.target.toFixed(metrics.decimals);
    }
  }

  requestAnimationFrame(tick);
}

function calculateEaseOutExpo(progress) {
  return progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
}

function initTacticalKeyboardShortcuts(toastService) {
  document.addEventListener('keydown', (event) => {
    if (isInteractiveInput(event.target)) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const key = event.key.toLowerCase();

    switch (key) {
      case 't':
        toggleThemeViaShortcut(toastService);
        break;
      case 'p':
        smoothScrollToSection('projects', 'SHORTCUT [P]: JUMPED TO BUILDS', toastService);
        break;
      case 'c':
        smoothScrollToSection('contact', 'SHORTCUT [C]: JUMPED TO CONTACT', toastService);
        break;
      case 'h':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toastService.show('SHORTCUT [H]: JUMPED TO TOP');
        break;
      default:
        break;
    }
  });
}

function isInteractiveInput(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
}

function toggleThemeViaShortcut(toastService) {
  const root = document.documentElement;
  const label = document.getElementById('theme-label');
  const current = root.getAttribute('data-theme') === DARK_THEME ? DARK_THEME : LIGHT_THEME;
  const next = current === DARK_THEME ? LIGHT_THEME : DARK_THEME;

  applyTheme(next, root, label);
  toastService.show(`SHORTCUT [T]: THEME ${next.toUpperCase()}`);
}

function smoothScrollToSection(elementId, toastMessage, toastService) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth' });
  toastService.show(toastMessage);
}

function logSystemDiagnostics() {
  console.log(
    '%c[CF.DEV] %cTELEMETRY SYSTEM ONLINE // CARLO FAGASTO // UNTAR SEMESTER 5',
    'background: #fff; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 2px;',
    'color: #fff; font-family: monospace; font-size: 11px;'
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
  initializePortfolio();
}
