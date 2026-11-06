import { createContext, useContext, useEffect, useState } from 'react';
import { LANGS, TEXTS } from './texts.js';

const LangContext = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem('lang');
    if (LANGS.includes(saved)) return saved;
  } catch (_) { /* sin storage */ }
  const nav = (navigator.language || 'es').slice(0, 2);
  return LANGS.includes(nav) ? nav : 'es';
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang);
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch (_) { /* sin storage */ }
  }, [lang]);
  return <LangContext.Provider value={{ lang, setLang, t: TEXTS[lang] }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
