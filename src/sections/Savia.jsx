import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lightbox from '../components/Lightbox.jsx';
import { useLang } from '../i18n/LangContext.jsx';

gsap.registerPlugin(ScrollTrigger);

const SOURCE = { id: 'savia-fuente', type: 'anuncio', src: '/trabajos/img/fuente-savia.jpg' };
// Las seis piezas que salen de la foto, y adónde va cada una (fracción del ancho / alto de pantalla)
const OUTS = [
  { id: 'salida-1', fmt: 'historia', type: 'anuncio', src: '/trabajos/img/salida-1.jpg', d: [-.20, -.12], m: [-.30, -.20] },
  { id: 'salida-2', fmt: 'nativo', type: 'anuncio', src: '/trabajos/img/salida-2.jpg', d: [-.34, .03], m: [-.30, 0] },
  { id: 'salida-3', fmt: 'anuncio', type: 'anuncio', src: '/trabajos/img/salida-3.jpg', d: [-.20, .18], m: [-.30, .20] },
  { id: 'savia-ugc', fmt: 'casero', type: 'video', src: '/trabajos/video/savia-ugc.mp4', poster: '/trabajos/video/savia-ugc.jpg', d: [.20, -.12], m: [.30, -.20] },
  { id: 'salida-5', fmt: 'lifestyle', type: 'anuncio', src: '/trabajos/img/salida-5.jpg', d: [.34, .03], m: [.30, 0] },
  { id: 'salida-6', fmt: 'comparativa', type: 'anuncio', src: '/trabajos/img/salida-6.jpg', d: [.20, .18], m: [.30, .20] },
];

