import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WORK } from '../data/work.js';
import Lightbox from '../components/Lightbox.jsx';
import { useLang } from '../i18n/LangContext.jsx';

gsap.registerPlugin(ScrollTrigger);

const FILTERS = ['all', 'anuncio', 'video', 'casero'];
const AUTOPLAY_MS = 3200;

// distancia con signo más corta entre i y p en un círculo de n piezas (carrusel infinito)
const wrapOffset = (i, p, n) => {
  let o = (i - p) % n;
  if (o > n / 2) o -= n;
  if (o < -n / 2) o += n;
  return o;
};
const mod = (a, n) => ((a % n) + n) % n;

export default function Work() {
  const { t } = useLang();
  const w = t.work;
  const [filter, setFilter] = useState('all');
  const items = useMemo(() => (filter === 'all' ? WORK : WORK.filter((x) => x.type === filter)), [filter]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(null); // { index, rect }

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const S = useRef({ p: 0, v: 0, target: null, drag: false, moved: 0, spread: 0, last: 0, inView: false, paused: false, n: items.length });
  S.current.n = items.length;
  S.current.paused = !!open;

  const caption = (it) => `${it.brand} · ${w.rubros[it.rubro]} · ${w.types[it.type]}`;

  // ---- motor del abanico: corre en cada cuadro, sin re-render de React ----
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const st = S.current;
    let raf = 0, lastActive = -1;

    const geometry = () => {
      const vw = window.innerWidth;
      const cw = vw < 760 ? Math.min(220, vw * .56) : Math.min(320, Math.max(240, vw * .2));
      return { cw, spacing: cw * (vw < 760 ? .74 : .7), curve: vw < 760 ? 10 : 16, tilt: vw < 760 ? 4 : 3.4, range: vw < 760 ? 3.2 : 4.6 };
    };
    let G = geometry();
    const onResize = () => { G = geometry(); stageRef.current?.style.setProperty('--cw', G.cw + 'px'); };
    onResize();
    window.addEventListener('resize', onResize);

    const tick = () => {
      // fuera de pantalla no recalcula nada (antes movía 30 tarjetas en cada cuadro y saturaba el navegador)
      if (!st.inView && st.spread >= 1) { raf = requestAnimationFrame(tick); return; }
      const n = st.n;
      const now = performance.now();
      if (!st.drag) {
        if (st.target !== null) {
          st.p += (st.target - st.p) * .12;
          if (Math.abs(st.target - st.p) < .001) { st.p = st.target; st.target = null; }
        } else {
          st.p += st.v; st.v *= .93;
          if (Math.abs(st.v) < .004) { st.v = 0; st.target = Math.round(st.p); }
        }
        // avanza solo si nadie lo toca
        if (!reduced && st.inView && !st.paused && now - st.last > AUTOPLAY_MS && st.target === null && st.v === 0) {
          st.target = Math.round(st.p) + 1; st.last = now;
        }
      }
      const s = st.spread;
      cardRefs.current.forEach((el, i) => {
        if (!el || i >= n) return;
        const o = wrapOffset(i, st.p, n);
        const a = Math.abs(o);
        const x = o * G.spacing * s;
        const y = o * o * G.curve * s + (1 - s) * 30;
        const rz = o * G.tilt * s + (1 - s) * (i % 2 ? 4 : -4) * (1 - Math.min(1, a / 6));
        const sc = 1 - Math.min(a, 4) * .07;
        const fade = Math.min(1, Math.max(0, G.range - a + .6));
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rz}deg) scale(${sc})`;
        el.style.opacity = fade;
        el.style.zIndex = String(200 - Math.round(a * 10));
        el.style.setProperty('--shade', Math.min(a, 3) * .16);
        const hidden = fade <= 0;
        el.style.visibility = hidden ? 'hidden' : 'visible';
        el.style.willChange = a < 3 ? 'transform' : 'auto';
        // solo se reproducen los videos que están al frente
        const v = el.querySelector('video');
        if (v) {
          const shouldPlay = st.inView && !st.paused && a < 1.6;
          if (shouldPlay && v.paused) v.play().catch(() => {});
          else if (!shouldPlay && !v.paused) v.pause();
        }
      });
      const act = mod(Math.round(st.p), n);
      if (act !== lastActive) {
        lastActive = act; setActive(act);
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          if (i === act) el.setAttribute('data-cursor', items[i]?.type === 'anuncio' ? w.view : w.play);
          else el.removeAttribute('data-cursor');
          el.classList.toggle('is-active', i === act);
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [items, w]);

  // ---- arrastre con inercia ----
  useEffect(() => {
    const stage = stageRef.current;
    const st = S.current;
    let sx = 0, sp = 0, lx = 0, lt = 0;
    const spacing = () => parseFloat(getComputedStyle(stage).getPropertyValue('--cw')) * (window.innerWidth < 760 ? .74 : .7);
    const down = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      st.drag = true; st.moved = 0; st.target = null; st.v = 0;
      sx = lx = e.clientX; sp = st.p; lt = performance.now();
      stage.classList.add('is-drag');
    };
    const move = (e) => {
      if (!st.drag) return;
      const dx = e.clientX - sx;
      st.moved = Math.max(st.moved, Math.abs(dx));
      st.p = sp - dx / spacing();
      const now = performance.now();
      const dt = Math.max(1, now - lt);
      st.v = (-(e.clientX - lx) / spacing()) * (16 / dt);
      lx = e.clientX; lt = now;
    };
    const up = () => {
      if (!st.drag) return;
      st.drag = false; st.last = performance.now();
      st.v = Math.max(-.6, Math.min(.6, st.v));
      stage.classList.remove('is-drag');
    };
    stage.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      stage.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  // ---- entrada: el mazo se reparte en abanico cuando la sección aparece ----
  useLayoutEffect(() => {
    const st = S.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { st.spread = 1; return; }
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'top 85%',
        end: 'bottom top',
        onToggle: (self) => { st.inView = self.isActive; if (self.isActive) st.last = performance.now(); },
        onEnter: () => gsap.to(st, { spread: 1, duration: 1.6, ease: 'expo.out' }),
        onEnterBack: () => { if (st.spread < 1) gsap.to(st, { spread: 1, duration: 1.2, ease: 'expo.out' }); },
      });
      gsap.from('.work__head > *', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // ---- filtros: se junta el mazo, cambian las piezas y se vuelve a repartir ----
  const changeFilter = (f) => {
    if (f === filter) return;
    const st = S.current;
    gsap.to(st, {
      spread: 0, duration: .45, ease: 'power3.in',
      onComplete: () => {
        st.p = 0; st.v = 0; st.target = null; st.last = performance.now();
        setFilter(f);
        requestAnimationFrame(() => gsap.to(st, { spread: 1, duration: 1.2, ease: 'expo.out' }));
      },
    });
  };

  const go = useCallback((delta) => { const st = S.current; st.target = Math.round(st.p) + delta; st.last = performance.now(); }, []);

  const onCardClick = (i, e) => {
    const st = S.current;
    if (st.moved > 6) return; // fue un arrastre, no un toque
    const o = wrapOffset(i, st.p, st.n);
    if (Math.abs(o) > .5) { st.target = Math.round(st.p + o); st.last = performance.now(); return; }
    setOpen({ index: i, rect: e.currentTarget.getBoundingClientRect() });
  };

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'Enter') { const el = cardRefs.current[active]; if (el) setOpen({ index: active, rect: el.getBoundingClientRect() }); }
  };

  const cur = items[active] || items[0];
  const pad = (x) => String(x).padStart(2, '0');

  return (
    <section className="work" id="trabajo" ref={sectionRef}>
      <div className="wrap work__head">
        <h2>{w.title}</h2>
        <p className="lead">{w.sub}</p>
        <div className="work__filters" role="tablist" aria-label={w.title}>
          {FILTERS.map((f) => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} className={filter === f ? 'on' : ''} onClick={() => changeFilter(f)}>
              {w.filters[f]}
              <sup>{f === 'all' ? WORK.length : WORK.filter((x) => x.type === f).length}</sup>
            </button>
          ))}
        </div>
      </div>

      <div className="work__ghost" aria-hidden="true">
        <span key={cur.brand}>{cur.brand}</span>
      </div>

      <div
        className="work__stage"
        ref={stageRef}
        data-cursor={w.drag}
        tabIndex={0}
        role="group"
        aria-roledescription="carrusel"
        aria-label={w.title}
        onKeyDown={onKey}
      >
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            tabIndex={-1}
            className={'wcard wcard--' + it.type}
            ref={(el) => { cardRefs.current[i] = el; }}
            onClick={(e) => onCardClick(i, e)}
            aria-label={caption(it)}
          >
            {it.type === 'anuncio' ? (
              <img src={it.src} alt="" loading="lazy" draggable="false" />
            ) : (
              <video src={it.src} poster={it.poster} muted loop playsInline preload="none" />
            )}
            {it.type !== 'anuncio' && <span className="wcard__badge">{it.type === 'casero' ? `▶ ${it.secs} s` : '▶'}</span>}
            <span className="wcard__shade" />
          </button>
        ))}
      </div>

      <div className="wrap work__foot">
        <button type="button" className="work__arrow" onClick={() => go(-1)} aria-label={w.prev}>←</button>
        <div className="work__caption" aria-live="polite">
          <span key={cur.id} className="work__cap-in">
            <b>{cur.brand}</b> {w.rubros[cur.rubro]} · {w.types[cur.type]}
          </span>
        </div>
        <span className="work__count">{pad(active + 1)} / {pad(items.length)}</span>
        <button type="button" className="work__arrow" onClick={() => go(1)} aria-label={w.next}>→</button>
      </div>

      {open && (
        <Lightbox
          item={items[open.index]}
          fromRect={open.rect}
          labels={w}
          caption={caption(items[open.index])}
          onClose={() => setOpen(null)}
          onPrev={() => { const i = mod(open.index - 1, items.length); go(-1); setOpen({ index: i, rect: null }); }}
          onNext={() => { const i = mod(open.index + 1, items.length); go(1); setOpen({ index: i, rect: null }); }}
        />
      )}
    </section>
  );
}
