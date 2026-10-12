/* =========================================================
   Cursor "Cometa de tinta"
   - Rastro em fita que afina na cauda, com faíscas ao mover rápido
   - A grade de pontos do fundo acende em volta do cursor
   - Anel líquido: estica na direção do movimento e mantém a bolinha dentro
   - Cresce em links, mostra rótulo (data-cursor) e é magnético em botões
   - Clique solta uma onda e uma explosão de partículas
   Só ativa em dispositivos com mouse e respeita "reduzir movimento".
   ========================================================= */
(() => {
  'use strict';

  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasMouse || reduceMotion) return;

  const root = document.documentElement;
  const body = document.body;

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
  const ringPos = { x: -200, y: -200 };
  const prevHead = { x: -200, y: -200 };
  let seen = false;
  let hoverEl = null;
  let magnet = null;

  const TRAIL_LIFE = 460;        // ms que a fita permanece
  const MAX_WIDTH = 13;          // largura máxima da fita (px)
  const trail = [];
  const particles = [];
  const ripples = [];

  const LIME = '199,255,94';
  const MAGNETIC = '.button, .nav-cta, .menu-toggle';
  const INTERACTIVE = 'a, button, [data-cursor]';

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

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
  const spawnSpark = () => {
    const a = Math.random() * Math.PI * 2;
    particles.push({
      x: head.x, y: head.y,
      vx: Math.cos(a) * (.3 + Math.random() * .8),
      vy: Math.sin(a) * (.3 + Math.random() * .8) + .15,
      t: performance.now(),
      life: 520 + Math.random() * 300,
      size: .8 + Math.random() * 1.6,
      color: Math.random() < .35 ? '255,255,255' : LIME,
    });
  };

  const burst = (x, y) => {
    const now = performance.now();
    ripples.push({ x, y, t: now, life: 650 });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.random() * .4;
      const s = 2 + Math.random() * 3.2;
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        t: now,
        life: 520 + Math.random() * 380,
        size: 1.2 + Math.random() * 2.2,
        color: i % 3 === 0 ? '255,255,255' : LIME,
        drag: .93,
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
      const w = (MAX_WIDTH * widthScale * Math.pow(k, 1.35)) / 2;
      left.push([pts[i].x + nx * w, pts[i].y + ny * w]);
      right.push([pts[i].x - nx * w, pts[i].y - ny * w]);
    }
    const a = pts[0];
    const b = pts[n - 1];
    if (Math.hypot(b.x - a.x, b.y - a.y) < 2) return;

    const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    g.addColorStop(0, `rgba(${LIME},0)`);
    g.addColorStop(1, `rgba(${LIME},${alpha})`);
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();
    ctx.fill();
  };

  const draw = (now) => {
    ctx.clearRect(0, 0, W, H);
    if (!seen) return;

    // Remove o rastro se estiver em cima da foto ou dos cards com data-cursor
    const isOverDataCursor = hoverEl && hoverEl.hasAttribute('data-cursor');
    if (!isOverDataCursor) {
      trail.push({ x: head.x, y: head.y, t: now });
    } else {
      if (trail.length > 0) trail.shift();
    }

    while (trail.length && now - trail[0].t > TRAIL_LIFE) trail.shift();
    if (trail.length > 2) {
      drawRibbon(trail, 2.6, .16); // halo suave
      drawRibbon(trail, 1, .9);    // núcleo
    }

    // ondas de clique
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      const age = (now - r.t) / r.life;
      if (age >= 1) { ripples.splice(i, 1); continue; }
      const ease = 1 - Math.pow(1 - age, 3);
      ctx.beginPath();
      ctx.arc(r.x, r.y, 8 + ease * 70, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${LIME},${(1 - age) * .7})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const age = (now - p.t) / p.life;
      if (age >= 1) { particles.splice(i, 1); continue; }
      const drag = p.drag || .985;
      p.vx *= drag; p.vy *= drag;
      p.x += p.vx; p.y += p.vy;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - age * .6), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${1 - age})`;
      ctx.fill();
    }
  };

  // ----- Loop -----
  const frame = (now) => {
    requestAnimationFrame(frame);

    // cabeça da fita segue o mouse de perto
    head.x += (mouse.x - head.x) * .5;
    head.y += (mouse.y - head.y) * .5;

    const speed = Math.hypot(head.x - prevHead.x, head.y - prevHead.y);
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

    // --- Garante que a bolinha maior (anel) nunca se descole da menor (dot) ---
    const maxLag = 22; // Distância limite para o anel não desgrudar do mouse
    const dxPos = tx - ringPos.x;
    const dyPos = ty - ringPos.y;
    const distPos = Math.hypot(dxPos, dyPos);

    if (distPos > maxLag) {
      ringPos.x = tx - (dxPos / distPos) * maxLag;
      ringPos.y = ty - (dyPos / distPos) * maxLag;
    } else {
      ringPos.x += dxPos * .35;
      ringPos.y += dyPos * .35;
    }

    // anel líquido: estica na direção do movimento
    const dx = tx - ringPos.x;
    const dy = ty - ringPos.y;
    const lag = Math.hypot(dx, dy);
    const stretch = hoverEl ? 1 : 1 + Math.min(lag / 80, .55);
    const angle = Math.atan2(dy, dx);
    shape.style.transform = `rotate(${angle}rad) scale(${stretch}, ${1 / Math.sqrt(stretch)})`;

    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
    glow.style.setProperty('--mx', head.x + 'px');
    glow.style.setProperty('--my', head.y + 'px');

    draw(now);
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