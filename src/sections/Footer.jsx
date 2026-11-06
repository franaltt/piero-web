import { useEffect, useLayoutEffect, useRef } from 'react';
import Matter from 'matter-js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOOLS } from '../data/tools.js';
import ToolTile from '../components/ToolTile.jsx';
import WhatsAppIcon from '../components/WhatsAppIcon.jsx';
import { SOCIALS, WHATSAPP, waLink } from '../data/stats.js';
import { useLang } from '../i18n/LangContext.jsx';
import { LANGS } from '../i18n/texts.js';
import { goToPage, isHome } from '../lib/pageTransition.js';

gsap.registerPlugin(ScrollTrigger);

// Footer: las herramientas del inicio caen y se apilan con física real.
// Con mouse se pueden agarrar y tirar. La página termina donde empezó.
export default function Footer() {
  const { t, lang, setLang } = useLang();
  const f = t.footer;
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const tileRefs = useRef([]);
  const bigRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const els = tileRefs.current.filter(Boolean);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const { Engine, Runner, Bodies, Composite, Body, Mouse, MouseConstraint, Events } = Matter;

    const engine = Engine.create({ gravity: { y: 1.1 } });
    const runner = Runner.create();
    let bodies = [], walls = [], W = 0, H = 0, S = 72, started = false, running = false;

    const size = () => (window.innerWidth < 760 ? 56 : 92);
    const buildWalls = () => {
      walls.forEach((w) => Composite.remove(engine.world, w));
      const r = stage.getBoundingClientRect();
      W = r.width; H = r.height;
      const th = 200;
      walls = [
        Bodies.rectangle(W / 2, H + th / 2, W * 2, th, { isStatic: true }),
        Bodies.rectangle(-th / 2, H / 2, th, H * 4, { isStatic: true }),
        Bodies.rectangle(W + th / 2, H / 2, th, H * 4, { isStatic: true }),
      ];
      Composite.add(engine.world, walls);
    };

    const place = () => {
      bodies.forEach((b, i) => {
        const el = els[i];
        el.style.transform = `translate3d(${b.position.x - S / 2}px, ${b.position.y - S / 2}px, 0) rotate(${b.angle}rad)`;
      });
    };

    const drop = () => {
      if (started) return;
      started = true;
      S = size();
      buildWalls();
      bodies = els.map((el, i) => {
        el.style.setProperty('--s', S + 'px');
        // caen hacia el centro para que se apilen
        const x = W * (.5 + (Math.random() - .5) * (W < 760 ? .7 : .42));
        const y = -S * (1 + i * 1.1) - Math.random() * 60;
        const b = Bodies.rectangle(x, y, S, S, { chamfer: { radius: S * .24 }, restitution: .35, friction: .4, frictionAir: .012, density: .002 });
        Body.setAngle(b, (Math.random() - .5) * 1.2);
        Body.setAngularVelocity(b, (Math.random() - .5) * .08);
        return b;
      });
      Composite.add(engine.world, bodies);
      if (reduced) { for (let k = 0; k < 400; k++) Engine.update(engine, 16); place(); return; }
      Runner.run(runner, engine); running = true;
    };

    Events.on(engine, 'afterUpdate', place);

    // agarrar y tirar (solo con mouse: en el celular no se traba el scroll)
    if (fine) {
      const mouse = Mouse.create(stage);
      mouse.element.removeEventListener('wheel', mouse.mousewheel);
      mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
      mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
      const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: .2, render: { visible: false } } });
      Composite.add(engine.world, mc);
      Events.on(mc, 'startdrag', () => stage.classList.add('is-drag'));
      Events.on(mc, 'enddrag', () => stage.classList.remove('is-drag'));
    } else {
      // en el celular, tocar una la hace saltar
      const tap = (e) => {
        const r = stage.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        bodies.forEach((b) => {
          const d = Math.hypot(b.position.x - x, b.position.y - y);
          if (d < S * 1.4) Body.applyForce(b, b.position, { x: (b.position.x - x) * .0004, y: -.06 * b.mass * 10 });
        });
      };
      stage.addEventListener('pointerdown', tap);
    }

    // caen cuando el footer aparece; fuera de pantalla la física se pausa
    const io = new IntersectionObserver((es) => {
      const vis = es[0].isIntersecting;
      if (vis && !started) drop();
      else if (vis && started && !running && !reduced) { Runner.run(runner, engine); running = true; }
      else if (!vis && running) { Runner.stop(runner); running = false; }
    }, { threshold: .25 });
    io.observe(stage);

    let rT = 0;
    const onResize = () => { clearTimeout(rT); rT = setTimeout(() => { if (!started) return; buildWalls(); bodies.forEach((b) => { if (b.position.x > W - S / 2) Body.setPosition(b, { x: W - S, y: b.position.y - 40 }); }); }, 150); };
    window.addEventListener('resize', onResize);

    return () => {
      io.disconnect(); window.removeEventListener('resize', onResize); clearTimeout(rT);
      Runner.stop(runner); Events.off(engine); Composite.clear(engine.world, false); Engine.clear(engine);
    };
  }, []);

  // el nombre gigante sube letra por letra
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from(bigRef.current.children, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: .045, scrollTrigger: { trigger: bigRef.current, start: 'top 98%', once: true } });
      gsap.from('.foot__cta > *', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: rootRef.current, start: 'top 80%', once: true } });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const scrollTo = (e, href) => {
    e.preventDefault();
    if (!isHome()) { goToPage('/' + href); return; }
    const el = document.querySelector(href);
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.6 }); else el.scrollIntoView({ behavior: 'smooth' });
  };

  const links = [['#trabajo', t.nav.work], ['#como', t.nav.how], ['#piero', t.nav.about], ['#precios', t.nav.pricing], ['#preguntas', t.nav.faq]];

  return (
    <footer className="foot" ref={rootRef}>
      <div className="wrap foot__cta">
        <h2>{f.big}</h2>
        <p>{f.lead}</p>
        <a className="foot__wa" href={waLink(t.sample.hello)} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={24} /><span>{f.wa}</span><i aria-hidden="true">→</i>
        </a>
      </div>

      <div className="foot__stage" ref={stageRef} data-cursor={f.play} aria-hidden="true">
        {TOOLS.map((tool, i) => <ToolTile key={tool.slug} tool={tool} tabIndex={-1} ref={(el) => { tileRefs.current[i] = el; }} />)}
      </div>

      <div className="wrap foot__cols">
        <div>
          <span className="foot__h">{f.nav}</span>
          {links.map(([h, l]) => <a key={h} href={h} onClick={(e) => scrollTo(e, h)}>{l}</a>)}
        </div>
        <div>
          <span className="foot__h">{f.social}</span>
          {SOCIALS.map((s) => <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">{s.name} ↗</a>)}
          <a href="/recursos/" onClick={(e) => { e.preventDefault(); if (isHome()) goToPage('/recursos/'); else window.__lenis?.scrollTo(0); }}>{f.resources}</a>
        </div>
        <div>
          <span className="foot__h">{f.contact}</span>
          <a href={waLink()} target="_blank" rel="noopener noreferrer">WhatsApp {WHATSAPP.display}</a>
          <div className="foot__lang">
            {LANGS.map((l) => <button key={l} type="button" className={l === lang ? 'on' : ''} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}
          </div>
        </div>
      </div>

      <div className="foot__big" ref={bigRef} aria-label="Piero D'Benedetto">
        {'PIERO'.split('').map((c, i) => <span key={i}>{c}</span>)}
      </div>
      <div className="wrap foot__legal">
        <span>© {new Date().getFullYear()} Piero D'Benedetto. {f.rights}</span>
        <span>@piero.ia</span>
      </div>
    </footer>
  );
}
