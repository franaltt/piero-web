// Física de las herramientas colgando: cada una es un punto atado a un hilo
// (integración de Verlet). Se balancean, reaccionan al cursor y se arrastran.

const ANCHORS_DESKTOP = [
  // fx: posición del anclaje (fracción del ancho) · fl: largo del hilo (fracción del alto)
  { fx: .05, fl: .10 }, { fx: .14, fl: .30 }, { fx: .23, fl: .16 }, { fx: .32, fl: .42 },
  { fx: .41, fl: .22 }, { fx: .50, fl: .12 }, { fx: .59, fl: .26 }, { fx: .68, fl: .44 },
  { fx: .77, fl: .18 }, { fx: .86, fl: .34 }, { fx: .95, fl: .12 },
];
const ANCHORS_MOBILE = [
  { fx: .05, fl: .10 }, { fx: .14, fl: .30 }, { fx: .23, fl: .50 }, { fx: .32, fl: .16 },
  { fx: .41, fl: .36 }, { fx: .50, fl: .08 }, { fx: .59, fl: .28 }, { fx: .68, fl: .48 },
  { fx: .77, fl: .14 }, { fx: .86, fl: .34 }, { fx: .95, fl: .06 },
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;

export function createHanging({ stage, canvas, tileEls, avoidEl, reducedMotion }) {
  const ctx = canvas.getContext('2d');
  const tiles = tileEls.map((el, i) => ({
    el, x: 0, y: 0, px: 0, py: 0, ax: 0, L: 100, rot: 0, drag: false, elastic: 0,
    // cada una se balancea a su ritmo
    ph: i * 1.7 + Math.random() * 2, sp: .8 + Math.random() * .45,
  }));
  let started = false, t0 = performance.now();
  const ptr = { x: -9999, y: -9999, vx: 0, vy: 0, inside: false };
  let W = 0, H = 0, S = 72, mobile = false, raf = 0, visible = true, dragT = null;
  const dragOff = { x: 0, y: 0 };

  function layout(first) {
    const r = stage.getBoundingClientRect();
    W = r.width; H = r.height; mobile = window.innerWidth < 760;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = mobile ? 40 : W < 1100 ? 60 : 70;
    const A = mobile ? ANCHORS_MOBILE : ANCHORS_DESKTOP;
    const topPad = mobile ? 64 : 74;

    // El texto manda: ningún hilo baja hasta tapar el bloque de texto si está dentro del escenario.
    let box = null;
    if (avoidEl) {
      // arriba: donde empieza el bloque; a lo ancho: solo lo que ocupa el texto de verdad
      const c = avoidEl.getBoundingClientRect();
      const parts = [...avoidEl.querySelectorAll('[data-avoid]')].map((el) => el.getBoundingClientRect());
      if (c.top < r.bottom - 10 && parts.length) {
        box = {
          top: Math.min(...parts.map((p) => p.top)) - r.top,
          left: Math.min(...parts.map((p) => p.left)) - r.left,
          right: Math.max(...parts.map((p) => p.right)) - r.left,
        };
      }
    }

    tiles.forEach((t, i) => {
      t.el.style.setProperty('--s', S + 'px');
      t.ax = A[i % A.length].fx * W;
      let L = topPad + A[i % A.length].fl * (mobile ? H - topPad - S : H);
      if (box && t.ax > box.left - S && t.ax < box.right + S) L = Math.min(L, box.top - 28 - S);
      t.L = Math.max(topPad - 8, L);
      if (first) {
        // esperan arriba, fuera de pantalla, hasta que termina la carga
        t.x = t.px = t.ax + (Math.random() - .5) * 160;
        t.y = t.py = -S - 60 - Math.random() * 220;
        if (reducedMotion) { t.x = t.px = t.ax; t.y = t.py = t.L; }
      }
    });
  }

  function step() {
    const G = .55, DAMP = .982, R = mobile ? 80 : 130;
    const now = performance.now() - t0;
    tiles.forEach((t) => {
      if (!t.drag) {
        const vx = (t.x - t.px) * DAMP, vy = (t.y - t.py) * DAMP;
        t.px = t.x; t.py = t.y;
        // viento suave: se balancean solas
        const wind = Math.sin(now * .0011 * t.sp + t.ph) * .07 + Math.sin(now * .0027 * t.sp + t.ph * 2) * .025;
        t.x += vx + wind; t.y += vy + G;
        if (ptr.inside && !dragT) {
          const dx = t.x - ptr.x, dy = t.y + S * .5 - ptr.y, d = Math.hypot(dx, dy) || 1;
          if (d < R) {
            const k = 1 - d / R;
            t.x += clamp(ptr.vx, -40, 40) * .2 * k + (dx / d) * .9 * k;
            t.y += clamp(ptr.vy, -40, 40) * .1 * k;
          }
        }
      } else { t.px = mix(t.px, t.x, .5); t.py = mix(t.py, t.y, .5); }

      // hilo: mientras la agarrás se estira; al soltarla vuelve como un elástico
      const dx = t.x - t.ax, dy = t.y, d = Math.hypot(dx, dy) || 1;
      if (t.drag) {
        const max = t.L * 2.4 + 120;
        if (d > max) { t.x = t.ax + (dx / d) * max; t.y = (dy / d) * max; }
      } else if (d > t.L) {
        const k = mix(.55, .045, t.elastic);
        const over = d - t.L;
        t.x -= (dx / d) * over * k; t.y -= (dy / d) * over * k;
      }
      t.elastic *= .975;
      t.rot = mix(t.rot, (Math.atan2(-(t.x - t.ax), t.y) * 180) / Math.PI, .3);
    });
    ptr.vx *= .6; ptr.vy *= .6;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    tiles.forEach((t) => {
      const stretch = Math.max(0, Math.hypot(t.x - t.ax, t.y) / t.L - 1);
      ctx.lineWidth = Math.max(.5, 1.1 - stretch * .45);
      ctx.strokeStyle = `rgba(12,12,13,${Math.max(.18, .36 - stretch * .12)})`;
      ctx.beginPath(); ctx.moveTo(t.ax, 0); ctx.lineTo(t.x, t.y); ctx.stroke();
    });
    tiles.forEach((t) => {
      t.el.style.transform = `translate3d(${t.x - S / 2}px, ${t.y}px, 0) rotate(${t.rot}deg)`;
    });
  }

  function loop() {
    if (visible && (started || reducedMotion)) { if (!reducedMotion) step(); draw(); }
    raf = requestAnimationFrame(loop);
  }

  // cursor y arrastre
  const local = (e) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onMove = (e) => {
    const p = local(e);
    ptr.vx = p.x - ptr.x; ptr.vy = p.y - ptr.y; ptr.x = p.x; ptr.y = p.y; ptr.inside = true;
    if (dragT) { dragT.x = p.x - dragOff.x; dragT.y = p.y - dragOff.y; }
  };
  const onLeave = () => { ptr.inside = false; };
  const onUp = () => { if (dragT) { dragT.drag = false; dragT.elastic = 1; dragT = null; } };
  const downs = tiles.map((t) => {
    const fn = (e) => {
      const p = local(e);
      dragT = t; t.drag = true;
      dragOff.x = p.x - t.x; dragOff.y = p.y - t.y;
      try { t.el.setPointerCapture(e.pointerId); } catch (_) { /* nada */ }
      e.preventDefault();
    };
    const tmove = (e) => { if (dragT === t) { const p = local(e); t.x = p.x - dragOff.x; t.y = p.y - dragOff.y; } };
    const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.px = t.x - 14; } };
    t.el.addEventListener('pointerdown', fn);
    t.el.addEventListener('pointermove', tmove);
    t.el.addEventListener('pointerup', onUp);
    t.el.addEventListener('pointercancel', onUp);
    t.el.addEventListener('keydown', key);
    return { t, fn, tmove, key };
  });
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerleave', onLeave);
  window.addEventListener('pointerup', onUp);

  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; });
  io.observe(stage);
  let rT = 0;
  const onResize = () => { clearTimeout(rT); rT = setTimeout(() => layout(false), 120); };
  window.addEventListener('resize', onResize);

  layout(true);
  draw();
  raf = requestAnimationFrame(loop);
  let kick = 0;
  if (reducedMotion) started = true;

  return {
    relayout: () => layout(false),
    // las suelta desde arriba, una detrás de otra
    start() {
      if (started) return;
      tiles.forEach((t, i) => { t.y = t.py = -S - 40 - i * 26; t.elastic = .6; });
      started = true; t0 = performance.now();
      draw();
      kick = setTimeout(() => tiles.forEach((t, i) => { t.px = t.x + (i % 2 ? 7 : -7); }), 1100);
    },
    destroy() {
      cancelAnimationFrame(raf); clearTimeout(kick); clearTimeout(rT);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      downs.forEach(({ t, fn, tmove, key }) => {
        t.el.removeEventListener('pointerdown', fn);
        t.el.removeEventListener('pointermove', tmove);
        t.el.removeEventListener('pointerup', onUp);
        t.el.removeEventListener('pointercancel', onUp);
        t.el.removeEventListener('keydown', key);
      });
    },
  };
}
