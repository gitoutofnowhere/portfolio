/**
 * COSMOS OPENING — a ~15 s real-time cinematic prologue.
 *
 *   entering the unknown → observing a vast system → discovering a direction
 *
 * Rendered live in WebGL (no video file):
 *   • full-screen pass  — lensed background stars, volumetric dust lit by a
 *                         distant source, tilted orbital rings (true ray/plane
 *                         perspective, Kepler-like drift), bloom, restrained
 *                         anamorphic streak, vignette, grain.
 *   • point pass        — 3D star field + near dust motes with depth-of-field
 *                         bokeh, so the slow forward camera produces real parallax.
 *
 * The camera's vanishing point *is* the light: the whole journey moves toward it.
 * At the end the final statement glides (FLIP) into the hero's axis pill while
 * the cosmos dissolves — so the viewer arrives inside the site rather than cutting to it.
 *
 * Dev helpers:  ?intro        force replay (ignores session flag)
 *               ?intro&t=8.5  freeze the sequence at 8.5 s (for stills / tuning)
 */
(function () {
  'use strict';

  const root = document.getElementById('cosmos-opening');
  if (!root) return;

  const body = document.body;
  const params = new URLSearchParams(location.search);
  const force = params.has('intro');
  const freezeAt = params.has('t') ? parseFloat(params.get('t')) : null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let seen = false;
  try { seen = sessionStorage.getItem('hmt-cosmos-seen') === '1'; } catch (e) { /* ignore */ }

  if (!force && (reduceMotion || seen || location.hash)) {
    root.remove();
    return;
  }

  /* ------------------------------------------------------------------
     TIMELINE (seconds)
     ------------------------------------------------------------------ */
  const T = {
    name: [6.0, 8.7],
    field: [9.0, 10.65],
    pillars: [10.9, 12.55],
    final: 12.75,
    glide: 13.75,
    arrive: 15.55,
    end: 16.2
  };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  function look(t) {
    // the "held breath": just before the name, nearly everything recedes except the light
    const dip = ss(4.6, 5.6, t) * (1 - 0.6 * ss(6.6, 10.5, t));
    return {
      fade: ss(0.0, 1.2, t),
      stars: Math.pow(ss(0.2, 5.0, t), 1.6) * (1 - 0.72 * dip),
      dust: ss(1.0, 5.5, t) * (1 - 0.5 * dip),
      rings: Math.pow(ss(2.4, 5.4, t), 1.5) * (1 - 0.72 * ss(4.8, 5.8, t) * (1 - 0.55 * ss(6.6, 11.5, t))),
      light: 0.07 * ss(2.0, 4.4, t) + 0.48 * ss(4.0, 7.2, t) + 0.4 * ss(7.2, 12.5, t) + 0.6 * ss(T.glide, T.glide + 1.8, t),
      warm: 0.8 * ss(11.0, T.glide + 1.4, t),
      roll: -0.018 + 0.03 * ss(0, 16, t)
    };
  }
  const speed = (t) => 2.2 + 1.2 * ss(5, 11, t) + 5.5 * ss(T.glide - 0.2, T.glide + 1.8, t);

  /* ------------------------------------------------------------------
     DOM / CUES
     ------------------------------------------------------------------ */
  const lines = {
    name: root.querySelector('[data-cue="name"]'),
    field: root.querySelector('[data-cue="field"]'),
    pillars: root.querySelector('[data-cue="pillars"]')
  };
  const axis = document.querySelector('.hero-axis-system');
  let finalEl = null;
  let gliding = false;
  let finished = false;

  if (freezeAt !== null) root.classList.add('is-frozen');
  try { history.scrollRestoration = 'manual'; } catch (e) { /* ignore */ }
  window.scrollTo(0, 0);
  body.classList.add('cosmos-playing');

  function placeFinal() {
    if (!finalEl || !axis) return;
    const r = axis.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    finalEl.style.left = r.left + 'px';
    finalEl.style.top = r.top + 'px';
    finalEl.style.width = r.width + 'px';
    finalEl.style.height = r.height + 'px';
    const dx = vw / 2 - (r.left + r.width / 2);
    const dy = vh * 0.57 - (r.top + r.height / 2);
    const s = Math.min(1.35, (vw * 0.9) / r.width);
    finalEl.style.setProperty('--fx', dx.toFixed(1) + 'px');
    finalEl.style.setProperty('--fy', dy.toFixed(1) + 'px');
    finalEl.style.setProperty('--fs', s.toFixed(3));
  }

  function showFinal() {
    if (!axis || finalEl) return;
    finalEl = axis.cloneNode(true);
    finalEl.classList.add('cosmos-final');
    finalEl.setAttribute('aria-hidden', 'true');
    root.appendChild(finalEl);
    placeFinal();
    void finalEl.offsetWidth; // commit start state before transitioning
    finalEl.classList.add('is-in');
  }

  function handoff() {
    if (gliding) return;
    gliding = true;
    try { sessionStorage.setItem('hmt-cosmos-seen', '1'); } catch (e) { /* ignore */ }
    if (finalEl) placeFinal();
    root.classList.add('handoff');
    body.classList.add('cosmos-handoff');
  }

  function arrive() {
    body.classList.add('cosmos-arrived');
    if (finalEl) finalEl.remove();
  }

  function teardown() {
    finished = true;
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    root.remove();
  }

  function skip() {
    if (finished) return;
    try { sessionStorage.setItem('hmt-cosmos-seen', '1'); } catch (e) { /* ignore */ }
    cues.forEach((c) => (c.done = true));
    root.classList.add('skipped');
    body.classList.add('cosmos-handoff', 'cosmos-arrived');
    finished = true;
    setTimeout(teardown, 1000);
  }

  const onKey = (e) => { if (e.key === 'Escape') skip(); };
  window.addEventListener('keydown', onKey);
  const skipBtn = document.getElementById('cosmos-skip');
  if (skipBtn) skipBtn.addEventListener('click', skip);

  const cue = (t, fn) => ({ t, fn, done: false });
  const cues = [
    cue(T.name[0], () => lines.name && lines.name.classList.add('is-in')),
    cue(T.name[1], () => lines.name && lines.name.classList.add('is-out')),
    cue(T.field[0], () => lines.field && lines.field.classList.add('is-in')),
    cue(T.field[1], () => lines.field && lines.field.classList.add('is-out')),
    cue(T.pillars[0], () => lines.pillars && lines.pillars.classList.add('is-in')),
    cue(T.pillars[1], () => lines.pillars && lines.pillars.classList.add('is-out')),
    cue(T.final, showFinal),
    cue(T.glide, handoff),
    cue(T.arrive, arrive),
    cue(T.end, teardown)
  ];
  function runCues(t) {
    for (const c of cues) {
      if (!c.done && t >= c.t) {
        // a frozen still shouldn't tear itself down
        if (freezeAt !== null && (c.fn === teardown || c.fn === arrive)) continue;
        c.done = true;
        c.fn();
      }
    }
  }

  function onResize() {
    resize();
    if (finalEl && !gliding) placeFinal();
  }
  window.addEventListener('resize', onResize);

  /* ------------------------------------------------------------------
     WEBGL
     ------------------------------------------------------------------ */
  const canvas = document.getElementById('cosmos-canvas');
  const gl = canvas && canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    premultipliedAlpha: false, powerPreference: 'high-performance'
  });

  const VS_QUAD = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const FS_SKY = `
precision highp float;
uniform vec2  uRes;
uniform vec2  uShift;
uniform float uTime, uCamZ, uLightZ, uFocal, uRoll;
uniform float uFade, uStars, uDust, uRings, uLight, uWarm, uLens;
uniform vec3  uNA, uUA, uVA, uNB, uUB, uVB;

float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2  h22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h12(i), h12(i + vec2(1., 0.)), f.x), mix(h12(i + vec2(0., 1.)), h12(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p){
  float s = 0., a = .5;
  for (int i = 0; i < 4; i++){ s += a * vnoise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + vec2(3.1, 1.7); a *= .5; }
  return s;
}

// one star per cell, power-law brightness, ~pixel-sized gaussian
vec3 stars(vec2 uv, float sc, float dens, float px, float seed){
  vec2 g = uv * sc; vec2 id = floor(g); vec2 f = fract(g);
  if (h12(id + seed) > dens) return vec3(0.);
  vec2 o = .2 + .6 * h22(id + seed * 1.37);
  float d = length(f - o) / sc;
  float b = pow(h12(id + seed + 7.7), 5.);
  float r = px * .8;
  vec3 c = mix(vec3(.72, .80, 1.), vec3(1., .90, .80), step(.84, h12(id + seed + 3.3)));
  return c * exp(-d * d / (r * r)) * (.05 + b * .95);
}

// orbital system: rings lying in a tilted plane through the light, true perspective
vec3 rings(vec3 ro, vec3 rd, vec3 C, vec3 n, vec3 u, vec3 v, float px, float sys){
  float dn = dot(rd, n);
  if (abs(dn) < 1e-4) return vec3(0.);
  float t = dot(C - ro, n) / dn;
  if (t <= 0.) return vec3(0.);
  vec3 hp = ro + rd * t; vec3 l = hp - C;
  float x = dot(l, u), y = dot(l, v);
  float rr = length(vec2(x, y));
  float th = atan(y, x);
  float fp = px / uFocal * t / max(abs(dn), .06);   // world-space footprint of one pixel (AA)
  float dens = 0.;
  for (int i = 0; i < 5; i++){
    float fi = float(i);
    float R = sys < .5 ? 6.5 + fi * 2.6 + fi * fi * 1.15 : 30. + fi * 3.6;
    float w = sys < .5 ? .07 + .07 * mod(fi * 3., 4.) : .3 + .22 * fi;
    float we = sqrt(w * w + fp * fp);
    float band = exp(-pow((rr - R) / we, 2.)) * w / we;
    float a = th - uTime * .11 * pow(6.5 / R, 1.5);      // Kepler-ish: inner orbits faster
    float clump = .3 + .7 * smoothstep(.25, .85, vnoise(vec2(cos(a), sin(a)) * R * .4 + fi * 13.7 + sys * 5.));
    dens += band * clump * (sys < .5 ? 1. : .4);
  }
  if (sys < .5) dens += exp(-pow((rr - 14.) / 7.5, 2.)) * (.45 + .55 * vnoise(vec2(rr * 2.4, 3.))) * .09;
  // lit by the central source: soft inverse-square + Henyey-Greenstein forward scatter
  float c = dot(normalize(l), normalize(ro - hp));
  float g = .35;
  float phase = (1. - g * g) / pow(1. + g * g - 2. * g * c, 1.5) * .25;
  float illum = 1. / (1. + pow(rr / 9., 2.));
  vec3 tint = mix(vec3(.62, .70, .82), vec3(.95, .82, .66), uWarm * .6);
  return tint * dens * illum * phase;
}

void main(){
  vec2 p  = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
  float px = 1. / uRes.y;
  vec2 pq = p - uShift;                          // lens space (vanishing point = light)
  float cr = cos(uRoll), sr = sin(uRoll);
  vec2 q  = mat2(cr, -sr, sr, cr) * pq;          // camera space (undo roll)
  float r = length(q);
  vec3 halo = mix(vec3(.56, .65, .80), vec3(1., .80, .58), uWarm);
  vec3 col = vec3(0.);

  // --- distant stars at infinity, faintly lensed by the mass at the light ---
  vec2 lq = q - uLens * uLens * q / max(dot(q, q), 1e-5);
  float lensMask = smoothstep(uLens * .6, uLens * 1.5, r);
  vec3 st = stars(lq, 70., .30, px, 1.) + stars(lq, 150., .22, px, 11.) * .7 + stars(lq, 320., .16, px, 23.) * .45;
  col += st * uStars * lensMask;

  // --- volumetric dust: two depths, magnifying as the camera advances ---
  float m1 = 90. / max(90. - uCamZ, 8.);
  float m2 = 260. / (260. - uCamZ);
  vec2 d1 = q / m1, d2 = q / m2;
  float n1 = fbm(d1 * 2.4 + vec2(7.3, 1.1));
  float n2 = fbm(d2 * 1.3 + vec2(-2., 5.) + vec2(uTime * .003, 0.));
  float fil = vnoise(d1 * 9. + n1 * 2.);
  float dust = smoothstep(.42, .95, n1) * (.55 + .45 * fil) * .65 + smoothstep(.38, 1., n2) * .55;
  float fall = .012 + .5 * exp(-r * 4.) + 1.3 * exp(-r * r * 60.);
  col += dust * uDust * (vec3(.40, .47, .58) * .05 + halo * fall * uLight * .32);

  // --- light shafts scattering through the dust ---
  vec2 cs = q / max(r, 1e-4);
  float rays = vnoise(cs * 4. + vec2(uTime * .015, 0.)) * vnoise(cs * 11. - vec2(0., uTime * .01));
  rays = pow(rays, 1.5) * exp(-r * 3.2) * smoothstep(0., .05, r);
  col += halo * rays * uLight * .22 * (.4 + .6 * dust);

  // --- orbital structures ---
  vec3 ro = vec3(0., 0., uCamZ);
  vec3 rd = normalize(vec3(q / uFocal, 1.));
  vec3 C  = vec3(0., 0., uLightZ);
  col += (rings(ro, rd, C, uNA, uUA, uVA, px, 0.) + rings(ro, rd, C, uNB, uUB, uVB, px, 1.)) * uRings * .2;

  // --- the light: core, bloom, lens diffusion, restrained anamorphic streak ---
  float depthL = max(uLightZ - uCamZ, 1.);
  float sz = .0032 * 150. / depthL;
  col += vec3(.94, .96, 1.) * uLight * 2.4 * exp(-r * r / (sz * sz));
  col += halo * uLight * (.5 * exp(-r * r / (sz * sz * 30.)) + .15 * exp(-r / .06) + .05 * exp(-r / .22));
  float ax = abs(pq.x), ay = abs(pq.y);
  col += mix(vec3(.55, .68, .90), halo, .4) * uLight * (.18 * exp(-ay / .0018) * exp(-ax / .32) + .045 * exp(-ay / .012) * exp(-ax / .15));

  // --- tone map, vignette, grain (also dithers the dark gradients) ---
  col *= uFade;
  col = 1. - exp(-col * 1.25);
  col *= 1. - .6 * smoothstep(.45, 1.15, length(p * vec2(.9, 1.)));
  float gr = h12(gl_FragCoord.xy + fract(uTime * 13.37) * 731.) - .5;
  col += gr * (.010 + .05 * dot(col, vec3(.333)));
  gl_FragColor = vec4(max(col, 0.), 1.);
}`;

  const VS_PTS = `
attribute vec4 aP;   // x, y, z0, seed
attribute vec3 aI;   // size, brightness, kind (0 star, 1 mote)
uniform vec2  uRes, uShift;
uniform float uCamZ, uFocal, uRoll, uTime, uDpr, uStars, uDust, uLight, uWarm, uFade;
varying vec3 vCol; varying float vA; varying float vSoft;
void main(){
  float kind  = aI.z;
  float range = kind < .5 ? 420. : 46.;
  float near  = kind < .5 ? 25. : .8;
  float z = near + mod(aP.z - uCamZ, range);
  vec2 xy = aP.xy;
  if (kind > .5) xy += vec2(sin(uTime * .05 + aP.w * 6.28), cos(uTime * .04 + aP.w * 4.)) * .25;
  vec2 s = uFocal * xy / z;
  float cr = cos(uRoll), sr = sin(uRoll);
  s = mat2(cr, sr, -sr, cr) * s + uShift;
  gl_Position = vec4(2. * s.x * uRes.y / uRes.x, 2. * s.y, 0., 1.);
  float u = (z - near) / range;
  float edge = smoothstep(1., .8, u) * smoothstep(0., .03, u);
  vec3 halo = mix(vec3(.56, .65, .80), vec3(1., .80, .58), uWarm);
  if (kind < .5){
    gl_PointSize = 2. * uDpr * (1. + aI.y * .8);
    vA = aI.y * clamp(120. / z, .2, 1.6) * edge * uStars;
    vCol = mix(vec3(.75, .82, 1.), vec3(1., .90, .80), step(.85, aP.w));
    vSoft = 0.;
  } else {
    float proj = uFocal * aI.x / z * uRes.y;
    float coc  = abs(1. / z - 1. / 16.) * 55. * uDpr;     // depth of field
    float size = clamp(proj + coc, 1.5 * uDpr, 70. * uDpr);
    gl_PointSize = size;
    float energy = min((proj * proj + 2. * uDpr) / (size * size) * 2., 1.);
    float lit = .18 + uLight * 1.2 * exp(-length(s - uShift) * 2.5);
    vA = aI.y * edge * uDust * energy * smoothstep(.8, 2.5, z);
    vCol = mix(vec3(.55, .62, .74), halo, .6) * lit;
    vSoft = smoothstep(3. * uDpr, 10. * uDpr, size);
  }
  vA *= uFade;
}`;

  const FS_PTS = `
precision mediump float;
varying vec3 vCol; varying float vA; varying float vSoft;
void main(){
  float d = length(gl_PointCoord - .5) * 2.;
  if (d > 1.) discard;
  float star  = exp(-d * d * 5.);
  float bokeh = smoothstep(1., .75, d) * (.75 + .25 * smoothstep(.4, .95, d));
  gl_FragColor = vec4(vCol * vA * mix(star, bokeh, vSoft), 1.);
}`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[cosmos] shader:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  function program(vs, fs) {
    const v = compile(gl.VERTEX_SHADER, vs), f = compile(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn('[cosmos] link:', gl.getProgramInfoLog(p)); return null; }
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    return { p, u };
  }

  let sky = null, pts = null, quadBuf = null, ptBufP = null, ptBufI = null, ptCount = 0;
  const FOCAL = 1.2, LIGHT_Z = 150, SHIFT = [0, 0.1];

  function basis(incDeg, rotDeg) {
    const i = incDeg * Math.PI / 180, f = rotDeg * Math.PI / 180;
    const rz = (v) => [v[0] * Math.cos(f) - v[1] * Math.sin(f), v[0] * Math.sin(f) + v[1] * Math.cos(f), v[2]];
    const n = rz([0, Math.sin(i), -Math.cos(i)]);
    const u = rz([1, 0, 0]);
    const v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
    return { n, u, v };
  }
  const SYS_A = basis(74, -9);
  const SYS_B = basis(81, 13);

  function buildPoints() {
    const small = window.innerWidth < 760;
    const nStars = small ? 900 : 1700;
    const nMotes = small ? 90 : 150;
    ptCount = nStars + nMotes;
    const P = new Float32Array(ptCount * 4), I = new Float32Array(ptCount * 3);
    for (let k = 0; k < ptCount; k++) {
      const mote = k >= nStars;
      const range = mote ? 46 : 420, near = mote ? 0.8 : 25;
      const z0 = Math.random() * range, z = near + z0;
      const hx = z / FOCAL, lerpY = -0.62 + Math.random() * 1.04;
      P[k * 4] = (Math.random() * 2 - 1) * hx;
      P[k * 4 + 1] = lerpY * hx;
      P[k * 4 + 2] = z0;
      P[k * 4 + 3] = Math.random();
      if (mote) {
        I[k * 3] = 0.015 + Math.random() * 0.03;
        I[k * 3 + 1] = 0.25 + Math.random() * 0.6;
        I[k * 3 + 2] = 1;
      } else {
        I[k * 3] = 0;
        I[k * 3 + 1] = 0.04 + Math.pow(Math.random(), 6) * 1.3;
        I[k * 3 + 2] = 0;
      }
    }
    ptBufP = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ptBufP); gl.bufferData(gl.ARRAY_BUFFER, P, gl.STATIC_DRAW);
    ptBufI = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ptBufI); gl.bufferData(gl.ARRAY_BUFFER, I, gl.STATIC_DRAW);
  }

  let quality = 1, dprEff = 1;
  function resize() {
    if (!gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = window.innerWidth * dpr * quality, h = window.innerHeight * dpr * quality;
    const cap = 2.4e6;
    if (w * h > cap) { const k = Math.sqrt(cap / (w * h)); w *= k; h *= k; }
    canvas.width = Math.max(2, Math.round(w));
    canvas.height = Math.max(2, Math.round(h));
    dprEff = canvas.width / window.innerWidth;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  let glOK = false;
  if (gl) {
    sky = program(VS_QUAD, FS_SKY);
    pts = program(VS_PTS, FS_PTS);
    glOK = !!(sky && pts);
  }
  if (glOK) {
    quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    buildPoints();
    resize();
  } else {
    root.classList.add('no-gl');
  }

  function draw(t, camZ) {
    const L = look(t);
    const lens = (0.010 + 0.016 * ss(3, 10, t)) * LIGHT_Z / Math.max(LIGHT_Z - camZ, 1);

    gl.disable(gl.BLEND);
    gl.useProgram(sky.p);
    const u = sky.u;
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform2f(u.uShift, SHIFT[0], SHIFT[1]);
    gl.uniform1f(u.uTime, t);
    gl.uniform1f(u.uCamZ, camZ);
    gl.uniform1f(u.uLightZ, LIGHT_Z);
    gl.uniform1f(u.uFocal, FOCAL);
    gl.uniform1f(u.uRoll, L.roll);
    gl.uniform1f(u.uFade, L.fade);
    gl.uniform1f(u.uStars, L.stars);
    gl.uniform1f(u.uDust, L.dust);
    gl.uniform1f(u.uRings, L.rings);
    gl.uniform1f(u.uLight, L.light);
    gl.uniform1f(u.uWarm, L.warm);
    gl.uniform1f(u.uLens, lens);
    gl.uniform3fv(u.uNA, SYS_A.n); gl.uniform3fv(u.uUA, SYS_A.u); gl.uniform3fv(u.uVA, SYS_A.v);
    gl.uniform3fv(u.uNB, SYS_B.n); gl.uniform3fv(u.uUB, SYS_B.u); gl.uniform3fv(u.uVB, SYS_B.v);
    const aPos = gl.getAttribLocation(sky.p, 'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(aPos);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(pts.p);
    const v = pts.u;
    gl.uniform2f(v.uRes, canvas.width, canvas.height);
    gl.uniform2f(v.uShift, SHIFT[0], SHIFT[1]);
    gl.uniform1f(v.uCamZ, camZ);
    gl.uniform1f(v.uFocal, FOCAL);
    gl.uniform1f(v.uRoll, L.roll);
    gl.uniform1f(v.uTime, t);
    gl.uniform1f(v.uDpr, dprEff);
    gl.uniform1f(v.uStars, L.stars);
    gl.uniform1f(v.uDust, L.dust);
    gl.uniform1f(v.uLight, L.light);
    gl.uniform1f(v.uWarm, L.warm);
    gl.uniform1f(v.uFade, L.fade);
    const aP = gl.getAttribLocation(pts.p, 'aP'), aI = gl.getAttribLocation(pts.p, 'aI');
    gl.bindBuffer(gl.ARRAY_BUFFER, ptBufP); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, ptBufI); gl.enableVertexAttribArray(aI); gl.vertexAttribPointer(aI, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, ptCount);
    gl.disableVertexAttribArray(aP); gl.disableVertexAttribArray(aI);
  }

  /* ------------------------------------------------------------------
     LOOP — accumulated clock (pauses with the tab, never jumps)
     ------------------------------------------------------------------ */
  let t = 0, camZ = 0, last = null;
  let perfN = 0, perfSum = 0;

  if (freezeAt !== null) {
    for (let s = 0; s < freezeAt; s += 0.01) camZ += speed(s) * 0.01;
    t = freezeAt;
  }

  function frame(now) {
    if (finished && !root.isConnected) return;
    const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05);
    last = now;
    if (freezeAt === null) { t += dt; camZ += speed(t) * dt; }

    runCues(t);
    if (glOK) {
      draw(t, camZ);
      // adaptive resolution: if the GPU struggles early on, render fewer pixels
      if (freezeAt === null && perfN < 90 && dt > 0) {
        perfN++; perfSum += dt;
        if (perfN === 45 && perfSum / perfN > 0.024 && quality > 0.55) {
          quality *= 0.72; resize(); perfN = 0; perfSum = 0;
        }
      }
    }
    if (root.isConnected) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
