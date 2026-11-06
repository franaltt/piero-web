import { useEffect, useRef, useState } from 'react';
import Odometer from './Odometer.jsx';

// Carta coleccionable: se inclina en 3D siguiendo el mouse, el brillo holográfico
// cambia con el ángulo y al tocarla se da vuelta.
export default function ProfileCard({ photo, name, role, stats, labels, back }) {
  const wrap = useRef(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0, hover = false, t0 = performance.now();
    const move = (e) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      hover = true;
    };
    const leave = () => { hover = false; };
    const tick = () => {
      // sin mouse encima, flota sola y el brillo se mueve despacio
      if (!hover) { const t = (performance.now() - t0) / 1000; tx = Math.sin(t * .7) * .35; ty = Math.cos(t * .5) * .25; }
      x += (tx - x) * .08; y += (ty - y) * .08;
      el.style.setProperty('--rx', `${-y * 12}deg`);
      el.style.setProperty('--ry', `${x * 16}deg`);
      el.style.setProperty('--mx', `${(x + 1) * 50}%`);
      el.style.setProperty('--my', `${(y + 1) * 50}%`);
      el.style.setProperty('--hyp', Math.min(1, Math.hypot(x, y)).toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, []);

  return (
    <div className={'pcard' + (flipped ? ' is-flipped' : '')} ref={wrap}>
      <div className="pcard__tilt">
        <div className="pcard__flip">
          {/* frente */}
          <button type="button" className="pcard__face pcard__front" onClick={() => setFlipped(true)} aria-label={labels.flip} data-cursor={labels.flipShort}>
            <img src={photo} alt={name} className="pcard__photo" draggable="false" />
            <span className="pcard__holo" aria-hidden="true" />
            <span className="pcard__glare" aria-hidden="true" />
            <span className="pcard__top">
              <span>Nº 001</span>
              <span className="pcard__mark" aria-hidden="true"><i /><i /></span>
            </span>
            <span className="pcard__info">
              <b className="pcard__name">{name}</b>
              <span className="pcard__role">{role}</span>
              <span className="pcard__stats">
                {stats.map((s) => (
                  <span key={s.label} className="pcard__stat">
                    <b><Odometer value={s.value} prefix={s.prefix} /></b>
                    <span>{s.label}</span>
                  </span>
                ))}
              </span>
            </span>
          </button>
          {/* dorso */}
          <div className="pcard__face pcard__back">
            <span className="pcard__holo pcard__holo--back" aria-hidden="true" />
            <span className="pcard__backmark" aria-hidden="true">P</span>
            <div className="pcard__backtxt">
              <b>{back.title}</b>
              <a className="btn btn--light" href="#muestra">{back.cta} <span className="arr">→</span></a>
              <span className="pcard__handle">@piero.ia</span>
            </div>
            <button type="button" className="pcard__flipback" onClick={() => setFlipped(false)} aria-label={labels.flip}>↻</button>
          </div>
        </div>
      </div>
      <span className="pcard__shadow" aria-hidden="true" />
    </div>
  );
}
