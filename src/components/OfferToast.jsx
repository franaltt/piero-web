import { useEffect, useState } from 'react';
import { getOffer, shortDate } from '../data/offer.js';
import { onLoaderDone } from '../lib/loaderSignal.js';
import { fill } from '../i18n/texts.js';
import { useLang } from '../i18n/LangContext.jsx';

// Aviso flotante de la oferta (abajo a la izquierda). Aparece después de la intro y se puede cerrar.
const KEY = 'piero-offer-closed';
export default function OfferToast() {
  const { t, lang } = useLang();
  const offer = getOffer();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!offer) return;
    let closed = false;
    try { closed = sessionStorage.getItem(KEY) === offer.until + offer.price; } catch (_) { /* sin storage */ }
    if (closed) return;
    let tm = 0;
    const off = onLoaderDone(() => { tm = setTimeout(() => setShow(true), 1800); });
    return () => { off(); clearTimeout(tm); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!offer || !show) return null;
  const close = () => { setShow(false); try { sessionStorage.setItem(KEY, offer.until + offer.price); } catch (_) { /* sin storage */ } };
  const vars = { price: offer.price, regular: offer.regular, until: shortDate(offer.until) };
  const target = offer.applies_to === 'pilot' ? '#precios' : '#precios';
  const go = (e) => {
    e.preventDefault(); close();
    const el = document.querySelector(target);
    if (window.__lenis && el) window.__lenis.scrollTo(el, { duration: 1.6 }); else el?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <aside className="offer" role="status">
      <span className="offer__badge">{t.offer.badge}</span>
      <b className="offer__title">{offer.title[lang] || offer.title.es}</b>
      <p>{fill(offer.text[lang] || offer.text.es, vars)}</p>
      <div className="offer__row">
        <a className="btn btn--sm" href={target} onClick={go}>{offer.cta[lang] || offer.cta.es} <span className="arr">→</span></a>
        <span className="offer__until">{fill(t.offer.until, { date: shortDate(offer.until) })}</span>
      </div>
      <button type="button" className="offer__close" onClick={close} aria-label={t.offer.close}>✕</button>
    </aside>
  );
}
