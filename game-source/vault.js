/* ----------------------------------------------------------------------------
   CHICKEN KING'S VAULT — SHARED RUNTIME (vault.js)
   Loader · custom cursor + trail · navbar · reusable toast · count-up ·
   scroll-reveal · lazy GSAP · lazy confetti · all 10 easter eggs.
   Defensive: every block guards for missing elements so it runs on any page.
   Everything respects prefers-reduced-motion and never blocks first paint.
   -------------------------------------------------------------------------- */
(function () {
  'use strict';

  var rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var RM = function () { return rmQuery.matches; };
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------------------
     LAZY LOADERS (CDN, never on first paint)
     ------------------------------------------------------------------------- */
  var _scripts = {};
  function loadScript(src) {
    if (_scripts[src]) return _scripts[src];
    _scripts[src] = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    return _scripts[src];
  }
  function loadConfetti() {
    return loadScript('https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js')
      .then(function () { return window.confetti; });
  }
  function loadGSAP() {
    return loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js')
      .then(function () { return window.gsap; });
  }

  /* Fire confetti only when motion is allowed; otherwise it's a no-op. */
  function burst(opts) {
    if (RM()) return Promise.resolve();
    return loadConfetti().then(function (confetti) {
      if (!confetti) return;
      confetti(Object.assign({
        particleCount: 120, spread: 75, origin: { y: 0.7 },
        colors: ['#FF2D78', '#FFD700', '#00D4FF', '#9B5DE5', '#00F5A0']
      }, opts || {}));
    }).catch(function () {});
  }

  /* ---------------------------------------------------------------------------
     TOAST SYSTEM  (window.Vault.toast — every egg funnels here)
     ------------------------------------------------------------------------- */
  var toastWrap;
  function ensureToastWrap() {
    if (toastWrap) return toastWrap;
    toastWrap = $('.toast-wrap');
    if (!toastWrap) {
      toastWrap = document.createElement('div');
      toastWrap.className = 'toast-wrap';
      document.body.appendChild(toastWrap);
    }
    return toastWrap;
  }
  function toast(msg, opts) {
    opts = opts || {};
    var wrap = ensureToastWrap();
    var t = document.createElement('div');
    t.className = 'toast' + (opts.color ? ' ' + opts.color : '');
    t.setAttribute('role', 'status');
    if (opts.emoji) {
      var e = document.createElement('span');
      e.className = 'toast-emoji'; e.textContent = opts.emoji;
      t.appendChild(e);
    }
    var span = document.createElement('span');
    span.textContent = msg;
    t.appendChild(span);
    wrap.appendChild(t);
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('show'); }); });
    var life = opts.duration || 3200;
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 500);
    }, life);
  }

  /* ---------------------------------------------------------------------------
     LOADER
     ------------------------------------------------------------------------- */
  function initLoader() {
    var loader = $('.loader');
    if (!loader) return;
    if (RM()) { loader.classList.add('done'); cleanup(); return; }

    var fill = $('.loader-fill', loader);
    var pct = $('.loader-pct', loader);
    var p = 0, done = false;
    function tick() {
      if (done) return;
      // ease toward 90, then wait for window load
      p += (90 - p) * 0.06 + 0.6;
      if (p > 90) p = 90;
      if (fill) fill.style.width = p + '%';
      if (pct) pct.textContent = Math.round(p) + '%';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    function finish() {
      if (done) return; done = true;
      if (fill) fill.style.width = '100%';
      if (pct) pct.textContent = '100%';
      setTimeout(function () { loader.classList.add('done'); cleanup(); }, 260);
    }
    function cleanup() {
      setTimeout(function () { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); document.body.classList.add('loaded'); }, 760);
    }
    if (document.readyState === 'complete') setTimeout(finish, 420);
    else window.addEventListener('load', function () { setTimeout(finish, 320); });
    // hard fallback — never let the loader trap the user
    setTimeout(finish, 3500);
  }

  /* ---------------------------------------------------------------------------
     CUSTOM CURSOR + COLORED TRAIL  (fine pointer only, motion only)
     ------------------------------------------------------------------------- */
  function initCursor() {
    if (!finePointer || RM()) return;
    var dot = $('.cursor-dot'), ring = $('.cursor-ring');
    if (!dot || !ring) return;
    document.body.classList.add('has-cursor');

    var trailColors = ['#FF2D78', '#FFD700', '#00D4FF', '#9B5DE5', '#00F5A0'];
    var TRAIL = 10, trail = [];
    for (var i = 0; i < TRAIL; i++) {
      var d = document.createElement('div');
      d.className = 'cursor-dot';
      d.style.background = trailColors[i % trailColors.length];
      d.style.opacity = (1 - i / TRAIL) * 0.5;
      d.style.width = d.style.height = Math.max(3, 6 - i * 0.4) + 'px';
      d.style.boxShadow = 'none';
      document.body.appendChild(d);
      trail.push({ el: d, x: 0, y: 0 });
    }

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var dx = mx, dy = my, rx = mx, ry = my;
    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });

    function loop() {
      dx += (mx - dx) * 0.35; dy += (my - dy) * 0.35;
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      dot.style.transform  = 'translate3d(' + dx + 'px,' + dy + 'px,0) translate(-50%,-50%)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      var px = dx, py = dy;
      for (var i = 0; i < trail.length; i++) {
        var t = trail[i];
        t.x += (px - t.x) * 0.5; t.y += (py - t.y) * 0.5;
        t.el.style.transform = 'translate3d(' + t.x + 'px,' + t.y + 'px,0) translate(-50%,-50%)';
        px = t.x; py = t.y;
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // grow ring over interactive targets
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, .game-link, input')) document.body.classList.add('cursor-hot');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('a, button, .game-link, input')) document.body.classList.remove('cursor-hot');
    });
  }

  /* ---------------------------------------------------------------------------
     NAVBAR — mobile menu
     ------------------------------------------------------------------------- */
  function initNav() {
    var burger = $('.nav-burger');
    if (burger) {
      burger.addEventListener('click', function () { document.body.classList.toggle('menu-open'); });
      $$('.mobile-menu a').forEach(function (a) {
        a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
      });
    }
  }

  /* ---------------------------------------------------------------------------
     COUNT-UP  ([data-countup="726"])  — runs when revealed
     ------------------------------------------------------------------------- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-countup'), 10) || 0;
    if (RM()) { el.textContent = target.toLocaleString(); return; }
    var dur = 1600, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.round(eased * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------------------------
     SCROLL REVEAL + COUNT-UP TRIGGER
     ------------------------------------------------------------------------- */
  function initReveal() {
    var reveals = $$('.reveal');
    var counters = $$('[data-countup]');
    if (RM() || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in'); });
      counters.forEach(countUp);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.hasAttribute('data-countup')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    counters.forEach(function (el) { if (!el.classList.contains('reveal')) io.observe(el); });
  }

  /* ---------------------------------------------------------------------------
     HERO ENTRANCE  (lazy GSAP, with CSS-visible fallback)
     ------------------------------------------------------------------------- */
  function initHeroIntro() {
    var hero = $('[data-hero]');
    if (!hero || RM()) return;
    loadGSAP().then(function (gsap) {
      if (!gsap) return;
      var bits = $$('[data-hero-anim]', hero);
      if (!bits.length) return;
      gsap.from(bits, { y: 30, opacity: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out', delay: 0.15 });
      var card = $('[data-hero-card]', hero);
      if (card) gsap.from(card, { y: 50, opacity: 0, rotateY: 18, duration: 1, ease: 'power3.out', delay: 0.3 });
    }).catch(function () {});
  }

  /* 3D tilt on the featured hero card (pointer only, motion only) */
  function initTilt() {
    var card = $('[data-tilt]');
    if (!card || !finePointer || RM()) return;
    var inner = $('[data-tilt-inner]', card) || card;
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      inner.style.transform = 'perspective(900px) rotateY(' + (px * 14) + 'deg) rotateX(' + (-py * 14) + 'deg)';
    });
    card.addEventListener('mouseleave', function () { inner.style.transform = ''; });
  }

  /* ---------------------------------------------------------------------------
     EASTER EGGS  (all funnel through the toast system)
     ------------------------------------------------------------------------- */

  // #2 + glitch — logo crown clicked x5 → rainbow mode
  function initLogoEgg() {
    var crown = $('[data-logo-egg]');
    var brand = $('.brand');
    if (!crown) return;
    var n = 0, timer;
    crown.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      n++; clearTimeout(timer); timer = setTimeout(function () { n = 0; }, 700);
      if (brand) { brand.classList.remove('glitch'); void brand.offsetWidth; brand.classList.add('glitch'); }
      if (n >= 5) {
        n = 0;
        document.body.classList.toggle('rainbow');
        var on = document.body.classList.contains('rainbow');
        toast(on ? 'RAINBOW MODE: ENGAGED' : 'Back to normal… boring.', { emoji: '🌈', color: 'pink' });
      }
    });
  }

  // #6 — footer chicken clicked x3
  function initFooterChicken() {
    var c = $('[data-footer-chicken]');
    if (!c) return;
    var n = 0, timer;
    var lines = ['bawk bawk 🐔', 'the chicken approves', 'KING of the coop 👑', 'cluck responsibly'];
    c.addEventListener('click', function () {
      n++; clearTimeout(timer); timer = setTimeout(function () { n = 0; }, 1200);
      c.style.transform = 'rotate(-12deg) scale(1.25)';
      setTimeout(function () { c.style.transform = ''; }, 180);
      if (n >= 3) { n = 0; toast(lines[Math.floor(Math.random() * lines.length)], { emoji: '🐔', color: 'gold' }); }
    });
  }

  // #5 — double-click a game card → "you sure?" overlay
  function initCardDblClick() {
    var overlay = $('[data-confirm]');
    if (!overlay) return;
    var pending = null;
    var yes = $('[data-confirm-yes]', overlay);
    var no  = $('[data-confirm-no]', overlay);
    function close() { overlay.classList.remove('show'); pending = null; }
    document.addEventListener('dblclick', function (e) {
      var link = e.target.closest('.game-link');
      if (!link) return;
      e.preventDefault();
      pending = link.getAttribute('href');
      overlay.classList.add('show');
    });
    if (yes) yes.addEventListener('click', function () { if (pending) window.location.href = pending; else close(); });
    if (no) no.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  // #1 Konami + #4 type "chicken"
  function initKeyEggs() {
    var konami = [38,38,40,40,37,39,37,39,66,65];
    var kbuf = [];
    var word = '';
    document.addEventListener('keydown', function (e) {
      // konami
      kbuf.push(e.keyCode); if (kbuf.length > konami.length) kbuf.shift();
      if (kbuf.join(',') === konami.join(',')) { kbuf = []; konamiEgg(); }
      // typed word (ignore when typing in a field)
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (/^[a-z]$/i.test(e.key)) {
        word = (word + e.key.toLowerCase()).slice(-7);
        if (word === 'chicken') { word = ''; chickenEgg(); }
      }
    });
  }
  function konamiEgg() {
    var fc = $('[data-fly-chicken]');
    if (fc && !RM()) { fc.classList.remove('go'); void fc.offsetWidth; fc.classList.add('go'); }
    burst({ particleCount: 160, spread: 100, startVelocity: 45 });
    toast('KONAMI UNLOCKED — chicken takes flight!', { emoji: '🐔', color: 'green' });
  }
  function chickenEgg() {
    if (!RM()) {
      document.body.style.transition = 'transform 90ms ease';
      var seq = [['-1deg', '2px'], ['1.4deg', '-2px'], ['-0.8deg', '1px'], ['0deg', '0']];
      seq.forEach(function (s, i) {
        setTimeout(function () { document.body.style.transform = 'rotate(' + s[0] + ') translateX(' + s[1] + ')'; }, i * 90);
      });
      setTimeout(function () { document.body.style.transform = ''; document.body.style.transition = ''; }, seq.length * 90 + 60);
    }
    toast('did somebody say… CHICKEN? 🐔', { emoji: '✨', color: 'gold' });
  }

  // #7 — during school hours
  function initSchoolHours() {
    try { if (sessionStorage.getItem('ckv_school')) return; } catch (e) {}
    var d = new Date(), day = d.getDay(), h = d.getHours();
    if (day >= 1 && day <= 5 && h >= 8 && h < 15) {
      setTimeout(function () {
        toast("psst… shouldn't you be in class? 👀", { emoji: '🔔', color: 'blue', duration: 4200 });
        try { sessionStorage.setItem('ckv_school', '1'); } catch (e) {}
      }, 2600);
    }
  }

  // #8 — idle 30s → crown bobs + speech bubble
  function initIdle() {
    var bubble = $('[data-idle]');
    if (!bubble) return;
    var timer;
    function reset() { bubble.classList.remove('show'); clearTimeout(timer); timer = setTimeout(show, 30000); }
    function show() { bubble.classList.add('show'); }
    ['mousemove','keydown','scroll','touchstart','click'].forEach(function (ev) {
      window.addEventListener(ev, reset, { passive: true });
    });
    reset();
  }

  // #9 — scroll to bottom → confetti + toast (once)
  function initScrollBottom() {
    var fired = false;
    window.addEventListener('scroll', function () {
      if (fired) return;
      var bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 80;
      if (bottom) {
        fired = true;
        burst({ particleCount: 90, spread: 120, origin: { y: 1 } });
        toast('you made it to the bottom — legend 🏆', { emoji: '🎉', color: 'green' });
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------------
     PUBLIC API + BOOT
     ------------------------------------------------------------------------- */
  window.Vault = { toast: toast, burst: burst, loadGSAP: loadGSAP, loadConfetti: loadConfetti, RM: RM };

  function boot() {
    initLoader();
    initCursor();
    initNav();
    initReveal();
    initHeroIntro();
    initTilt();
    initLogoEgg();
    initFooterChicken();
    initCardDblClick();
    initKeyEggs();
    initSchoolHours();
    initIdle();
    initScrollBottom();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
