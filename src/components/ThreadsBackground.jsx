import { useEffect, useRef } from 'react';

// Fondo de toda la página: hilos finos que cuelgan, se mecen con el scroll (como viento)
// y se apartan del mouse. Por algunos bajan piecitas, como contenido que va llegando.
// No se ve en el inicio (ahí ya están las herramientas colgando).
export default function ThreadsBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dpr = 1, threads = [], raf = 0;
    let lastY = window.scrollY, wind = 0, mx = -9999, my = -9999;

    const build = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gap = W < 760 ? 46 : 64;
      const n = Math.ceil(W / gap) + 1;
      threads = Array.from({ length: n }, (_, i) => ({
        x: i * gap + (Math.sin(i * 12.9) * .5 + .5) * gap * .5,
        b: 0, v: 0, k: .55 + ((i * 7) % 5) / 10,
        // una de cada cuatro lleva una piecita que baja
        bead: i % 4 === 1 ? { y: Math.random(), sp: .0006 + Math.random() * .0008, blue: i % 12 === 1 } : null,
      }));
    };
    build();

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const onLeave = () => { mx = my = -9999; };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    let rT = 0;
    const onResize = () => { clearTimeout(rT); rT = setTimeout(build, 150); };
    window.addEventListener('resize', onResize);

    const pointAt = (t, x, b) => {
      // curva cuadrática: arriba fijo, el medio se dobla un poco, abajo se va con el viento
      const cx = x + b * .55, ex = x + b;
      const u = 1 - t;
      return { x: u * u * x + 2 * u * t * cx + t * t * ex, y: t * H };
    };

    const tick = () => {
      const y = window.scrollY;
      const v = y - lastY; lastY = y;
      wind += (Math.max(-70, Math.min(70, -v * 2.4)) - wind) * .08;
      // visible recién después del inicio
      const vis = Math.min(1, Math.max(0, (y - H * .55) / (H * .45)));
      ctx.clearRect(0, 0, W, H);
      if (vis > 0) {
        threads.forEach((t, i) => {
          let target = wind * t.k * (.7 + .3 * Math.sin(i * 1.7));
          // el mouse los aparta
          const dx = t.x + t.b * (my / H) - mx;
          if (Math.abs(dx) < 140 && my > 0) target += (dx > 0 ? 1 : -1) * (140 - Math.abs(dx)) * .55 * (my / H + .2);
          if (reduced) target = 0;
          t.v = (t.v + (target - t.b) * .02) * .9;
          t.b += t.v;
          ctx.strokeStyle = `rgba(12,12,13,${.07 * vis})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(t.x, 0);
          ctx.quadraticCurveTo(t.x + t.b * .55, H * .55, t.x + t.b, H);
          ctx.stroke();
          if (t.bead) {
            if (!reduced) { t.bead.y += t.bead.sp; if (t.bead.y > 1.05) t.bead.y = -.05; }
            const p = pointAt(t.bead.y, t.x, t.b);
            ctx.fillStyle = t.bead.blue ? `rgba(46,60,255,${.55 * vis})` : `rgba(12,12,13,${.16 * vis})`;
            ctx.beginPath(); ctx.roundRect(p.x - 3.5, p.y - 3.5, 7, 7, 2); ctx.fill();
          }
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(rT);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);
  return <canvas className="threads-bg" ref={ref} aria-hidden="true" />;
}
