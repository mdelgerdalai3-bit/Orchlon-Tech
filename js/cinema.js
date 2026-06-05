/* =====================================================================
   CINEMA LAYER — Orchlon TechSupply
   Premium scroll/motion behaviours layered on top of the existing site.
   100% additive & defensive: if anything is missing it silently no-ops.
   Loads AFTER main.js. Touches no existing functions or data.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia &&
    window.matchMedia('(hover: none)').matches;

  document.documentElement.classList.add('cine-on');

  /* ---------------------------------------------------------------
     1. SMOOTH INERTIA SCROLL (Lenis, loaded via CDN if available)
     --------------------------------------------------------------- */
  var lenis = null;
  function initLenis() {
    if (reduceMotion || typeof window.Lenis !== 'function') return;
    try {
      lenis = new window.Lenis({
        duration: 1.1,
        lerp: 0.1,
        smoothWheel: true,
        // Safari / iOS behave better without synthetic touch smoothing
        syncTouch: false
      });
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);

      // Pause Lenis whenever the mobile drawer (body scroll-lock) is open
      var drawer = document.getElementById('drawer');
      if (drawer && 'MutationObserver' in window) {
        new MutationObserver(function () {
          if (drawer.classList.contains('open')) lenis.stop();
          else lenis.start();
        }).observe(drawer, { attributes: true, attributeFilter: ['class'] });
      }
    } catch (e) { /* never break the page over a nicety */ }
  }

  /* ---------------------------------------------------------------
     2. SCROLL PROGRESS BAR
     --------------------------------------------------------------- */
  function initProgressBar() {
    var bar = document.createElement('div');
    bar.className = 'cine-progress';
    document.body.appendChild(bar);
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop || window.scrollY) / max * 100 : 0;
      bar.style.width = pct.toFixed(2) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------------------------------
     3. SCROLL REVEAL (IntersectionObserver, flash-free)
     --------------------------------------------------------------- */
  var io = null;
  // Selectors that should animate into view
  var REVEAL_SELECTOR = [
    '.section-head', '.product-card', '.cat-card', '.feature',
    '.hero-text', '.hero-visual', '.hero-card', '.promo-inner',
    '.newsletter-inner', '.features-grid > *', '.footer-col',
    '.brand-row', '.pdp-gallery', '.pdp-info', '.pdp-tabs', '.cart-item'
  ].join(',');

  function reveal(el, indexInGroup) {
    if (el.dataset.cineReveal) return;          // already processed
    el.dataset.cineReveal = '1';

    if (reduceMotion) { el.classList.add('reveal', 'in'); return; }

    // stagger siblings a touch for a cinematic cascade
    if (indexInGroup) {
      el.style.transitionDelay = Math.min(indexInGroup, 8) * 60 + 'ms';
    }

    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    // Already on screen → show immediately (no flash, no hide)
    if (rect.top < vh * 0.92 && rect.bottom > 0) {
      el.classList.add('reveal', 'in');
      return;
    }
    el.classList.add('reveal');
    if (io) io.observe(el);
  }

  function processTargets(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll(REVEAL_SELECTOR);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      // position among siblings → staggered cascade
      var n = 0, sib = el.previousElementSibling;
      while (sib) { n++; sib = sib.previousElementSibling; }
      reveal(el, n % 12);
    }
  }

  function initReveal() {
    if ('IntersectionObserver' in window && !reduceMotion) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    processTargets(document);

    // Catch async-rendered product cards (home / listing / cart / related)
    if ('MutationObserver' in window) {
      var gridIds = ['featuredGrid', 'bestGrid', 'listingGrid',
                     'relatedGrid', 'cartItems', 'brandRow', 'pdpRoot'];
      gridIds.forEach(function (id) {
        var grid = document.getElementById(id);
        if (!grid) return;
        new MutationObserver(function () {
          processTargets(grid);
        }).observe(grid, { childList: true, subtree: true });
      });
    }
  }

  /* ---------------------------------------------------------------
     4. COUNT-UP STATS  (hero: "6 сар", "24 цаг", "100%")
     --------------------------------------------------------------- */
  function initCounters() {
    var stats = document.querySelectorAll('.hero-stats strong');
    if (!stats.length) return;
    var done = false;
    function run() {
      if (done) return; done = true;
      stats.forEach(function (el) {
        var raw = el.textContent;
        var m = raw.match(/^(\D*)(\d[\d,]*)(.*)$/);
        if (!m) return;
        var pre = m[1], target = parseInt(m[2].replace(/,/g, ''), 10), suf = m[3];
        if (reduceMotion || !target) return;
        var start = null, dur = 1100;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(target * eased) + suf;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }
    var heroStats = document.querySelector('.hero-stats');
    if ('IntersectionObserver' in window && heroStats) {
      var o = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { run(); o.disconnect(); }
      }, { threshold: 0.4 });
      o.observe(heroStats);
    } else { run(); }
  }

  /* ---------------------------------------------------------------
     5. 3D TILT on product / hero cards (pointer-driven)
     --------------------------------------------------------------- */
  function initTilt() {
    if (reduceMotion || isTouch) return;
    var MAX = 7; // degrees
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.product-card, .hero-card');
      if (!card) return;
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add('tilting');
      card.style.transform =
        'perspective(800px) rotateX(' + (-py * MAX).toFixed(2) + 'deg) rotateY(' +
        (px * MAX).toFixed(2) + 'deg) translateY(-4px)';
    });
    document.addEventListener('pointerout', function (e) {
      var card = e.target.closest && e.target.closest('.product-card, .hero-card');
      if (!card) return;
      card.classList.remove('tilting');
      card.style.transform = '';
    });
  }

  /* ---------------------------------------------------------------
     6. HERO PARALLAX — glow drifts slightly with scroll
     --------------------------------------------------------------- */
  function initParallax() {
    if (reduceMotion) return;
    var hero = document.querySelector('.hero-visual');
    if (!hero) return;
    window.addEventListener('scroll', function () {
      var y = (window.scrollY || document.documentElement.scrollTop) * 0.05;
      hero.style.transform = 'translateY(' + Math.min(y, 40).toFixed(1) + 'px)';
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     Boot
     --------------------------------------------------------------- */
  function boot() {
    initLenis();
    initProgressBar();
    initReveal();
    initCounters();
    initTilt();
    initParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
