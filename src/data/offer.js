// Oferta: se prende, se apaga y se edita desde el panel (/admin → Oferta).
// Vive en /content/oferta.json. Cuando pasa la fecha "until", se apaga sola.
import o from '../../content/oferta.json';
import { PILOT, PLANS } from './plans.js';

const today = () => new Date().toISOString().slice(0, 10);

export function getOffer() {
  if (!o.active) return null;
  if (o.until && today() > o.until) return null;
  const regular = o.applies_to === 'pilot' ? PILOT.price : PLANS.find((p) => p.id === o.applies_to)?.price;
  if (!regular || !o.price) return null;
  return { ...o, regular };
}

// 2026-11-30 → 30/11
export const shortDate = (iso) => (iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : '');
