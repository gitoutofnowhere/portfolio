/**
 * HA MINH THUAN — DEEP SPACE CINEMATIC ENGINE
 * 3D Celestial Flight · Procedural Ambient Audio · 20-30s Multi-Phase Prologue
 * Visual Reference: Interstellar · Gravitational Scale · Continuous Spatial Journey
 */

(function () {
  'use strict';

  // ========================================================================
  // 1. PROCEDURAL DEEP-SPACE AUDIO ENGINE (Web Audio API Synthesizer)
  // Zero external dependencies · Sub-bass gravitational drone & resonance
  // ========================================================================
  let audioCtx = null;
  let masterGain = null;
  let oscLow = null;
  let oscFifth = null;
  let lfo = null;
  let isAudioEnabled = false;

  function initAudioEngine() {
    if (audioCtx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();

      // Master Gain
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Lowpass Filter for distant cosmic rumble
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, audioCtx.currentTime);
      filter.Q.setValueAtTime(3.5, audioCtx.currentTime);
      filter.connect(masterGain);

      // Fundamental Sub-Bass Oscillator (55 Hz - A1)
      oscLow = audioCtx.createOscillator();
      oscLow.type = 'sine';
      oscLow.frequency.setValueAtTime(55, audioCtx.currentTime);

      // Harmonizing Fifth (82.5 Hz - E2)
      oscFifth = audioCtx.createOscillator();
      oscFifth.type = 'triangle';
      oscFifth.frequency.setValueAtTime(82.5, audioCtx.currentTime);

      // Gentle LFO for breathing accretion pulsation (0.12 Hz)
      lfo = audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, audioCtx.currentTime);
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(35, audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Secondary gentle noise buffer for stellar wind
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(220, audioCtx.currentTime);
      noiseFilter.Q.setValueAtTime(4.0, audioCtx.currentTime);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      oscLow.connect(filter);
      oscFifth.connect(filter);

      oscLow.start();
      oscFifth.start();
      lfo.start();
      whiteNoise.start();
    } catch (e) {
      console.warn('Web Audio API not supported or initialized:', e);
    }
  }

  function setAudioActive(active) {
    initAudioEngine();
    if (!audioCtx || !masterGain) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    isAudioEnabled = active;
    const label = document.getElementById('audio-label');
    const pulse = document.querySelector('.audio-icon-pulse');

    if (active) {
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.exponentialRampToValueAtTime(0.28, now + 2.5);
      if (label) label.textContent = 'Ambient Audio: On';
      if (pulse) pulse.style.boxShadow = '0 0 12px var(--star-amber-bright)';
    } else {
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      if (label) label.textContent = 'Ambient Audio: Off';
      if (pulse) pulse.style.boxShadow = 'none';
    }
  }

  function fadeOutAudioGracefully() {
    if (!audioCtx || !masterGain || !isAudioEnabled) return;
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
    setTimeout(() => {
      if (audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend();
      }
    }, 2400);
  }

  // ========================================================================
  // 2. CINEMATIC INTRO PROLOGUE (20–30s Interstellar Opening)
  // Continuous camera journey through 8 distinct phases
  // ========================================================================
  let introCanvas = null;
  let introCtx = null;
  let introWidth = 0;
  let introHeight = 0;
  let introAnimId = null;
  let introStars = [];
  let introStartTime = null;
  let isIntroRunning = false;
  const INTRO_TOTAL_MS = 27000; // ~27 seconds

  const INTRO_STAR_COUNT = 380;
  const INTRO_DEPTH = 3200;

  function initCinematicIntro() {
    const introEl = document.getElementById('space-intro');
    if (!introEl) return;

    // Check if previously dismissed in this session
    const seenSession = sessionStorage.getItem('hmt_space_intro_seen');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (seenSession === 'true' || prefersReducedMotion) {
      dismissIntroInstantly();
      return;
    }

    introCanvas = document.getElementById('intro-canvas');
    if (!introCanvas) return;
    introCtx = introCanvas.getContext('2d');

    resizeIntroCanvas();
    window.addEventListener('resize', resizeIntroCanvas);

    // Populate dedicated intro spatial dust and pinpoint stars
    introStars = [];
    for (let i = 0; i < INTRO_STAR_COUNT; i++) {
      introStars.push({
        x: (Math.random() - 0.5) * 2800,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * INTRO_DEPTH + 100,
        baseSize: Math.random() * 1.5 + 0.35,
        twinkleRate: Math.random() * 0.03 + 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
        isAmber: Math.random() > 0.82
      });
    }

    // Skip sequence button
    const skipBtn = document.getElementById('intro-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        dismissIntroWithDissolve();
      });
    }

    // Audio toggle button
    const audioBtn = document.getElementById('intro-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        setAudioActive(!isAudioEnabled);
      });
    }

    // Allow Escape key to skip intro
    window.addEventListener('keydown', handleIntroKeydown);

    // Replay prologue button in header
    const replayBtn = document.getElementById('nav-replay-intro');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        replayCinematicIntro();
      });
    }

    startIntroSequence();
  }

  function resizeIntroCanvas() {
    if (!introCanvas) return;
    introWidth = introCanvas.width = window.innerWidth;
    introHeight = introCanvas.height = window.innerHeight;
  }

  function handleIntroKeydown(e) {
    if (e.key === 'Escape' && isIntroRunning) {
      dismissIntroWithDissolve();
    }
  }

  function startIntroSequence() {
    isIntroRunning = true;
    document.body.style.overflow = 'hidden';
    const introEl = document.getElementById('space-intro');
    if (introEl) {
      introEl.classList.remove('dismissed');
      introEl.style.display = 'flex';
      introEl.style.opacity = '1';
    }

    // Reset stages
    resetIntroStageElements();

    introStartTime = performance.now();
    if (introAnimId) cancelAnimationFrame(introAnimId);
    introAnimId = requestAnimationFrame(renderIntroFrame);
  }

  function resetIntroStageElements() {
    document.querySelectorAll('.intro-stage-item').forEach(el => {
      el.classList.remove('stage-active', 'stage-exit');
    });
    const core = document.getElementById('intro-accretion-core');
    if (core) {
      core.style.opacity = '0';
      core.style.transform = 'translate(-50%, -50%) scale(0.85)';
    }
    const prog = document.getElementById('intro-progress-fill');
    if (prog) prog.style.width = '0%';
  }

  function renderIntroFrame(currentTime) {
    if (!isIntroRunning || !introCtx) return;

    const elapsed = currentTime - introStartTime;
    const progress = Math.min(1, elapsed / INTRO_TOTAL_MS);

    // Update progress bar
    const progEl = document.getElementById('intro-progress-fill');
    if (progEl) {
      progEl.style.width = (progress * 100).toFixed(1) + '%';
    }

    introCtx.clearRect(0, 0, introWidth, introHeight);

    const halfW = introWidth / 2;
    const halfH = introHeight / 2;

    // Camera speed and starlight illumination profile across 8 phases
    let cameraSpeed = 0;
    let globalLightAlpha = 0;
    let starMaxAlpha = 0;

    // --- PHASE 01: 0 - 3,500ms (Absolute Darkness) ---
    if (elapsed < 3500) {
      cameraSpeed = 0.12;
      starMaxAlpha = 0.08;
      const stageVoid = document.getElementById('intro-stage-void');
      if (stageVoid && elapsed > 1000 && !stageVoid.classList.contains('stage-active')) {
        stageVoid.classList.add('stage-active');
      }
    }
    // --- PHASE 02: 3,500 - 8,000ms (Distant Universe) ---
    else if (elapsed < 8000) {
      const stageVoid = document.getElementById('intro-stage-void');
      if (stageVoid && elapsed > 4500 && !stageVoid.classList.contains('stage-exit')) {
        stageVoid.classList.add('stage-exit');
      }
      const t = (elapsed - 3500) / 4500;
      cameraSpeed = 0.12 + t * 0.45;
      starMaxAlpha = 0.08 + t * 0.65;
    }
    // --- PHASE 03: 8,000 - 12,500ms (Movement Through Space) ---
    else if (elapsed < 12500) {
      const t = (elapsed - 8000) / 4500;
      cameraSpeed = 0.57 + t * 0.85;
      starMaxAlpha = 0.73 + t * 0.22;
      const core = document.getElementById('intro-accretion-core');
      if (core) {
        core.style.opacity = (t * 0.45).toFixed(3);
      }
    }
    // --- PHASE 04: 12,500 - 16,500ms (Light / Gravity) ---
    else if (elapsed < 16500) {
      const stageGrav = document.getElementById('intro-stage-gravity');
      if (stageGrav && !stageGrav.classList.contains('stage-active')) {
        stageGrav.classList.add('stage-active');
      }
      const core = document.getElementById('intro-accretion-core');
      if (core) {
        core.style.opacity = '0.75';
        core.style.transform = 'translate(-50%, -50%) scale(1.05)';
      }
      cameraSpeed = 1.42;
      starMaxAlpha = 0.95;
      globalLightAlpha = 0.04;
    }
    // --- PHASE 05: 16,500 - 19,500ms (First Text Reveal: HA MINH THUAN) ---
    else if (elapsed < 19500) {
      const stageGrav = document.getElementById('intro-stage-gravity');
      if (stageGrav && !stageGrav.classList.contains('stage-exit')) {
        stageGrav.classList.add('stage-exit');
      }
      const stageName = document.getElementById('intro-stage-name');
      if (stageName && !stageName.classList.contains('stage-active')) {
        stageName.classList.add('stage-active');
      }
      cameraSpeed = 0.95; // Gentle majestic deceleration
      starMaxAlpha = 0.95;
      globalLightAlpha = 0.06;
    }
    // --- PHASE 06: 19,500 - 23,000ms (Identity: INTERNATIONAL FINANCE & FOCUS) ---
    else if (elapsed < 23000) {
      const stageName = document.getElementById('intro-stage-name');
      if (stageName && !stageName.classList.contains('stage-exit')) {
        stageName.classList.add('stage-exit');
      }
      const stageDisc = document.getElementById('intro-stage-discipline');
      if (stageDisc && !stageDisc.classList.contains('stage-active')) {
        stageDisc.classList.add('stage-active');
      }
      cameraSpeed = 1.05;
      starMaxAlpha = 0.95;
      globalLightAlpha = 0.065;
    }
    // --- PHASE 07: 23,000 - 26,500ms (The System Climax: CONNECTED FORCES) ---
    else if (elapsed < 26500) {
      const stageDisc = document.getElementById('intro-stage-discipline');
      if (stageDisc && !stageDisc.classList.contains('stage-exit')) {
        stageDisc.classList.add('stage-exit');
      }
      const stageSys = document.getElementById('intro-stage-system');
      if (stageSys && !stageSys.classList.contains('stage-active')) {
        stageSys.classList.add('stage-active');
      }
      cameraSpeed = 1.25;
      starMaxAlpha = 1.0;
      globalLightAlpha = 0.08;
    }
    // --- PHASE 08: 26,500 - 28,000ms+ (Arrival into Hero) ---
    else {
      dismissIntroWithDissolve();
      return;
    }

    // Draw distant accretion bloom if lighting is awake
    if (globalLightAlpha > 0) {
      const bloom = introCtx.createRadialGradient(
        halfW, halfH, 20,
        halfW, halfH, Math.max(introWidth, introHeight) * 0.6
      );
      bloom.addColorStop(0, `rgba(226, 201, 154, ${globalLightAlpha})`);
      bloom.addColorStop(0.5, `rgba(56, 189, 248, ${globalLightAlpha * 0.35})`);
      bloom.addColorStop(1, 'rgba(1, 2, 4, 0)');
      introCtx.fillStyle = bloom;
      introCtx.fillRect(0, 0, introWidth, introHeight);
    }

    // Render and project 3D stars
    const focal = 680;
    for (let i = 0; i < introStars.length; i++) {
      const s = introStars[i];

      // Travel forward
      s.z -= cameraSpeed * 3.8;
      if (s.z < 20) {
        s.z += INTRO_DEPTH;
        s.x = (Math.random() - 0.5) * 2800;
        s.y = (Math.random() - 0.5) * 2000;
      }

      const scale = focal / s.z;
      const sx = s.x * scale + halfW;
      const sy = s.y * scale + halfH;

      if (sx < -10 || sx > introWidth + 10 || sy < -10 || sy > introHeight + 10) {
        continue;
      }

      const depthAlpha = Math.max(0.02, Math.min(1, 1 - s.z / INTRO_DEPTH));
      const twinkle = Math.sin(currentTime * s.twinkleRate + s.twinkleOffset) * 0.2;
      const alpha = Math.max(0.01, Math.min(starMaxAlpha, (depthAlpha + twinkle) * starMaxAlpha));

      const radius = Math.max(0.35, s.baseSize * scale * 0.9);

      introCtx.beginPath();

      // Subtle motion streaks during cruising phase
      if (cameraSpeed > 0.8 && s.z < 1200) {
        const streak = Math.min(16, cameraSpeed * scale * 2.2);
        introCtx.moveTo(sx, sy);
        introCtx.lineTo(sx, sy + streak);
        introCtx.strokeStyle = s.isAmber ? `rgba(226, 201, 154, ${alpha})` : `rgba(248, 250, 252, ${alpha})`;
        introCtx.lineWidth = radius * 1.1;
        introCtx.stroke();
      } else {
        introCtx.arc(sx, sy, radius, 0, Math.PI * 2);
        introCtx.fillStyle = s.isAmber ? `rgba(226, 201, 154, ${alpha})` : `rgba(248, 250, 252, ${alpha})`;
        introCtx.fill();
      }
    }

    introAnimId = requestAnimationFrame(renderIntroFrame);
  }

  function dismissIntroWithDissolve() {
    if (!isIntroRunning) return;
    isIntroRunning = false;
    sessionStorage.setItem('hmt_space_intro_seen', 'true');

    const introEl = document.getElementById('space-intro');
    if (introEl) {
      introEl.classList.add('dismissed');
      setTimeout(() => {
        introEl.style.display = 'none';
        if (introAnimId) {
          cancelAnimationFrame(introAnimId);
          introAnimId = null;
        }
      }, 1900);
    }

    document.body.style.overflow = '';
    fadeOutAudioGracefully();
    window.removeEventListener('keydown', handleIntroKeydown);
  }

  function dismissIntroInstantly() {
    isIntroRunning = false;
    document.body.style.overflow = '';
    const introEl = document.getElementById('space-intro');
    if (introEl) {
      introEl.classList.add('dismissed');
      introEl.style.display = 'none';
    }
  }

  function replayCinematicIntro() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    sessionStorage.removeItem('hmt_space_intro_seen');
    initCinematicIntro();
  }

  // ========================================================================
  // 3. MAIN OBSERVATORY 3D STARFIELD ENGINE (`space-canvas`)
  // Interactive continuous space canvas that runs during normal site voyage
  // ========================================================================
  const mainCanvas = document.getElementById('space-canvas');
  let mainCtx = null;
  let mainWidth = 0;
  let mainHeight = 0;

  const MAIN_STAR_COUNT = 550;
  const MAIN_DEPTH = 3400;
  const MAIN_FOCAL = 720;

  let mainStars = [];
  let mainCamera = {
    x: 0,
    y: 0,
    z: 0,
    targetZ: 0,
    rotX: 0,
    rotY: 0,
    targetRotX: 0,
    targetRotY: 0,
    speed: 0
  };

  function initMainSpaceCanvas() {
    if (!mainCanvas) return;
    mainCtx = mainCanvas.getContext('2d');
    resizeMainCanvas();
    window.addEventListener('resize', resizeMainCanvas);

    mainStars = [];
    for (let i = 0; i < MAIN_STAR_COUNT; i++) {
      mainStars.push({
        x: (Math.random() - 0.5) * 3200,
        y: (Math.random() - 0.5) * 2400,
        z: Math.random() * MAIN_DEPTH,
        baseSize: Math.random() * 1.5 + 0.4,
        twinkleRate: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        isAmber: Math.random() > 0.85
      });
    }

    // Camera inertia on subtle mouse parallax
    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / mainWidth - 0.5) * 2;
      const ny = (e.clientY / mainHeight - 0.5) * 2;
      mainCamera.targetRotY = nx * 0.035;
      mainCamera.targetRotX = -ny * 0.035;
    }, { passive: true });

    requestAnimationFrame(renderMainFlight);
  }

  function resizeMainCanvas() {
    if (!mainCanvas) return;
    mainWidth = mainCanvas.width = window.innerWidth;
    mainHeight = mainCanvas.height = window.innerHeight;
  }

  function updateMainCamera() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollProgress = window.scrollY / maxScroll;

    mainCamera.targetZ = scrollProgress * (MAIN_DEPTH * 0.72);

    const prevZ = mainCamera.z;
    mainCamera.z += (mainCamera.targetZ - mainCamera.z) * 0.08;
    mainCamera.speed = Math.abs(mainCamera.z - prevZ);

    mainCamera.rotX += (mainCamera.targetRotX - mainCamera.rotX) * 0.05;
    mainCamera.rotY += (mainCamera.targetRotY - mainCamera.rotY) * 0.05;
  }

  function renderMainFlight(time) {
    if (!mainCtx) return;
    mainCtx.clearRect(0, 0, mainWidth, mainHeight);

    updateMainCamera();

    const halfW = mainWidth / 2;
    const halfH = mainHeight / 2;

    // Distant accretion glow
    const horizonGlow = mainCtx.createRadialGradient(
      halfW, halfH * 1.05, 10,
      halfW, halfH * 1.05, Math.max(mainWidth, mainHeight) * 0.65
    );
    horizonGlow.addColorStop(0, 'rgba(226, 201, 154, 0.04)');
    horizonGlow.addColorStop(0.4, 'rgba(56, 189, 248, 0.012)');
    horizonGlow.addColorStop(1, 'rgba(1, 2, 4, 0)');
    mainCtx.fillStyle = horizonGlow;
    mainCtx.fillRect(0, 0, mainWidth, mainHeight);

    for (let i = 0; i < mainStars.length; i++) {
      const s = mainStars[i];

      let relZ = s.z - mainCamera.z;
      if (relZ < 10) {
        relZ += MAIN_DEPTH;
        s.z += MAIN_DEPTH;
      } else if (relZ > MAIN_DEPTH) {
        relZ -= MAIN_DEPTH;
        s.z -= MAIN_DEPTH;
      }

      const cosY = Math.cos(mainCamera.rotY);
      const sinY = Math.sin(mainCamera.rotY);
      const cosX = Math.cos(mainCamera.rotX);
      const sinX = Math.sin(mainCamera.rotX);

      let rx = s.x * cosY - relZ * sinY;
      let rz = s.x * sinY + relZ * cosY;
      let ry = s.y * cosX - rz * sinX;
      rz = s.y * sinX + rz * cosX;

      if (rz <= 20) continue;

      const scale = MAIN_FOCAL / rz;
      const screenX = rx * scale + halfW;
      const screenY = ry * scale + halfH;

      if (screenX < -20 || screenX > mainWidth + 20 || screenY < -20 || screenY > mainHeight + 20) {
        continue;
      }

      const depthAlpha = Math.min(1, Math.max(0.08, 1 - rz / MAIN_DEPTH));
      const twinkle = Math.sin(time * s.twinkleRate + s.twinkleOffset) * 0.2;
      const alpha = Math.max(0.05, Math.min(0.95, depthAlpha + twinkle));
      const radius = Math.max(0.4, s.baseSize * scale * 0.85);

      mainCtx.beginPath();
      if (mainCamera.speed > 0.8) {
        const streakLength = Math.min(14, mainCamera.speed * scale * 1.5);
        mainCtx.moveTo(screenX, screenY);
        mainCtx.lineTo(screenX, screenY + streakLength);
        mainCtx.strokeStyle = s.isAmber ? `rgba(226, 201, 154, ${alpha})` : `rgba(240, 244, 252, ${alpha})`;
        mainCtx.lineWidth = radius * 1.2;
        mainCtx.stroke();
      } else {
        mainCtx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        mainCtx.fillStyle = s.isAmber ? `rgba(226, 201, 154, ${alpha})` : `rgba(240, 244, 252, ${alpha})`;
        mainCtx.fill();
      }
    }

    requestAnimationFrame(renderMainFlight);
  }

  // ========================================================================
  // 4. CONTINUOUS SPATIAL SCROLL CONTROLLER (One Seamless Journey)
  // Preserves 100% readability without dimming text
  // ========================================================================
  function initSpatialScrollController() {
    const watermarks = document.querySelectorAll('.sector-watermark');
    const nav = document.getElementById('space-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sectors = document.querySelectorAll('.spatial-sector');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      // Nav glass appearance
      if (scrollY > 50) {
        nav?.classList.add('scrolled');
      } else {
        nav?.classList.remove('scrolled');
      }

      // Parallax on watermarks (immense scale feeling)
      watermarks.forEach(wm => {
        const rect = wm.parentElement.getBoundingClientRect();
        const offset = (rect.top - window.innerHeight / 2) * -0.10;
        wm.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });

      // Active navigation item detection
      let activeId = '';
      sectors.forEach(sec => {
        const top = sec.offsetTop - 200;
        const h = sec.offsetHeight;
        if (scrollY >= top && scrollY < top + h) {
          activeId = sec.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
      });
    }, { passive: true });
  }

  // ========================================================================
  // 5. EXPERIENCE TRAJECTORY SPINE (Orbital tracking)
  // ========================================================================
  function initTrajectorySpine() {
    const stations = document.querySelectorAll('.trajectory-station');
    if (stations.length === 0) return;

    const stationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const ring = entry.target.querySelector('.node-orbit-ring');
        const monolith = entry.target.querySelector('.station-monolith');

        if (entry.isIntersecting) {
          if (ring) {
            ring.style.borderColor = 'var(--star-amber-bright)';
            ring.style.boxShadow = '0 0 35px var(--star-amber-glow)';
            ring.style.transform = 'scale(1.2)';
          }
          if (monolith) {
            monolith.style.borderColor = 'var(--space-border-bright)';
            monolith.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 35px var(--star-amber-soft)';
          }
        } else {
          if (ring) {
            ring.style.borderColor = 'var(--star-amber)';
            ring.style.boxShadow = '0 0 20px var(--star-amber-soft)';
            ring.style.transform = 'scale(1)';
          }
          if (monolith) {
            monolith.style.borderColor = 'var(--space-border-faint)';
            monolith.style.boxShadow = '';
          }
        }
      });
    }, { threshold: 0.35 });

    stations.forEach(st => stationObserver.observe(st));
  }

  // ========================================================================
  // 6. CARDY SPECULAR LIGHT EFFECT
  // ========================================================================
  function initCardySpecular() {
    const cardEl = document.getElementById('cardy-card-element');
    const glareEl = document.getElementById('cardy-glare-element');
    if (!cardEl) return;

    cardEl.addEventListener('mousemove', (e) => {
      const rect = cardEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const rotX = ((y - cy) / cy) * -12;
      const rotY = ((x - cx) / cx) * 12;

      cardEl.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) scale3d(1.025, 1.025, 1.025)`;

      if (glareEl) {
        const gx = (x / rect.width) * 100;
        const gy = (y / rect.height) * 100;
        glareEl.style.transform = `translate(${(gx - 50).toFixed(1)}%, ${(gy - 50).toFixed(1)}%) rotate(25deg)`;
      }
    });

    cardEl.addEventListener('mouseleave', () => {
      cardEl.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    // Clicking card opens Architecture Notes modal
    cardEl.addEventListener('click', () => {
      if (typeof window.openModal === 'function') {
        window.openModal('modal-cardy-details');
      }
    });

    cardEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (typeof window.openModal === 'function') {
          window.openModal('modal-cardy-details');
        }
      }
    });
  }

  // ========================================================================
  // 7. CONTACT TRANSMISSION CLIPBOARD
  // ========================================================================
  function initTransmissionCopy() {
    const copyBtn = document.getElementById('contact-email-btn');
    const cue = document.getElementById('transmission-cue');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', () => {
      const email = copyBtn.getAttribute('data-email') || 'minhthuanha.work@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        if (cue) {
          const original = cue.textContent;
          cue.textContent = 'Transmission Address Copied to Clipboard';
          cue.style.color = 'var(--star-amber-bright)';
          setTimeout(() => {
            cue.textContent = original;
            cue.style.color = '';
          }, 3200);
        }
      }).catch(() => {
        window.location.href = `mailto:${email}`;
      });
    });
  }

  // ========================================================================
  // 8. MODAL WINDOW CONTROLLERS
  // ========================================================================
  window.openModal = function (modalId) {
    const m = document.getElementById(modalId);
    if (!m) return;
    m.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function (modalId) {
    const m = document.getElementById(modalId);
    if (!m) return;
    m.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close modal when clicking outside window
  document.querySelectorAll('.modal-space').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-space.active').forEach(m => m.classList.remove('active'));
      document.body.style.overflow = '';
    }
  });

  // ========================================================================
  // 9. MOBILE MENU CONTROLLER
  // ========================================================================
  function initMobileMenu() {
    const mobileBtn = document.getElementById('nav-toggle-mobile');
    const mobileMenu = document.getElementById('mobile-space-menu');
    const closeBtn = document.getElementById('mobile-menu-close');

    if (!mobileMenu) return;

    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    }

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }

  // ========================================================================
  // INITIALIZATION
  // ========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initCinematicIntro();
    initMainSpaceCanvas();
    initSpatialScrollController();
    initTrajectorySpine();
    initCardySpecular();
    initTransmissionCopy();
    initMobileMenu();
  });
})();
