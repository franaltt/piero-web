// Transición entre páginas (inicio ⇄ recursos): una cortina negra tapa la pantalla,
// cambia la página y en la nueva la cortina se levanta.
import { gsap } from 'gsap';

const KEY = 'piero-curtain';
let arrived = null;

// ¿Llegamos a esta página desde la otra con la cortina? (se lee una sola vez)
export function arrivedWithCurtain() {
  if (arrived === null) {
    try { arrived = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch (_) { arrived = false; }
  }
  return arrived;
}

export function goToPage(url) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { window.location.href = url; return; }
  try { sessionStorage.setItem(KEY, '1'); } catch (_) { /* sin storage */ }
  const el = document.createElement('div');
  el.className = 'curtain';
  el.innerHTML = '<span class="curtain__mark"><i></i><i></i></span>';
  document.body.appendChild(el);
  gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: .7, ease: 'expo.inOut', onComplete: () => { window.location.href = url; } });
}

export const isHome = () => !window.location.pathname.startsWith('/recursos');
