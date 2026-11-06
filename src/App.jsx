import Nav from './components/Nav.jsx';
import Loader from './components/Loader.jsx';
import Hero from './sections/Hero.jsx';
import Statement from './sections/Statement.jsx';
import Work from './sections/Work.jsx';
import Savia from './sections/Savia.jsx';
import Game from './sections/Game.jsx';
import How from './sections/How.jsx';
import About from './sections/About.jsx';
import Pricing from './sections/Pricing.jsx';
import Faq from './sections/Faq.jsx';
import Sample from './sections/Sample.jsx';
import Footer from './sections/Footer.jsx';
import FloatingButtons from './components/FloatingButtons.jsx';
import OfferToast from './components/OfferToast.jsx';
import PageCurtain from './components/PageCurtain.jsx';
import { useEffect } from 'react';
import { onLoaderDone } from './lib/loaderSignal.js';
import Cursor from './components/Cursor.jsx';
import ThreadsBackground from './components/ThreadsBackground.jsx';
import { LangProvider } from './i18n/LangContext.jsx';
import { useSmoothScroll } from './lib/useSmoothScroll.js';

export default function App() {
  useSmoothScroll();
  // si se llega con un #sección (por ejemplo desde Recursos), baja hasta esa sección
  useEffect(() => onLoaderDone(() => {
    const h = window.location.hash;
    if (!h || h.length < 2) return;
    setTimeout(() => {
      const el = document.querySelector(h);
      if (el) { if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.6 }); else el.scrollIntoView({ behavior: 'smooth' }); }
    }, 500);
  }), []);
  return (
    <LangProvider>
      <PageCurtain />
      <Loader />
      <Cursor />
      {/* Fondo de hilos: para sacarlo, borrar esta línea */}
      <ThreadsBackground />
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Work />
        <Savia />
        <Game />
        <How />
        <About />
        <Pricing />
        <Faq />
        <Sample />
      </main>
      <Footer />
      <FloatingButtons />
      <OfferToast />
    </LangProvider>
  );
}
