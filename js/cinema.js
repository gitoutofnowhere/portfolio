/**
 * HA MINH THUAN — A STORY IN MOTION
 * Scene controller: opening sequence, scroll-driven scenes, reveals,
 * hero light & dust, counters, modal, menu.
 *
 * Motion principle: discovery → transition → focus → connection.
 * Everything degrades gracefully with prefers-reduced-motion.
 */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ------------------------------------------------------------------
     OPENING SEQUENCE
     ------------------------------------------------------------------ */
  function runOpening() {
    const opening = $('#opening');
    let finished = false;
    const timers = [];

    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      try { sessionStorage.setItem('hmt-opened', '1'); } catch (e) { /* ignore */ }
      if (opening) opening.classList.add('done');
      body.classList.remove('is-loading');
      // let the black dissolve before the hero light comes up
      setTimeout(() => body.classList.add('revealed'), opening ? 300 : 0);
      setTimeout(() => opening && opening.remove(), 1800);
      window.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') finish(); };

    let seen = false;
    try { seen = sessionStorage.getItem('hmt-opened') === '1'; } catch (e) { /* ignore */ }

    if (!opening || reduceMotion || seen || location.hash) {
      if (opening) opening.style.display = 'none';
      finish();
      return;
    }

    const set = (cls) => { opening.className = 'opening ' + cls; };
    const schedule = [
      [200, 'f1'], [1700, ''],
      [2000, 'f2'], [3800, ''],
      [4050, 'f3'], [5300, ''],
      [5550, 'f4'], [8000, 'f4-out'],
      [8300, 'f5'], [10400, null]
    ];
    schedule.forEach(([t, cls]) => {
      timers.push(setTimeout(() => (cls === null ? finish() : set(cls)), t));
    });

    $('#opening-skip').addEventListener('click', finish);
    window.addEventListener('keydown', onKey);
  }

  /* ------------------------------------------------------------------
     REVEALS (IntersectionObserver)
     ------------------------------------------------------------------ */
  function initReveals() {
    const targets = $$('.reveal, .reveal-img, .funnel, .matrix, .chain, .sketch');

    // gentle stagger for siblings that enter together
    const groups = new Map();
    $$('.reveal').forEach((el) => {
      const p = el.parentElement;
      const i = groups.get(p) || 0;
      groups.set(p, i + 1);
      if (i > 0) el.style.transitionDelay = Math.min(i * 90, 540) + 'ms';
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('in'));
      $$('[data-count]').forEach(finishCount);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        $$('[data-count]', entry.target).forEach(animateCount);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });

    targets.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
     COUNTERS
     ------------------------------------------------------------------ */
  const fmt = (n) => n.toLocaleString('en-US');
  function finishCount(el) {
    el.textContent = fmt(+el.dataset.count) + (el.dataset.suffix || '');
  }
  function animateCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const dur = 2200;
    const t0 = performance.now();
    const tick = (now) => {
      const p = clamp((now - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(target * eased)) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------
     BANK MATRIX — 27 banks × 5 years (structure only, no values)
     ------------------------------------------------------------------ */
  function buildMatrix() {
    const m = $('#bank-matrix');
    if (!m) return;
    const frag = document.createDocumentFragment();
    for (let bank = 0; bank < 27; bank++) {
      for (let year = 0; year < 5; year++) {
        const s = document.createElement('span');
        s.style.transitionDelay = (bank * 28 + year * 60) + 'ms';
        s.title = `Bank ${bank + 1} · ${2020 + year}`;
        frag.appendChild(s);
      }
    }
    m.appendChild(frag);
  }

  /* ------------------------------------------------------------------
     HERO — cursor light + drifting dust
     ------------------------------------------------------------------ */
  function initHero() {
    const hero = $('#top');
    if (!hero) return;

    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    }

    const canvas = $('#hero-particles');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles = [], running = true, raf;

    const colors = ['236,229,216', '203,182,140', '154,139,181'];
    const count = () => Math.round(clamp(window.innerWidth / 22, 30, 80));

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: count() }, spawn);
    }
    function spawn() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(Math.random() * 0.12 + 0.03),
        a: Math.random() * 0.5 + 0.1,
        t: Math.random() * Math.PI * 2,
        c: colors[Math.floor(Math.random() * colors.length)]
      };
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.t += 0.012;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.t));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${alpha})`;
        ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);

    // pause when the hero is off-screen
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; draw(); }
      else if (!e.isIntersecting) { running = false; cancelAnimationFrame(raf); }
    }).observe(hero);
  }

  /* ------------------------------------------------------------------
     SCROLL-DRIVEN SCENES
     ------------------------------------------------------------------ */
  function initScroll() {
    const nav = $('#nav');
    const thread = $('#thread');
    const threadWords = $$('.thread-word');
    const threadLine = $('.thread-line line');
    const threadIdx = $('#thread-idx');
    const path = $('#path');
    const pathTrack = $('#path-track');
    const pathFrames = $$('.path-frame');
    const pathBar = $('#path-progress-bar');
    const pathSticky = $('.path-sticky');
    const pipeline = $$('#pipeline li');
    const pipelineEl = $('#pipeline');
    const thinkSteps = $('#think-steps');
    const thinkLine = $('.think-line line');
    const parallax = $$('[data-parallax]');
    const scenes = $$('[data-scene]');
    const sceneInd = $('#scene-indicator');
    const sceneNum = $('#scene-num');
    const sceneName = $('#scene-name');
    const navLinks = $$('.nav-links a');

    // which nav link represents each scene
    const navMap = {
      about: 'about', path: 'about', experience: 'experience', work: 'work',
      thinking: 'thinking', toolkit: 'thinking', research: 'research', next: 'research', contact: 'contact'
    };

    let lastY = window.scrollY;
    let ticking = false;
    let vh = window.innerHeight;
    let vw = window.innerWidth;

    const progressOf = (el) => {
      const r = el.getBoundingClientRect();
      const total = r.height - vh;
      return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    };

    function update() {
      ticking = false;
      const y = window.scrollY;

      // Nav: quiet when reading downward, returns when scrolling up
      nav.classList.toggle('scrolled', y > 40);
      if (y > vh && y > lastY + 4) nav.classList.add('hidden');
      else if (y < lastY - 4 || y < vh) nav.classList.remove('hidden');
      lastY = y;

      if (!reduceMotion) {
        // The thread — one word at a time
        if (thread) {
          const p = progressOf(thread);
          const idx = clamp(Math.floor(p * threadWords.length * 0.999), 0, threadWords.length - 1);
          const visible = thread.getBoundingClientRect().top < vh * 0.5;
          threadWords.forEach((w, i) => {
            w.classList.toggle('active', visible && i === idx);
            w.classList.toggle('past', visible && i < idx);
          });
          if (threadLine) threadLine.style.setProperty('--dash', String(1000 - p * 1000));
          if (threadIdx) threadIdx.textContent = String(idx + 1).padStart(2, '0');
        }

        // The path — horizontal film strip
        if (path && vw > 860) {
          const p = progressOf(path);
          const dist = pathTrack.scrollWidth - vw + vw * 0.1;
          pathTrack.style.transform = `translate3d(${-p * dist}px,0,0)`;
          const active = Math.round(p * (pathFrames.length - 1));
          pathFrames.forEach((f, i) => f.classList.toggle('active', i <= active));
          if (pathBar) pathBar.style.width = (p * 100) + '%';
          if (pathSticky) pathSticky.style.setProperty('--glow-x', (15 + p * 70) + '%');
        }

        // Credit-risk pipeline — steps light as you read
        if (pipelineEl) {
          const r = pipelineEl.getBoundingClientRect();
          const f = clamp((vh * 0.78 - r.top) / (r.height * 0.9), 0, 1);
          const lit = Math.round(f * pipeline.length);
          pipeline.forEach((li, i) => li.classList.toggle('lit', i < lit));
        }

        // Thinking — a line connecting the five steps
        if (thinkSteps && thinkLine) {
          const r = thinkSteps.getBoundingClientRect();
          const f = clamp((vh * 0.85 - r.top) / (vh * 0.6), 0, 1);
          thinkLine.style.setProperty('--dash', String(1000 - f * 1000));
        }

        // Parallax on imagery
        parallax.forEach((img) => {
          const r = img.parentElement.getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) return;
          const speed = parseFloat(img.dataset.parallax) || 0.06;
          const offset = (r.top + r.height / 2 - vh / 2) * -speed;
          img.style.translate = `0 ${offset - r.height * 0.07}px`;
        });
      } else {
        pathFrames.forEach((f) => f.classList.add('active'));
        pipeline.forEach((li) => li.classList.add('lit'));
      }

      // Scene indicator + active nav link
      let current = null;
      for (const s of scenes) {
        if (s.getBoundingClientRect().top <= vh * 0.45) current = s;
      }
      if (current && sceneInd) {
        sceneInd.classList.toggle('visible', current.id !== 'top' && current.id !== 'thread');
        sceneNum.textContent = current.dataset.scene;
        sceneName.textContent = current.dataset.sceneName;
      }
      const key = current ? navMap[current.id] : null;
      navLinks.forEach((a) => a.classList.toggle('active', key && a.getAttribute('href') === '#' + key));
    }

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      vh = window.innerHeight; vw = window.innerWidth;
      if (vw <= 860 && pathTrack) pathTrack.style.transform = '';
      onScroll();
    });
    update();
  }

  /* ------------------------------------------------------------------
     MENU, MODAL, EMAIL
     ------------------------------------------------------------------ */
  function initUI() {
    const menuBtn = $('#nav-menu');
    const overlay = $('#menu-overlay');
    const toggleMenu = (open) => {
      const isOpen = open ?? !overlay.classList.contains('open');
      overlay.classList.toggle('open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      body.style.overflow = isOpen ? 'hidden' : '';
    };
    if (menuBtn && overlay) {
      menuBtn.addEventListener('click', () => toggleMenu());
      $$('a', overlay).forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
    }

    let lastFocus = null;
    window.openModal = (id) => {
      const m = document.getElementById(id);
      if (!m) return;
      lastFocus = document.activeElement;
      m.classList.add('open');
      body.style.overflow = 'hidden';
      const close = $('.modal-close', m);
      if (close) setTimeout(() => close.focus(), 50);
    };
    window.closeModal = (id) => {
      const m = id ? document.getElementById(id) : $('.modal.open');
      if (!m) return;
      m.classList.remove('open');
      body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };
    $$('.modal [data-close]').forEach((el) =>
      el.addEventListener('click', () => window.closeModal(el.closest('.modal').id)));
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if ($('.modal.open')) window.closeModal();
      else if (overlay && overlay.classList.contains('open')) toggleMenu(false);
    });

    const emailBtn = $('#copy-email');
    const hint = $('#copy-hint');
    if (emailBtn) {
      emailBtn.addEventListener('click', async () => {
        const email = emailBtn.dataset.email;
        try {
          await navigator.clipboard.writeText(email);
          hint.textContent = 'Copied';
        } catch (e) {
          window.location.href = 'mailto:' + email;
          return;
        }
        setTimeout(() => (hint.textContent = 'Click to copy'), 2200);
      });
    }
  }

  /* ------------------------------------------------------------------
     BOOT
     ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    buildMatrix();
    initReveals();
    initHero();
    initScroll();
    initUI();
    runOpening();
  });
})();
