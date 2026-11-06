import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLang } from '../i18n/LangContext.jsx';

const ROUNDS = [
  { real: '/trabajos/juego/r1-real.jpg', mine: '/trabajos/juego/r1-ia.jpg' },
  { real: '/trabajos/juego/r2-real.jpg', mine: '/trabajos/juego/r2-ia.jpg' },
  { real: '/trabajos/juego/r3-real.jpg', mine: '/trabajos/juego/r3-ia.jpg' },
];
const FLIP_MS = 800;
const randSide = () => (Math.random() < .5 ? 0 : 1);

export default function Game() {
  const { t } = useLang();
  const g = t.game;
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const [round, setRound] = useState(0);
  const [realSide, setRealSide] = useState(randSide);
  const [phase, setPhase] = useState('hidden'); // hidden | choose | reveal | done
  const [picked, setPicked] = useState(null);
  const [results, setResults] = useState([]); // true / false por ronda

  // precarga de todas las fotos
  useEffect(() => { ROUNDS.forEach((r) => { new Image().src = r.real; new Image().src = r.mine; }); }, []);

  // las cartas se dan vuelta cuando la sección aparece
  useEffect(() => {
    const el = sectionRef.current;
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) { setTimeout(() => setPhase((p) => (p === 'hidden' ? 'choose' : p)), 350); io.disconnect(); }
    }, { threshold: .45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // inclinación 3D siguiendo el mouse
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const offs = cardRefs.current.map((c) => {
      if (!c) return () => {};
      const move = (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty('--rx', `${-y * 10}deg`); c.style.setProperty('--ry', `${x * 12}deg`);
      };
      const leave = () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); };
      c.addEventListener('pointermove', move); c.addEventListener('pointerleave', leave);
      return () => { c.removeEventListener('pointermove', move); c.removeEventListener('pointerleave', leave); };
    });
    return () => offs.forEach((f) => f());
  }, []);

  const pick = (side) => {
    if (phase !== 'choose') return;
    const ok = side === realSide;
    setPicked(side); setPhase('reveal');
    setResults((r) => [...r, ok]);
    const el = cardRefs.current[side];
    if (el) gsap.fromTo(el, { scale: .96 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .4)', clearProps: 'transform' });
    if (!ok && el) gsap.fromTo(el, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1.2, .25)', clearProps: 'transform' });
  };

  const next = () => {
    if (round === ROUNDS.length - 1) { setPhase('done'); return; }
    setPhase('hidden'); setPicked(null);
    setTimeout(() => { setRound((r) => r + 1); setRealSide(randSide()); }, FLIP_MS * .55);
    setTimeout(() => setPhase('choose'), FLIP_MS + 150);
  };

  const replay = () => {
    setPhase('hidden'); setPicked(null); setResults([]);
    setTimeout(() => { setRound(0); setRealSide(randSide()); }, FLIP_MS * .55);
    setTimeout(() => setPhase('choose'), FLIP_MS + 150);
  };

  const r = ROUNDS[round];
  const srcFor = (side) => (side === realSide ? r.real : r.mine);
  const score = results.filter(Boolean).length;
  const verdict = score === 3 ? g.perfect : score > 0 ? g.good : g.none;
  const last = results[results.length - 1];

  return (
    <section className="game" id="juego" ref={sectionRef}>
      <div className="wrap game__in">
        <div className="game__head">
          <h2>{g.title}</h2>
          <p className="lead">{g.lead}</p>
          <div className="game__dots" aria-label={`${g.round} ${round + 1} ${g.of} ${ROUNDS.length}`}>
            {ROUNDS.map((_, i) => (
              <span key={i} className={'dot' + (results[i] === true ? ' ok' : results[i] === false ? ' ko' : i === round && phase !== 'done' ? ' now' : '')} />
            ))}
            <span className="game__round">{phase === 'done' ? `${score} / ${ROUNDS.length}` : `${g.round} ${round + 1} ${g.of} ${ROUNDS.length}`}</span>
          </div>
        </div>

        {phase !== 'done' ? (
          <div className="game__board">
            <div className="game__cards">
              {[0, 1].map((side) => {
                const isReal = side === realSide;
                const shown = phase === 'choose' || phase === 'reveal';
                const cls = ['gcard', shown ? 'is-up' : '', phase === 'reveal' ? (isReal ? 'is-real' : 'is-mine') : '', picked === side ? 'is-picked' : ''].join(' ');
                return (
                  <button
                    key={side}
                    type="button"
                    className={cls}
                    ref={(el) => { cardRefs.current[side] = el; }}
                    onClick={() => pick(side)}
                    disabled={phase !== 'choose'}
                    data-cursor={phase === 'choose' ? g.pick : undefined}
                    aria-label={`${g.pick} ${side === 0 ? 'A' : 'B'}`}
                  >
                    <span className="gcard__inner">
                      <span className="gcard__face gcard__face--back"><b>{side === 0 ? 'A' : 'B'}</b></span>
                      <span className="gcard__face gcard__face--img">
                        <img src={srcFor(side)} alt="" draggable="false" />
                        <span className="gcard__letter">{side === 0 ? 'A' : 'B'}</span>
                        {phase === 'reveal' && <span className="gcard__tag">{isReal ? g.real : g.mine}</span>}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="game__msg" aria-live="polite">
              {phase === 'reveal' && (
                <div className="game__msg-in" key={round}>
                  <p className="game__verdict">{last ? g.right : g.wrong}</p>
                  <p className="game__note">{g.notes[round]}</p>
                  <button type="button" className="btn" onClick={next}>
                    {round === ROUNDS.length - 1 ? g.results : g.next} <span className="arr">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="game__end">
            <p className="game__score"><span>{g.scoreLead}</span><b>{score}<i>/{ROUNDS.length}</i></b></p>
            <p className="game__final">{verdict}</p>
            <div className="game__cta">
              <a className="btn" href="#muestra">{g.cta} <span className="arr">→</span></a>
              <button type="button" className="btn btn--ghost" onClick={replay}>{g.again}</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
