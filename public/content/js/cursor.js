/* =========================================================
   Cursor "Cometa de tinta"  ·  v2
   - Rastro em fita suave (curvas), que afina na cauda e engrossa com a velocidade
   - Halo luminoso na cabeça do rastro
   - Anel com física de mola: estica, quica e assenta como líquido
   - Faíscas com brilho (cintilam) e rastro curto
   - Clique solta ondas duplas, flash suave e partículas
   - Cresce em links, mostra rótulo (data-cursor) e é magnético em botões
   - Cores vêm do cores.css (--accent-rgb e --accent-2-rgb)
   Só ativa em dispositivos com mouse e respeita "reduzir movimento".
   ========================================================= */
(() => {
  'use strict';

  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasMouse || reduceMotion) return;

  const root = document.documentElement;
  const body = document.body;

  // ----- Cores (lidas do CSS) -----
  const readRGB = (name, fallback) => {
    const v = getComputedStyle(root).getPropertyValue(name).trim().replace(/\s+/g, '');
    return /^\d{1,3},\d{1,3},\d{1,3}$/.test(v) ? v : fallback;
  };
  const C1 = readRGB('--accent-rgb', '11,78,162');     // azul principal
  const C2 = readRGB('--accent-2-rgb', '91,155,240');  // azul claro
  const SPARK_COLORS = [C1, C2, C2];

  // ----- Elementos -----
  const make = (tag, cls) => {
    const el = document.createElement(tag);
    el.className = cls;
    el.setAttribute('aria-hidden', 'true');
    body.appendChild(el);
    return el;
  };

  const glow = make('div', 'cursor-glow');
  const canvas = make('canvas', 'cursor-trail');
  const ring = make('div', 'cursor-ring is-away');
  const shape = document.createElement('span');
  shape.className = 'cursor-ring__shape';
  const label = document.createElement('span');
  label.className = 'cursor-ring__label';
  ring.append(shape, label);
  const dot = make('div', 'cursor-dot is-away');

  root.classList.add('has-cursor');

  // ----- Canvas -----
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  // ----- Estado -----
  const mouse = { x: -200, y: -200 };
  const head = { x: -200, y: -200 };
  const prevHead = { x: -200, y: -200 };
  const ringPos = { x: -200, y: -200, vx: 0, vy: 0 };
  const ringShape = { stretch: 1, angle: 0 };
  let seen = false;
  let hoverEl = null;
  let magnet = null;
  let last = performance.now();
  let canvasClean = true;
  let headSpeed = 0;

  const TRAIL_LIFE = 520;        // ms que a fita permanece
  const MAX_WIDTH = 13;          // largura máxima da fita (px)
  const MAX_PARTICLES = 220;
  const trail = [];
  const particles = [];
  const ripples = [];

  const MAGNETIC = '.button, .nav-cta, .menu-toggle';
  const INTERACTIVE = 'a, button, [data-cursor]';

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const angleDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

  // ----- Hover / magnetismo -----
  const clearMagnet = () => {
    if (!magnet) return;
    magnet.el.style.removeProperty('--tx');
    magnet.el.style.removeProperty('--ty');
    magnet = null;
  };

  const setHover = (el) => {
    if (el === hoverEl) return;
    clearMagnet();
    hoverEl = el;
    const text = el && el.dataset ? el.dataset.cursor : '';
    ring.classList.toggle('is-link', !!el && !text);
    ring.classList.toggle('is-label', !!text);
    dot.classList.toggle('is-hidden', !!text);
    label.textContent = text || '';
    if (el && el.matches(MAGNETIC)) magnet = { el, tx: 0, ty: 0 };
  };

  const refreshHover = () => {
    const el = document.elementFromPoint(mouse.x, mouse.y);
    setHover(el ? el.closest(INTERACTIVE) : null);
  };

  // ----- Partículas -----
  const pushParticle = (p) => {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    particles.push(p);
  };

  const spawnSpark = () => {
    const a = Math.random() * Math.PI * 2;
    const s = rand(.3, 1.1);
    pushParticle({
      x: head.x, y: head.y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s + .12,
      t: performance.now(),
      life: rand(560, 940),
      size: rand(.9, 2.1),
      color: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
      phase: Math.random() * 6.28,
      drag: .985,
    });
  };

  const burst = (x, y) => {
    const now = performance.now();
    ripples.push({ x, y, t: now, life: 700, delay: 0, max: 74 });
    ripples.push({ x, y, t: now, life: 820, delay: 90, max: 118 });
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + Math.random() * .3;
      const s = rand(1.8, 4.6);
      pushParticle({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        t: now,
        life: rand(560, 980),
        size: rand(1.2, 2.8),
        color: i % 2 ? C1 : C2,
        phase: Math.random() * 6.28,
        drag: .93,
        streak: true,
      });
    }
  };

  // ----- Desenho -----
  const drawRibbon = (pts, widthScale, alpha) => {
    const n = pts.length;
    const left = [];
    const right = [];
    for (let i = 0; i < n; i++) {
      const p = pts[Math.max(0, i - 1)];
      const q = pts[Math.min(n - 1, i + 1)];
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const k = i / (n - 1);
      const w = (MAX_WIDTH * widthScale * pts[i].s * Math.pow(k, 1.25)) / 2;
      left.push([pts[i].x + nx * w, pts[i].y + ny * w]);
      right.push([pts[i].x - nx * w, pts[i].y - ny * w]);
    }
    const a = pts[0];
    const b = pts[n - 1];
    if (Math.hypot(b.x - a.x, b.y - a.y) < 2) return;

    const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    g.addColorStop(0, `rgba(${C2},0)`);
    g.addColorStop(.55, `rgba(${C2},${alpha * .6})`);
    g.addColorStop(1, `rgba(${C1},${alpha})`);
    ctx.fillStyle = g;

    // bordas suavizadas por curvas quadráticas entre pontos médios
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < n - 1; i++) {
      ctx.quadraticCurveTo(left[i][0], left[i][1], (left[i][0] + left[i + 1][0]) / 2, (left[i][1] + left[i + 1][1]) / 2);
    }
    ctx.lineTo(left[n - 1][0], left[n - 1][1]);
    ctx.lineTo(right[n - 1][0], right[n - 1][1]);
    for (let i = n - 2; i > 0; i--) {
      ctx.quadraticCurveTo(right[i][0], right[i][1], (right[i][0] + right[i - 1][0]) / 2, (right[i][1] + right[i - 1][1]) / 2);
    }
    ctx.lineTo(right[0][0], right[0][1]);
    ctx.closePath();
    ctx.fill();
  };

  const drawHalo = () => {
    const alpha = .1 + Math.min(headSpeed / 45, .16);
    const r = 30 + Math.min(headSpeed, 18);
    const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, r);
    g.addColorStop(0, `rgba(${C1},${alpha})`);
    g.addColorStop(.5, `rgba(${C2},${alpha * .35})`);
    g.addColorStop(1, `rgba(${C2},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(head.x, head.y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (now, dt) => {
    const busy = trail.length || particles.length || ripples.length;
    if (!busy && canvasClean) return;
    ctx.clearRect(0, 0, W, H);
    canvasClean = !busy;
    if (!seen) return;

    // Sem rastro em cima de elementos com data-cursor (ex.: foto)
    const overDataCursor = hoverEl && hoverEl.hasAttribute('data-cursor');
    if (!overDataCursor) {
      const lastPt = trail[trail.length - 1];
      if (!lastPt || Math.hypot(head.x - lastPt.x, head.y - lastPt.y) > .6) {
        trail.push({ x: head.x, y: head.y, t: now, s: clamp(.55 + headSpeed / 26, .55, 1.15) });
      }
    } else if (trail.length) {
      trail.shift();
    }

    while (trail.length && now - trail[0].t > TRAIL_LIFE) trail.shift();
    if (trail.length > 3) {
      drawRibbon(trail, 2.6, .14); // halo suave
      drawRibbon(trail, 1, .85);   // núcleo
    }
    if (!overDataCursor && trail.length > 1) drawHalo();

    // ondas de clique
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      const age = (now - r.t - r.delay) / r.life;
      if (age >= 1) { ripples.splice(i, 1); continue; }
      if (age < 0) continue;
      const ease = 1 - Math.pow(1 - age, 3);
      const radius = 8 + ease * r.max;
      const fill = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, radius);
      fill.addColorStop(0, `rgba(${C2},0)`);
      fill.addColorStop(1, `rgba(${C2},${(1 - age) * .12})`);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${C1},${(1 - age) * .65})`;
      ctx.lineWidth = 1.6 * (1 - age * .5);
      ctx.stroke();
    }

    // partículas
    ctx.lineCap = 'round';
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const age = (now - p.t) / p.life;
      if (age >= 1) { particles.splice(i, 1); continue; }
      const drag = Math.pow(p.drag, dt);
      p.vx *= drag; p.vy *= drag;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const twinkle = .75 + .25 * Math.sin(now * .018 + p.phase);
      const alpha = (1 - age) * twinkle;
      const size = p.size * (1 - age * .55);
      if (p.streak) {
        ctx.strokeStyle = `rgba(${p.color},${alpha * .8})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      // brilho + núcleo
      ctx.fillStyle = `rgba(${p.color},${alpha * .18})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${p.color},${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // ----- Loop -----
  const frame = (now) => {
    requestAnimationFrame(frame);
    const dt = clamp((now - last) / 16.667, .2, 3); // 1 = 60 fps
    last = now;

    // cabeça da fita segue o mouse de perto
    const follow = 1 - Math.pow(.5, dt);
    head.x += (mouse.x - head.x) * follow;
    head.y += (mouse.y - head.y) * follow;

    const speed = Math.hypot(head.x - prevHead.x, head.y - prevHead.y) / dt;
    headSpeed += (speed - headSpeed) * .25;
    if (seen && speed > 7 && Math.random() < .55) spawnSpark();
    prevHead.x = head.x;
    prevHead.y = head.y;

    // alvo do anel (magnético em botões)
    let tx = mouse.x;
    let ty = mouse.y;
    if (magnet) {
      const r = magnet.el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - magnet.tx;
      const cy = r.top + r.height / 2 - magnet.ty;
      magnet.tx = clamp((mouse.x - cx) * .22, -10, 10);
      magnet.ty = clamp((mouse.y - cy) * .3, -8, 8);
      magnet.el.style.setProperty('--tx', magnet.tx + 'px');
      magnet.el.style.setProperty('--ty', magnet.ty + 'px');
      tx = cx + magnet.tx + (mouse.x - cx) * .35;
      ty = cy + magnet.ty + (mouse.y - cy) * .35;
    }

    // anel com física de mola (leve overshoot, efeito líquido)
    const K = .14;       // força da mola
    const DAMP = .68;    // atrito por frame (menor = mais firme)
    ringPos.vx += (tx - ringPos.x) * K * dt;
    ringPos.vy += (ty - ringPos.y) * K * dt;
    const damp = Math.pow(DAMP, dt);
    ringPos.vx *= damp;
    ringPos.vy *= damp;
    ringPos.x += ringPos.vx * dt;
    ringPos.y += ringPos.vy * dt;

    // o anel nunca se descola da bolinha
    const maxLag = 24;
    const lx = ringPos.x - tx;
    const ly = ringPos.y - ty;
    const lagDist = Math.hypot(lx, ly);
    if (lagDist > maxLag) {
      ringPos.x = tx + (lx / lagDist) * maxLag;
      ringPos.y = ty + (ly / lagDist) * maxLag;
    }

    // estica na direção do movimento, com suavização (sem tremer)
    const ringSpeed = Math.hypot(ringPos.vx, ringPos.vy);
    const targetStretch = hoverEl ? 1 : 1 + Math.min(ringSpeed / 22, .6);
    ringShape.stretch += (targetStretch - ringShape.stretch) * Math.min(.2 * dt, 1);
    if (ringSpeed > .5) {
      const target = Math.atan2(ringPos.vy, ringPos.vx);
      ringShape.angle += angleDiff(target, ringShape.angle) * Math.min(.25 * dt, 1);
    }
    const sx = ringShape.stretch;
    shape.style.transform = `rotate(${ringShape.angle}rad) scale(${sx}, ${1 / Math.sqrt(sx)})`;

    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
    glow.style.setProperty('--mx', head.x + 'px');
    glow.style.setProperty('--my', head.y + 'px');

    draw(now, dt);
  };

  // ----- Eventos -----
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!seen) {
      seen = true;
      head.x = ringPos.x = prevHead.x = mouse.x;
      head.y = ringPos.y = prevHead.y = mouse.y;
      ring.classList.remove('is-away');
      dot.classList.remove('is-away');
    }
    setHover(e.target.closest ? e.target.closest(INTERACTIVE) : null);
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    ring.classList.add('is-down');
    burst(e.clientX, e.clientY);
  });
  window.addEventListener('pointerup', () => ring.classList.remove('is-down'));

  window.addEventListener('scroll', () => { if (seen) refreshHover(); }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { trail.length = 0; particles.length = 0; ripples.length = 0; }
    last = performance.now();
  });

  document.addEventListener('mouseleave', () => {
    ring.classList.add('is-away');
    dot.classList.add('is-away');
    setHover(null);
  });
  document.addEventListener('mouseenter', () => {
    if (!seen) return;
    ring.classList.remove('is-away');
    dot.classList.remove('is-away');
  });

  requestAnimationFrame(frame);
})();