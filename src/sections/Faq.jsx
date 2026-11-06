import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from '../i18n/LangContext.jsx';
import { fill } from '../i18n/texts.js';
import { PILOT } from '../data/plans.js';

gsap.registerPlugin(ScrollTrigger);

// Preguntas como chat: tocás una, se manda, Piero escribe y responde.
export default function Faq() {
  const { t, lang } = useLang();
  const f = t.faq;
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const [msgs, setMsgs] = useState([{ who: 'me', i: 0 }, { who: 'piero', i: 0 }]);
  const [typing, setTyping] = useState(false);
  const [asked, setAsked] = useState([0]);
  const timer = useRef(0);

  useEffect(() => { setMsgs([{ who: 'me', i: 0 }, { who: 'piero', i: 0 }]); setAsked([0]); setTyping(false); }, [lang]);
  useEffect(() => () => clearTimeout(timer.current), []);

  // el chat baja solo hasta el último mensaje
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.faq__left > *, .faq__q', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true } });
      gsap.from('.faq__chat', { y: 80, rotate: 2, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const ask = (i) => {
    if (typing) return;
    setMsgs((m) => [...m, { who: 'me', i }]);
    setAsked((a) => (a.includes(i) ? a : [...a, i]));
    setTimeout(() => setTyping(true), 300);
    const wait = Math.min(1500, 600 + f.items[i].a.length * 4);
    timer.current = setTimeout(() => { setTyping(false); setMsgs((m) => [...m, { who: 'piero', i }]); }, 300 + wait);
  };

  return (
    <section className="faq" id="preguntas" ref={sectionRef}>
      <div className="wrap faq__in">
        <div className="faq__left">
          <h2>{f.title}</h2>
          <p className="lead">{f.lead}</p>
          <div className="faq__qs">
            {f.items.map((it, i) => (
              <button key={i} type="button" className={'faq__q' + (asked.includes(i) ? ' is-asked' : '')} onClick={() => ask(i)} disabled={typing}>
                {it.q}<span aria-hidden="true">{asked.includes(i) ? '✓' : '↗'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="faq__chat" aria-live="polite">
          <div className="faq__bar">
            <img src="/img/piero/piero-estudio-gris.webp" alt="" />
            <div><b>Piero</b><span className={typing ? 'is-typing' : ''}>{typing ? f.typing : 'online'}</span></div>
          </div>
          <div className="faq__msgs" ref={listRef}>
            {msgs.map((m, k) => (
              <div key={k} className={'fmsg fmsg--' + m.who}>{m.who === 'me' ? f.items[m.i].q : fill(f.items[m.i].a, { price: PILOT.price })}</div>
            ))}
            {typing && <div className="fmsg fmsg--piero fmsg--typing" aria-label={f.typing}><i /><i /><i /></div>}
          </div>
        </div>
      </div>
    </section>
  );
}
