import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from '../i18n/LangContext.jsx';

gsap.registerPlugin(ScrollTrigger);

const PHOTOS = ['/trabajos/img/fuente-savia.jpg', '/trabajos/juego/r1-real.jpg', '/trabajos/juego/r3-real.jpg'];
const WEEK = [
  { day: 0, src: '/trabajos/img/salida-3.jpg' },
  { day: 2, src: '/trabajos/img/salida-6.jpg' },
  { day: 4, src: '/trabajos/video/savia-ugc.jpg' },
  { day: 6, src: '/trabajos/img/salida-2.jpg' },
];
const SWATCHES = ['#2F3E42', '#C9772F', '#EFE7DA'];

// Pantallas del teléfono: cada una se anima sola cuando su paso está activo (animaciones CSS)
function Screen1({ p }) {
  return (
    <div className="ph-chat">
      <div className="ph-bar"><img src="/img/piero/piero-estudio-gris.webp" alt="" /><div><b>{p.chat}</b><span>{p.online}</span></div></div>
      <div className="ph-msgs">
        <div className="bub bub--me a1">{p.send}</div>
        <div className="ph-photos">{PHOTOS.map((src, i) => <img key={src} src={src} alt="" className={'a' + (2 + i)} />)}</div>
        <div className="bub bub--typing a5"><i /><i /><i /></div>
        <div className="bub a6">{p.ok}</div>
      </div>
    </div>
  );
}
function Screen2({ p }) {
  return (
    <div className="ph-ficha">
      <div className="ph-title a1">{p.ficha}</div>
      <div className="ph-brand a2"><img src="/trabajos/img/fuente-savia.jpg" alt="" /><b>Savia Tierra</b></div>
      <div className="ph-rows">
        {p.rows.map(({ k, v }, i) => (
          <div key={k} className={'ph-row a' + (3 + i)}>
            <span>{k}</span>
            {v ? <em className="type">{v}</em> : <span className="sw">{SWATCHES.map((c) => <i key={c} style={{ background: c }} />)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
function Screen3({ p }) {
  return (
    <div className="ph-week">
      <div className="ph-title a1">{p.week}</div>
      <div className="ph-days">
        {p.days.map((d, i) => {
          const piece = WEEK.find((w) => w.day === i);
          return (
            <div key={i} className="ph-day">
              <span>{d}</span>
              <div className="ph-slot">{piece && <img src={piece.src} alt="" className={'drop a' + (2 + WEEK.indexOf(piece))} />}</div>
            </div>
          );
        })}
      </div>
      <div className="ph-big a6"><img src={WEEK[0].src} alt="" /><img src={WEEK[1].src} alt="" /></div>
      <div className="ph-approve a7"><span>{p.pieces}</span><b><em className="lbl1">{p.approve}</em><em className="lbl2">{p.approved} ✓</em></b></div>
    </div>
  );
}
function Screen4({ p }) {
  return (
    <div className="ph-chat">
      <div className="ph-bar"><img src="/img/piero/piero-estudio-gris.webp" alt="" /><div><b>{p.chat}</b><span>{p.online}</span></div></div>
      <div className="ph-msgs">
        <div className="ph-piece a1"><img src="/trabajos/img/salida-3.jpg" alt="" /></div>
        <div className="bub bub--me a2">{p.ask}</div>
        <div className="bub bub--typing a3"><i /><i /><i /></div>
        <div className="bub a4">{p.fixed} ✓</div>
        <div className="ph-learn a5">{p.learned}</div>
      </div>
    </div>
  );
}
const SCREENS = [Screen1, Screen2, Screen3, Screen4];

export default function How() {
  const { t } = useLang();
  const h = t.how;
  const sectionRef = useRef(null);
  const barRef = useRef(null);
  const stRef = useRef(null);
  const [step, setStep] = useState(0);

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      stRef.current = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => '+=' + window.innerHeight * 3,
        pin: true,
          anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const s = Math.min(3, Math.floor(self.progress * 4 * .999));
          setStep((prev) => (prev === s ? prev : s));
          if (barRef.current) barRef.current.style.transform = `scaleY(${self.progress})`;
        },
      });
      gsap.from('.how__head > *', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true } });
      gsap.from('.phone', { y: 120, rotate: 4, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // tocar un paso lleva el scroll hasta ese paso
  const goTo = (i) => {
    const st = stRef.current;
    if (!st) { setStep(i); return; }
    const y = st.start + (st.end - st.start) * ((i + .5) / 4);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <section className="how" id="como" ref={sectionRef}>
      <div className="wrap how__in">
        <div className="how__left">
          <div className="how__head">
            <h2>{h.title}</h2>
            <p className="lead">{h.lead}</p>
          </div>
          <ol className="how__steps">
            <span className="how__rail" aria-hidden="true"><i ref={barRef} /></span>
            {h.steps.map((s, i) => (
              <li key={i} className={i === step ? 'on' : i < step ? 'done' : ''}>
                <button type="button" onClick={() => goTo(i)} aria-current={i === step ? 'step' : undefined}>
                  <span className="how__n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="how__txt">
                    <b>{s.t}</b>
                    <span className="how__d"><span>{s.d}</span></span>
                  </span>
                  <span className="how__when">{s.when}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="how__right">
          <div className="phone" aria-hidden="true">
            <div className="phone__island" />
            <div className="phone__status"><span>9:41</span><span className="phone__icons"><i /><i /><i /></span></div>
            <div className="phone__screen">
              {SCREENS.map((S, i) => (
                <div key={i} className={'phone__layer' + (i === step ? ' is-on' : i < step ? ' is-past' : '')}>
                  <S p={h.phone} />
                </div>
              ))}
            </div>
          </div>
          <div className="how__mobile-step" aria-live="polite">
            <span className="how__n">{String(step + 1).padStart(2, '0')} / 04</span>
            <b key={step}>{h.steps[step].t}</b>
          </div>
        </div>
      </div>
    </section>
  );
}
