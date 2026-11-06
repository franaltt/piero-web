import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProfileCard from '../components/ProfileCard.jsx';
import { STATS, SOCIALS, CLIENTS } from '../data/stats.js';
import { useLang } from '../i18n/LangContext.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const { t } = useLang();
  const a = t.about;
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      // la carta entra una sola vez, como si la repartieran
      gsap.from('.pcard', { y: 160, rotate: 10, opacity: 0, duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true } });
      gsap.from('.about__txt > *', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const band = [...CLIENTS, ...CLIENTS, ...CLIENTS, ...CLIENTS];
  const stats = [
    { value: STATS.clients, prefix: '+', label: a.stats.clients },
    { value: STATS.pieces, prefix: '+', label: a.stats.pieces },
    { value: STATS.years, prefix: '', label: a.stats.years },
  ];

  return (
    <section className="about" id="piero" ref={sectionRef}>
      <div className="wrap about__in">
        <div className="about__txt">
          <h2>{a.title}</h2>
          <p className="lead">{a.body}</p>
          <div className="about__social">
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" data-cursor={a.follow}>
                <span>{s.name}</span><i aria-hidden="true">↗</i>
              </a>
            ))}
          </div>
        </div>
        <div className="about__card">
          <ProfileCard
            photo="/img/piero/piero-oficina.webp"
            name="Piero D'Benedetto"
            role={a.role}
            stats={stats}
            labels={a}
            back={{ title: a.backTitle, cta: a.backCta }}
          />
        </div>
      </div>

      <div className="about__band" aria-label={`${a.clientsLabel}: ${CLIENTS.join(', ')}`}>
        <div className="about__band-label wrap">{a.clientsLabel}</div>
        <div className="about__track" aria-hidden="true">
          {band.map((c, i) => <span key={i}>{c}<i>✳</i></span>)}
        </div>
      </div>
    </section>
  );
}
