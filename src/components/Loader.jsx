import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { loaderDone } from '../lib/loaderSignal.js';
import { useLang } from '../i18n/LangContext.jsx';
import { arrivedWithCurtain } from '../lib/pageTransition.js';

// Intro: un chat que cuelga de un hilo. Piero saluda, tu mensaje "Desplegá la página de Piero"
// se escribe solo, lo enviás (o se envía solo) y la página se abre como un portal desde el botón.
const SEEN_KEY = 'piero-intro-seen';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Loader() {
  const { t } = useLang();
  const it = t.intro;
  const root = useRef(null);
  const card = useRef(null);
  const sendRef = useRef(null);
  const msgsRef = useRef(null);
  const [gone, setGone] = useState(false);
  const [msgs, setMsgs] = useState([]); // {who, text, steps?}
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const [ready, setReady] = useState(false); // botón de enviar listo
  const [sent, setSent] = useState(false);
  const [ticks, setTicks] = useState(0);
  const userTyped = useRef(false);
  const opening = useRef(false);
  const assets = useRef(null);

  // la página real carga por detrás mientras se chatea
  if (!assets.current) {
    assets.current = Promise.race([
      Promise.all([document.fonts?.ready, new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })))]),
      wait(4000),
    ]);
  }

  // abre el portal desde el botón de enviar y muestra la página
  const open = async (fast = false) => {
    if (opening.current) return;
    opening.current = true;
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (_) { /* sin storage */ }
    await assets.current;
    const el = root.current;
    if (!el) return;
    const b = sendRef.current?.getBoundingClientRect();
    const cx = b ? b.left + b.width / 2 : window.innerWidth / 2;
    const cy = b ? b.top + b.height / 2 : window.innerHeight / 2;
    const R = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy)) + 40;
    el.style.setProperty('--cx', cx + 'px');
    el.style.setProperty('--cy', cy + 'px');
    const tl = gsap.timeline();
    tl.to(card.current, { scale: .94, opacity: 0, y: -20, duration: fast ? .3 : .6, ease: 'power3.in' }, 0)
      .fromTo(el, { '--r': '0px' }, { '--r': R + 'px', duration: fast ? .8 : 1.15, ease: 'expo.inOut' }, fast ? 0 : .15)
      .add(() => { document.documentElement.style.overflow = ''; window.__lenis?.start(); ScrollTrigger.refresh(); loaderDone(); }, fast ? .3 : .6)
      .add(() => setGone(true));
  };

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (_) { /* sin storage */ }
    // si venís de Recursos con la cortina, no hay intro
    if (reduced || arrivedWithCurtain()) { setGone(true); loaderDone(); return; }
    // cada arranque tiene su propia secuencia; si React la corta, esa secuencia se detiene
    const run = { on: true };
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => window.__lenis?.stop(), 0); // el scroll suave arranca un instante después
    if (seen) { open(true); return () => { run.on = false; }; }

    gsap.fromTo(card.current, { y: -window.innerHeight * .6, rotate: -6 }, { y: 0, rotate: 0, duration: 1.4, ease: 'elastic.out(1, .45)' });
    (async () => {
      await wait(700); if (!run.on) return;
      setTyping(true); await wait(650); if (!run.on) return;
      setTyping(false); setMsgs([{ who: 'piero', text: it.hi }]);
      await wait(300); setTyping(true); await wait(600); if (!run.on) return;
      setTyping(false); setMsgs((m) => [...m, { who: 'piero', text: it.ask }]);
      await wait(350);
      // tu mensaje se escribe solo (si no empezaste a escribir vos)
      for (let i = 1; i <= it.prompt.length; i++) {
        if (!run.on || userTyped.current) break;
        setDraft(it.prompt.slice(0, i)); await wait(38);
      }
      if (!run.on) return;
      setReady(true);
      await wait(2600);
      if (run.on && !userTyped.current && !opening.current) document.getElementById('intro-send')?.click();
    })();
    return () => { run.on = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const el = msgsRef.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs, typing, ticks]);

  const send = async (e) => {
    e?.preventDefault();
    if (sent) return;
    const text = draft.trim() || it.prompt;
    setSent(true); setReady(false); setDraft('');
    setMsgs((m) => [...m, { who: 'me', text }]);
    await wait(350); setTyping(true); await wait(700);
    setTyping(false); setMsgs((m) => [...m, { who: 'piero', text: it.ok, steps: true }]);
    for (let i = 1; i <= it.steps.length; i++) {
      if (i === it.steps.length) await assets.current;
      await wait(380); setTicks(i);
    }
    await wait(350);
    open();
  };

  if (gone) return null;
  return (
    <div className="intro" ref={root} role="dialog" aria-modal="true" aria-label="Piero D'Benedetto">
      <span className="intro__rope" aria-hidden="true" />
      <div className="intro__card" ref={card}>
        <div className="intro__bar">
          <img src="/img/piero/piero-estudio-gris.webp" alt="" />
          <div><b>Piero</b><span className={typing ? 'on' : ''}>{typing ? it.typing : it.online}</span></div>
        </div>
        <div className="intro__msgs" ref={msgsRef} aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={'imsg imsg--' + m.who}>
              {m.text}
              {m.steps && (
                <ul className="imsg__steps">
                  {it.steps.map((s, k) => (
                    <li key={s} className={k < ticks ? 'ok' : k === ticks ? 'now' : ''}><i aria-hidden="true" />{s}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {typing && <div className="imsg imsg--piero imsg--typing" aria-label={it.typing}><i /><i /><i /></div>}
        </div>
        <form className="intro__composer" onSubmit={send}>
          <input
            type="text"
            value={draft}
            placeholder={it.placeholder}
            onChange={(e) => { userTyped.current = true; setDraft(e.target.value); setReady(e.target.value.trim().length > 0); }}
            disabled={sent}
            aria-label={it.placeholder}
          />
          <button id="intro-send" ref={sendRef} type="submit" className={'intro__send' + (ready ? ' is-ready' : '')} disabled={sent} aria-label={it.send}>↑</button>
        </form>
      </div>
      <button type="button" className="intro__skip" onClick={() => open(true)}>{it.skip}</button>
    </div>
  );
}
