import React from 'react';
import ReactDOM from 'react-dom/client';
import Nav from './components/Nav.jsx';
import Cursor from './components/Cursor.jsx';
import ThreadsBackground from './components/ThreadsBackground.jsx';
import FloatingButtons from './components/FloatingButtons.jsx';
import PageCurtain from './components/PageCurtain.jsx';
import RecursosPage from './sections/RecursosPage.jsx';
import Footer from './sections/Footer.jsx';
import { LangProvider } from './i18n/LangContext.jsx';
import { useSmoothScroll } from './lib/useSmoothScroll.js';
import { loaderDone } from './lib/loaderSignal.js';
import './styles/global.css';

// Página aparte: /recursos
function App() {
  useSmoothScroll();
  React.useEffect(() => { loaderDone(); }, []);
  return (
    <LangProvider>
      <PageCurtain />
      <Cursor />
      <ThreadsBackground />
      <Nav page="recursos" />
      <main><RecursosPage /></main>
      <Footer />
      <FloatingButtons />
    </LangProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