export default function Savia() {
  const { t } = useLang();
  const s = t.savia;
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const srcRef = useRef(null);
  const outRefs = useRef([]);
  const countRef = useRef(null);
  const [open, setOpen] = useState(null);

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = () => window.innerWidth < 760;
    const pos = (o) => (mobile() ? o.m : o.d);
    const outs = outRefs.current.filter(Boolean);

    if (reduced) {
      outs.forEach((el, i) => gsap.set(el, { x: pos(OUTS[i])[0] * window.innerWidth, y: pos(OUTS[i])[1] * window.innerHeight, opacity: 1 }));
      countRef.current.textContent = '20';
      return;
    }

    // hilos de la foto a cada pieza, dibujados en cada cuadro
    const canvas = canvasRef.current;
    const ctx2d = canvas.getContext('2d');
    const state = { lines: 0, mx: 0, my: 0, fx: 0, fy: 0, live: false };
    const draw = () => {
      if (!state.live) return;
      const r = stageRef.current.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return; // fuera de pantalla: no dibuja
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(r.width * dpr)) { canvas.width = r.width * dpr; canvas.height = r.height * dpr; }
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2d.clearRect(0, 0, r.width, r.height);
      if (state.lines <= 0) return;
      const sr = srcRef.current.getBoundingClientRect();
      const sx = sr.left + sr.width / 2 - r.left, sy = sr.top + sr.height / 2 - r.top;
      ctx2d.lineWidth = 1;
      outs.forEach((el) => {
        const o = el.getBoundingClientRect();
        if (o.width === 0) return;
        const ex = o.left + o.width / 2 - r.left, ey = o.top + o.height / 2 - r.top;
        const op = Math.min(1, parseFloat(getComputedStyle(el).opacity) || 0);
        ctx2d.strokeStyle = `rgba(12,12,13,${.28 * op * state.lines})`;
        ctx2d.beginPath();
        ctx2d.moveTo(sx, sy);
        // curva suave, como un hilo que cuelga un poco
        ctx2d.quadraticCurveTo((sx + ex) / 2, Math.max(sy, ey) + 40, ex, ey);
        ctx2d.stroke();
      });
      // flotan un poco siguiendo el mouse cuando ya están afuera
      state.fx += (state.mx - state.fx) * .06; state.fy += (state.my - state.fy) * .06;
      outs.forEach((el, i) => { el.style.translate = `${state.fx * (8 + i * 3)}px ${state.fy * (6 + i * 2)}px`; });
    };
    gsap.ticker.add(draw);
    const onMove = (e) => { state.mx = e.clientX / window.innerWidth - .5; state.my = e.clientY / window.innerHeight - .5; };
    window.addEventListener('pointermove', onMove, { passive: true });

    const ctx = gsap.context(() => {
      gsap.set(outs, { x: 0, y: 0, scale: .55, rotate: (i) => (i % 2 ? 8 : -8), opacity: 0 });
      const counter = { v: 1 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => '+=' + window.innerHeight * 1.6,
          pin: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => { state.live = self.isActive || self.progress > 0; },
        },
      });
      tl.from(srcRef.current, { scale: 1.25, rotate: -3, duration: .5, ease: 'power2.out' }, 0)
        .to(state, { lines: 1, duration: .2 }, .25)
        .to(counter, { v: 20, duration: 1.2, ease: 'none', onUpdate: () => { countRef.current.textContent = Math.round(counter.v); } }, .3);
      outs.forEach((el, i) => {
        tl.to(el, {
          x: () => pos(OUTS[i])[0] * window.innerWidth,
          y: () => pos(OUTS[i])[1] * window.innerHeight,
          scale: 1, rotate: (i % 2 ? 2.5 : -2.5), opacity: 1,
          duration: .6, ease: 'power3.out',
        }, .3 + i * .12);
      });
      tl.to({}, { duration: .4 });
      gsap.from('.savia__head > *', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true } });
    }, sectionRef);

    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener('pointermove', onMove);
      ctx.revert();
    };
  }, []);

  const all = [SOURCE, ...OUTS];
  const openAt = (i, e) => setOpen({ index: i, rect: e.currentTarget.getBoundingClientRect() });
  const label = (it) => (it === SOURCE ? s.source : s.formats[it.fmt]);

  return (
    <section className="savia" id="caso" ref={sectionRef}>
      <div className="wrap savia__head">
        <div className="savia__kicker">{s.kicker}</div>
        <h2>{s.title}</h2>
        <p className="lead">{s.lead}</p>
      </div>
      <div className="savia__count" aria-live="off">
        <b ref={countRef}>1</b>
        <span>{s.count}</span>
      </div>

      <div className="savia__stage" ref={stageRef}>
        <canvas className="savia__lines" ref={canvasRef} aria-hidden="true" />
        <div className="savia__center">
          {OUTS.map((o, i) => (
            <button
              key={o.id}
              type="button"
              className="savia__out"
              ref={(el) => { outRefs.current[i] = el; }}
              onClick={(e) => openAt(i + 1, e)}
              data-cursor={t.work.view}
              aria-label={`${s.kicker} · ${s.formats[o.fmt]}`}
            >
              {o.type === 'video'
                ? <video src={o.src} poster={o.poster} muted loop autoPlay playsInline />
                : <img src={o.src} alt="" loading="lazy" draggable="false" />}
              <span className="savia__tag">{s.formats[o.fmt]}</span>
            </button>
          ))}
          <button type="button" className="savia__src" ref={srcRef} onClick={(e) => openAt(0, e)} data-cursor={t.work.view} aria-label={`${s.kicker} · ${s.source}`}>
            <img src={SOURCE.src} alt="" draggable="false" />
            <span className="savia__tag savia__tag--src">{s.source}</span>
          </button>
        </div>
      </div>
      <p className="wrap savia__foot">{s.foot}</p>

      {open && (
        <Lightbox
          item={all[open.index]}
          fromRect={open.rect}
          labels={t.work}
          caption={`${s.kicker} · ${label(all[open.index])}`}
          onClose={() => setOpen(null)}
          onPrev={() => setOpen({ index: (open.index + all.length - 1) % all.length, rect: null })}
          onNext={() => setOpen({ index: (open.index + 1) % all.length, rect: null })}
        />
      )}
    </section>
  );
}
