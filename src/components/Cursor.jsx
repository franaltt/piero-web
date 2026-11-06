import { useEffect, useRef } from 'react';

// Cursor propio (solo con mouse): un punto que crece y muestra una palabra
// sobre cualquier elemento con data-cursor="…".
export default function Cursor() {
  const ref = useRef(null);
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = ref.current;
    if (!fine || reduced) { el.style.display = 'none'; return; }
    const label = el.querySelector('span');
    let x = -100, y = -100, tx = -100, ty = -100, raf = 0, frame = 0, lastTarget = null;
    const move = (e) => { tx = e.clientX; ty = e.clientY; lastTarget = e.target; };
    // revisa qué hay debajo del cursor (también si la etiqueta cambia sin mover el mouse)
    const check = (target) => {
      const t = target?.closest?.('[data-cursor]');
      if (t && t.dataset.cursor) { if (label.textContent !== t.dataset.cursor) label.textContent = t.dataset.cursor; el.classList.add('big'); }
      else el.classList.remove('big');
    };
    const over = (e) => { lastTarget = e.target; check(e.target); };
    const down = () => el.classList.add('press');
    const up = () => el.classList.remove('press');
    const leave = () => el.classList.add('hide');
    const enter = () => el.classList.remove('hide');
    const tick = () => {
      x += (tx - x) * .22; y += (ty - y) * .22;
      if (++frame % 8 === 0 && lastTarget) check(lastTarget);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.documentElement.addEventListener('mouseleave', leave);
    document.documentElement.addEventListener('mouseenter', enter);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('mouseleave', leave);
      document.documentElement.removeEventListener('mouseenter', enter);
    };
  }, []);
  return <div className="cursor" ref={ref} aria-hidden="true"><span /></div>;
}
