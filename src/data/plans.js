// Precios: se editan desde el panel (/admin → Precios). Viven en /content/precios.json
import precios from '../../content/precios.json';

export const PILOT = precios.pilot;
export const PLANS = precios.plans;

export const CHANNELS = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube Shorts', linkedin: 'LinkedIn' };

// En qué día cae cada pieza de la semana (0 = lunes) según cuántas por semana
export const WEEK_LAYOUT = { 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6], 8: [0, 1, 2, 3, 4, 5, 1, 3], 10: [0, 1, 2, 3, 4, 5, 6, 1, 3, 5] };
export const weekLayout = (n) => WEEK_LAYOUT[n] || Array.from({ length: n }, (_, i) => i % 7);
