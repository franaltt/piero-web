import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Visor en grande: crece desde la tarjeta que tocaste y se cierra con Esc, con la X o deslizando hacia abajo.
export default function Lightbox({ item, fromRect, labels, caption, onClose, onPrev, onNext }) {
  const wrap = useRef(null);
  const media = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.__lenis?.stop();
    const m = media.current;
    if (!reduced && fromRect) {
      const r = m.getBoundingClientRect();
      gsap.fromTo(m,
        { x: fromRect.left + fromRect.width / 2 - (r.left + r.width / 2), y: fromRect.top + fromRect.height / 2 - (r.top + r.height / 2), scale: fromRect.width / r.width, borderRadius: 18 },
        { x: 0, y: 0, scale: 1, borderRadius: 14, duration: .7, ease: 'expo.out' });
      gsap.fromTo(wrap.current, { backgroundColor: 'rgba(12,12,13,0)' }, { backgroundColor: 'rgba(12,12,13,.92)', duration: .5 });
      gsap.fromTo('.lb__ui', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, delay: .25, stagger: .05 });
    }
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', key);
    wrap.current.querySelector('.lb__close')?.focus();
    return () => { window.removeEventListener('keydown', key); window.__lenis?.start(); };
  }, [item]); // eslint-disable-line react-hooks/exhaustive-deps

  // deslizar hacia abajo para cerrar (celular)
  useEffect(() => {
    const m = media.current;
    let sy = null, dy = 0;
    const down = (e) => { sy = e.clientY; dy = 0; };
    const move = (e) => { if (sy === null) return; dy = Math.max(0, e.clientY - sy); m.style.transform = `translateY(${dy}px) scale(${1 - dy / 1600})`; wrap.current.style.backgroundColor = `rgba(12,12,13,${.92 - dy / 600})`; };
    const up = () => { if (sy === null) return; sy = null; if (dy > 120) onClose(); else { gsap.to(m, { y: 0, scale: 1, duration: .4, ease: 'expo.out', clearProps: 'transform' }); wrap.current.style.backgroundColor = ''; } };
    m.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    return () => { m.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [onClose]);

  const isVideo = item.type !== 'anuncio';
  return (
    <div className="lb" ref={wrap} role="dialog" aria-modal="true" aria-label={caption} onClick={(e) => { if (e.target === wrap.current) onClose(); }}>
      <div className="lb__media" ref={media}>
        {isVideo ? (
          <video key={item.id} src={item.src} poster={item.poster} autoPlay loop playsInline controls={item.type === 'casero'} muted={item.type !== 'casero'} />
        ) : (
          <img key={item.id} src={item.src} alt={caption} />
        )}
      </div>
      <div className="lb__bar lb__ui">
        <span>{caption}</span>
        {item.type === 'casero' && <span className="lb__sound">{labels.sound}</span>}
      </div>
      <button type="button" className="lb__close lb__ui" onClick={onClose} aria-label={labels.close}>✕</button>
      <button type="button" className="lb__nav lb__nav--prev lb__ui" onClick={onPrev} aria-label={labels.prev}>←</button>
      <button type="button" className="lb__nav lb__nav--next lb__ui" onClick={onNext} aria-label={labels.next}>→</button>
    </div>
  );
}
