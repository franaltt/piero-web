import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLang } from '../i18n/LangContext.jsx';
import { LANGS } from '../i18n/texts.js';
import { goToPage } from '../lib/pageTransition.js';

const scrollToHash = (href) => {
  const el = href === '#top' ? document.body : document.querySelector(href);
  if (!el) return;
  if (href === '#top') { if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
};

export default function Nav({ page = 'home' }) {
  const home = page === 'home';
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState(null);
  const [hover, setHover] = useState(null);
  const [open, setOpen] = useState(false);
  const capsule = useRef(null);
  const blob = useRef(null);
  const langRef = useRef(null);
  const overlay = useRef(null);

  const links = [
    ['#trabajo', t.nav.work],
    ['#como', t.nav.how],
    ['#piero', t.nav.about],
    ['#precios', t.nav.pricing],
    ['#preguntas', t.nav.faq],
    ['/recursos/', t.nav.resources],
  ];

  // se esconde al bajar y aparece al subir
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (Math.abs(y - last) > 6) { setHidden(y > last && y > 400); last = y; }
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // marca la sección en la que estás
  useEffect(() => {
    if (!home) { setActive('/recursos/'); return undefined; }
    const ids = links.filter(([h]) => h.startsWith('#')).map(([h]) => h.slice(1));
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setActive('#' + e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    const top = () => { if (window.scrollY < window.innerHeight * .5) setActive(null); };
    
    window.addEventListener('scroll', top, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', top); };
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // el resaltado se desliza hasta el link con el mouse encima, o el de la sección activa
  useLayoutEffect(() => {
    const target = hover || active;
    const b = blob.current;
    if (!b || !capsule.current) return;
    const a = target && capsule.current.querySelector(`a[href="${target}"]`);
    if (!a) { gsap.to(b, { opacity: 0, scale: .8, duration: .3 }); return; }
    const c = capsule.current.getBoundingClientRect(), r = a.getBoundingClientRect();
    gsap.to(b, { x: r.left - c.left, width: r.width, opacity: 1, scale: 1, duration: .55, ease: 'expo.out' });
  }, [hover, active, lang]);

  // indicador del idioma
  useLayoutEffect(() => {
    const box = langRef.current;
    if (!box) return;
    const btn = box.querySelector('button.on'), thumb = box.querySelector('.lang__thumb');
    if (!btn || !thumb) return;
    gsap.to(thumb, { x: btn.offsetLeft, width: btn.offsetWidth, duration: .5, ease: 'expo.out' });
  }, [lang]);

  // menú de pantalla completa (celular)
  useEffect(() => {
    // el scroll se frena con el menú abierto y vuelve siempre al cerrarlo
    if (!open) { window.__lenis?.start(); document.documentElement.style.overflow = ''; return; }
    window.__lenis?.stop(); document.documentElement.style.overflow = 'hidden';
    if (!overlay.current) return;
    {
      gsap.fromTo(overlay.current, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .7, ease: 'expo.inOut' });
      gsap.fromTo(overlay.current.querySelectorAll('.mnav__links a, .mnav__foot > *'), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: .06, delay: .3 });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);

  const go = (e, href) => {
    e.preventDefault(); setOpen(false);
    // a la otra página, con cortina
    if (href.startsWith('/recursos')) { if (home) goToPage(href); else scrollToHash('#top'); return; }
    if (!home) { goToPage('/' + (href === '#top' ? '' : href)); return; }
    setTimeout(() => scrollToHash(href), open ? 350 : 0);
  };

  return (
    <>
      <header className={'nav' + (scrolled ? ' is-scrolled' : '') + (hidden && !open ? ' is-hidden' : '') + (open ? ' is-menu' : '')}>
        <div className="wrap nav__in">
          <a className="logo" href="#top" onClick={(e) => go(e, '#top')}>
            <span className="logo__hang" aria-hidden="true"><i className="logo__rope" /><i className="logo__tile" /></span>
            Piero D'Benedetto
          </a>

          <nav className="nav__capsule" ref={capsule} onMouseLeave={() => setHover(null)} aria-label="Principal">
            <span className="nav__blob" ref={blob} aria-hidden="true" />
            {links.map(([href, label]) => (
              <a key={href} href={href} className={active === href ? 'on' : ''} onMouseEnter={() => setHover(href)} onClick={(e) => go(e, href)}>{label}</a>
            ))}
          </nav>

          <div className="nav__right">
            <div className="lang" ref={langRef} role="group" aria-label="Idioma">
              <span className="lang__thumb" aria-hidden="true" />
              {LANGS.map((l) => (
                <button key={l} type="button" className={l === lang ? 'on' : ''} aria-pressed={l === lang} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
              ))}
            </div>
            <a className="btn btn--sm nav__cta" href="#muestra" onClick={(e) => go(e, '#muestra')}>{t.nav.cta} <span className="arr">→</span></a>
            <button type="button" className={'nav__burger' + (open ? ' is-open' : '')} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mnav">
              <span>{open ? t.nav.close : t.nav.menu}</span><i /><i />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="mnav" id="mnav" ref={overlay}>
          <nav className="mnav__links wrap" aria-label="Principal">
            {links.map(([href, label], i) => (
              <a key={href} href={href} onClick={(e) => go(e, href)}><sup>{String(i + 1).padStart(2, '0')}</sup>{label}</a>
            ))}
          </nav>
          <div className="mnav__foot wrap">
            <a className="btn btn--light" href="#muestra" onClick={(e) => go(e, '#muestra')}>{t.nav.cta} <span className="arr">→</span></a>
            <div className="mnav__lang">
              {LANGS.map((l) => (
                <button key={l} type="button" className={l === lang ? 'on' : ''} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
