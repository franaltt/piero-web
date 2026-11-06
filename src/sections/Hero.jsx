import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TOOLS } from '../data/tools.js';
import ToolTile from '../components/ToolTile.jsx';
import { createHanging } from '../lib/hangingPhysics.js';
import { onLoaderDone } from '../lib/loaderSignal.js';
import { useLang } from '../i18n/LangContext.jsx';

export default function Hero() {
  const { t } = useLang();
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const copyRef = useRef(null);
  const nameRef = useRef(null);
  const pieroRef = useRef(null);
  const hangRef = useRef(null);
  const tileRefs = useRef([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hanging = createHanging({
      stage: stageRef.current,
      canvas: canvasRef.current,
      tileEls: tileRefs.current.filter(Boolean),
      avoidEl: copyRef.current,
      reducedMotion: reduced,
    });
    hangRef.current = hanging;
    document.fonts?.ready.then(() => hanging.relayout());

    let ctx;
    if (!reduced) {
      ctx = gsap.context(() => {
        gsap.set(pieroRef.current, { y: 90, opacity: 0 });
        gsap.set(nameRef.current.children, { yPercent: 105 });
        gsap.set('[data-hero-in]', { y: 28, opacity: 0 });
      });
    }
    const off = onLoaderDone(() => {
      hanging.start();
      if (reduced) return;
      ctx.add(() => {
        gsap.to(nameRef.current.children, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: .06 });
        gsap.to(pieroRef.current, { y: 0, opacity: 1, duration: 1.5, ease: 'expo.out', delay: .1 });
        gsap.to('[data-hero-in]', { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: .08, delay: .45 });
      });
    });
    return () => { off(); hanging.destroy(); ctx?.revert(); };
  }, []);

  // al cambiar de idioma cambia el largo del texto: recalculo los hilos
  useEffect(() => { hangRef.current?.relayout(); }, [t]);

  return (
    <section className="hero" id="top">
      <div className="hero__stage" ref={stageRef}>
        <canvas className="hero__ropes" ref={canvasRef} aria-hidden="true" />
        <div className="hero__tiles" aria-label={t.hero.tilesLabel}>
          {TOOLS.map((tool, i) => (
            <ToolTile key={tool.slug} tool={tool} ref={(el) => { tileRefs.current[i] = el; }} />
          ))}
        </div>
        <div className="hero__name" ref={nameRef} aria-hidden="true">
          {'PIERO'.split('').map((ch, i) => <span key={i}>{ch}</span>)}
        </div>
        <img
          ref={pieroRef}
          className="hero__piero"
          src="/img/piero/piero-recorte.webp"
          alt="Piero D'Benedetto"
          width="1119"
          height="1385"
          draggable="false"
        />
      </div>

      <div className="hero__copy" ref={copyRef}>
        <div className="wrap hero__copy-in">
          <h1 className="hero__title" data-avoid data-hero-in>{t.hero.title}</h1>
          <div className="hero__side" data-avoid>
            <p className="lead" data-hero-in>{t.hero.lead}</p>
            <div className="hero__cta" data-hero-in>
              <a className="btn" href="#muestra">{t.hero.cta} <span className="arr">→</span></a>
              <a className="btn btn--ghost" href="#trabajo">{t.hero.ctaAlt}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
