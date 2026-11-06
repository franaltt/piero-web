import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Al mover el mouse sobre la zona, van quedando piezas que aparecen y se desvanecen (solo con mouse).
export default function ImageTrail({ images, targetRef, gap = 90 }) {
  const box = useRef(null);
  useEffect(() => {
    const zone = targetRef.current;
    if (!zone || !window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const imgs = [...box.current.children];
    let lx = null, ly = null, k = 0, z = 1;
    const move = (e) => {
      if (e.target.closest('a, button, .tw-pill')) return; // no tapa los links ni las fotos del texto
      const r = zone.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (lx !== null && Math.hypot(x - lx, y - ly) < gap) return;
      const dx = lx === null ? 0 : x - lx, dy = ly === null ? 0 : y - ly;
      lx = x; ly = y;
      const el = imgs[k++ % imgs.length];
      gsap.killTweensOf(el);
      gsap.set(el, { x: x - dx * .4, y: y - dy * .4, xPercent: -50, yPercent: -50, opacity: 1, scale: .6, rotate: (Math.random() - .5) * 14, zIndex: z++ });
      gsap.to(el, { x, y, scale: 1, duration: .6, ease: 'expo.out' });
      gsap.to(el, { opacity: 0, scale: .85, y: y + 30, duration: .7, ease: 'power2.in', delay: .55 });
    };
    zone.addEventListener('pointermove', move);
    return () => zone.removeEventListener('pointermove', move);
  }, [targetRef, gap]);
  return (
    <div className="trail" ref={box} aria-hidden="true">
      {images.map((src, i) => <img key={i} src={src} alt="" loading="lazy" />)}
    </div>
  );
}
