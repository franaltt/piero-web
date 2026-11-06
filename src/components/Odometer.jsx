import { useEffect, useRef, useState } from 'react';

// Número que gira dígito por dígito, como un cuentakilómetros, cuando aparece en pantalla.
export default function Odometer({ value, prefix = '' }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setOn(true); return; }
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: .6 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const digits = String(value).split('');
  return (
    <span className={'odo' + (on ? ' on' : '')} ref={ref} aria-label={prefix + value}>
      {prefix && <span className="odo__pre" aria-hidden="true">{prefix}</span>}
      {digits.map((d, i) => (
        <span className="odo__col" key={i} aria-hidden="true">
          {/* dos vueltas completas antes de frenar en el dígito final */}
          <span className="odo__strip" style={{ '--d': +d + 20, '--i': i }}>
            {Array.from({ length: 30 }, (_, k) => <span key={k}>{k % 10}</span>)}
          </span>
        </span>
      ))}
    </span>
  );
}
