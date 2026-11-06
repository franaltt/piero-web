import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import data from '../../content/recursos.json';
import GuideCover from '../components/GuideCover.jsx';
import EmailForm from '../components/EmailForm.jsx';
import { waLink } from '../data/stats.js';
import { fill } from '../i18n/texts.js';
import { useLang } from '../i18n/LangContext.jsx';

gsap.registerPlugin(ScrollTrigger);
const pick = (obj, lang) => (obj && (obj[lang] || obj.es)) || '';

function GuideCard({ g, i, r, lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const title = pick(g.title, lang);
  // la portada se inclina siguiendo el mouse
  const move = (e) => {
    const el = ref.current; if (!el) return;
    const b = el.getBoundingClientRect();
    el.style.setProperty('--rx', `${((e.clientY - b.top) / b.height - .5) * -10}deg`);
    el.style.setProperty('--ry', `${((e.clientX - b.left) / b.width - .5) * 12}deg`);
  };
  const leave = () => { ref.current?.style.setProperty('--rx', '0deg'); ref.current?.style.setProperty('--ry', '0deg'); };
  return (
    <article className={'guide' + (open ? ' is-open' : '')}>
      <div className="guide__cover" ref={ref} onPointerMove={move} onPointerLeave={leave}>
        <GuideCover src={g.cover} title={title} kind={r.filters[g.kind]} index={i} />
        <span className="guide__free">{r.free}</span>
      </div>
      <div className="guide__body">
        <span className="guide__meta">{r.filters[g.kind]} · {g.pages} {r.pages}</span>
        <h3>{title}</h3>
        <p>{pick(g.desc, lang)}</p>
        {!open && <button type="button" className="guide__get" onClick={() => setOpen(true)}>{r.get} <span aria-hidden="true">↓</span></button>}
        <div className="guide__form"><div>{open && <EmailForm labels={r} tag={g.mailchimp_tag} guide={g.slug} button={r.send} autoFocus compact />}</div></div>
      </div>
    </article>
  );
}

export default function RecursosPage() {
  const { t, lang } = useLang();
  const r = t.recursos;
  const rootRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const guides = data.guides.filter((g) => filter === 'all' || g.kind === filter);
  const skill = data.skill;
  const kinds = ['all', ...new Set(data.guides.map((g) => g.kind))];

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.rhero__txt > *', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .08, delay: .3 });
      gsap.from('.rhero__stack .rstack__c', { y: 160, rotate: 0, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: .1, delay: .4 });
      gsap.from('.skill', { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.skill', start: 'top 85%', once: true } });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // las tarjetas entran cada vez que cambia el filtro
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = rootRef.current.querySelectorAll('.guide');
    gsap.fromTo(els, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: '.guides', start: 'top 85%', once: true } });
  }, [filter]);

  // abanico de portadas del inicio: se abre siguiendo el mouse
  const fanMove = (e) => {
    const el = e.currentTarget, b = el.getBoundingClientRect();
    el.style.setProperty('--fx', ((e.clientX - b.left) / b.width - .5).toFixed(3));
  };

  return (
    <div className="rpage" ref={rootRef}>
      <section className="rhero wrap">
        <div className="rhero__txt">
          <h1>{r.title}</h1>
          <p className="lead">{r.lead}</p>
        </div>
        <div className="rhero__stack" onPointerMove={fanMove} onPointerLeave={(e) => e.currentTarget.style.setProperty('--fx', 0)} aria-hidden="true">
          {data.guides.slice(0, 3).map((g, i) => (
            <span key={g.slug} className="rstack__c" style={{ '--i': i - 1 }}>
              <GuideCover src={g.cover} title={pick(g.title, lang)} kind={r.filters[g.kind]} index={i} />
            </span>
          ))}
        </div>
      </section>

      {skill?.active && (
        <section className="wrap">
          <div className="skill">
            <div className="skill__media">
              <video src={skill.video} muted loop autoPlay playsInline preload="metadata" />
              <span className="skill__fallback" aria-hidden="true">{skill.name}</span>
            </div>
            <div className="skill__info">
              <span className="skill__tag">{r.skillTag}</span>
              <h2>{skill.name}</h2>
              <p className="skill__desc">{pick(skill.desc, lang)}</p>
              <ul>{(skill.bullets?.[lang] || skill.bullets?.es || []).map((b) => <li key={b}>{b}</li>)}</ul>
              <div className="skill__buy">
                <span className="skill__price"><small>USD</small>{skill.price}</span>
                <a className="btn btn--light" href={skill.buy_url || waLink(fill(r.buy, { name: skill.name }))} target="_blank" rel="noopener noreferrer">{fill(r.buy, { name: skill.name })} <span className="arr">→</span></a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="wrap guides">
        <div className="guides__head">
          <div className="rtabs" role="tablist">
            {kinds.map((k) => (
              <button key={k} type="button" role="tab" aria-selected={filter === k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>
                {r.filters[k] || k}<sup>{k === 'all' ? data.guides.length : data.guides.filter((g) => g.kind === k).length}</sup>
              </button>
            ))}
          </div>
        </div>
        <div className="guides__grid">
          {guides.map((g, i) => <GuideCard key={g.slug} g={g} i={i} r={r} lang={lang} />)}
        </div>
      </section>

      <section className="wrap">
        <div className="notify">
          <h2>{r.notifyTitle}</h2>
          <p>{r.notifyLead}</p>
          <EmailForm labels={r} button={r.notifyBtn} guide="novedades" dark />
        </div>
      </section>
    </div>
  );
}
