import { useEffect, useRef, useState } from 'react';
import WhatsAppIcon from './WhatsAppIcon.jsx';
import { waLink } from '../data/stats.js';
import { useLang } from '../i18n/LangContext.jsx';

// Botón de WhatsApp siempre visible y botón para volver arriba con un anillo que muestra cuánto bajaste.
export default function FloatingButtons() {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  const ring = useRef(null);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setShow(window.scrollY > window.innerHeight * .8);
      if (ring.current) ring.current.style.strokeDashoffset = String(138.2 * (1 - p));
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);
  const toTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.8 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className="fab">
      <button type="button" className={'fab__top' + (show ? ' is-on' : '')} onClick={toTop} aria-label={t.footer.top} tabIndex={show ? 0 : -1}>
        <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" className="fab__track" /><circle ref={ring} cx="24" cy="24" r="22" className="fab__ring" /></svg>
        <span aria-hidden="true">↑</span>
      </button>
      <a className="fab__wa" href={waLink(t.sample.hello)} target="_blank" rel="noopener noreferrer" aria-label={t.footer.wa}>
        <WhatsAppIcon size={26} />
        <span className="fab__wa-label">{t.footer.wa}</span>
      </a>
    </div>
  );
}
