import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WhatsAppIcon from '../components/WhatsAppIcon.jsx';
import { waLink } from '../data/stats.js';
import { useLang } from '../i18n/LangContext.jsx';

gsap.registerPlugin(ScrollTrigger);

// Cierre: cinco preguntas que arman el mensaje de WhatsApp para pedir la muestra gratis.
export default function Sample() {
  const { t } = useLang();
  const s = t.sample;
  const sectionRef = useRef(null);
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({});
  const [dir, setDir] = useState(1);
  const total = s.qs.length;
  const done = step >= total;

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.sample__left > *', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true } });
      gsap.from('.sample__card', { y: 100, rotate: -2, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', once: true } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const go = (n) => { setDir(n > step ? 1 : -1); setStep(n); };
  const choose = (k, v) => { setAns((a) => ({ ...a, [k]: v })); setTimeout(() => go(step + 1), 260); };
  const value = (k) => (ans[k] ? (k === 'ig' ? '@' + ans[k] : ans[k]) : '—');
  const message = [s.hello, ...s.qs.map((q) => `${s.labels[q.k]}: ${value(q.k)}`)].join('\n');
  const q = s.qs[step];

  return (
    <section className="sample" id="muestra" ref={sectionRef}>
      <div className="wrap sample__in">
        <div className="sample__left">
          <h2>{s.title}</h2>
          <p className="lead">{s.lead}</p>
          <ul className="sample__points">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>

        <div className="sample__card">
          <div className="sample__top">
            <span>{done ? '✓' : `${s.step} ${step + 1} ${s.of} ${total}`}</span>
            <span className="sample__bar"><i style={{ transform: `scaleX(${Math.min(step + (done ? 0 : 1), total) / total})` }} /></span>
            {step > 0 && <button type="button" className="sample__back" onClick={() => go(step - 1)}>← {s.back}</button>}
          </div>

          <div className="sample__body" key={step} style={{ '--dir': dir }}>
            {!done && (
              <>
                <p className="sample__q">{q.q}</p>
                {q.opts ? (
                  <div className="sample__opts">
                    {q.opts.map((o) => (
                      <button key={o} type="button" className={'sopt' + (ans[q.k] === o ? ' sel' : '')} onClick={() => choose(q.k, o)}>{o}</button>
                    ))}
                  </div>
                ) : (
                  <form className="sample__field" onSubmit={(e) => { e.preventDefault(); go(step + 1); }}>
                    <label htmlFor="sample-ig">@</label>
                    <input id="sample-ig" type="text" autoComplete="off" placeholder={q.input} value={ans.ig || ''} onChange={(e) => setAns((a) => ({ ...a, ig: e.target.value.replace(/^@/, '').trim() }))} />
                    <button type="submit" className="btn btn--sm">{s.next} <span className="arr">→</span></button>
                  </form>
                )}
              </>
            )}
            {done && (
              <>
                <p className="sample__q">{s.done}</p>
                <div className="sample__sum">
                  {s.qs.map((qq) => <div key={qq.k}><span>{s.labels[qq.k]}</span><b>{value(qq.k)}</b></div>)}
                </div>
                <a className="btn sample__send" href={waLink(message)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon size={20} /> {s.send}
                </a>
                <p className="sample__fine">{s.fine}</p>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
