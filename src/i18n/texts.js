// Los textos de la web viven en /content/textos/<idioma>.json
// y se editan desde el panel (/admin). Este archivo solo los junta.
import es from '../../content/textos/es.json';
import it from '../../content/textos/it.json';
import en from '../../content/textos/en.json';

export const LANGS = ['es', 'it', 'en'];
export const TEXTS = { es, it, en };

// "Cambios en hasta {h} h" → "Cambios en hasta 24 h"
export const fill = (str, vars) => String(str || '').replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
