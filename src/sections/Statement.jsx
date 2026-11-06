import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOOLS, STATEMENT_TOOLS } from '../data/tools.js';
import ToolTile from '../components/ToolTile.jsx';
import { useLang } from '../i18n/LangContext.jsx';

gsap.registerPlugin(ScrollTrigger);

// Parte la frase en palabras y huecos: "foto {0} {1} sale" → [palabra, hueco 0, hueco 1, palabra]
function tokenize(text) {
  const out = [];
  text.split(' ').forEach((tok) => {
    const m = tok.match(/^\{(\d)\}(.*)$/);
    if (m) {
      // la puntuación pegada al hueco ("{4}:") viaja con él para que no quede sola en otra línea
      out.push({ type: 'slot', i: +m[1], tail: m[2] || '' });
    } else out.push({ type: 'word', text: tok });
  });
  return out;
}

export default function Statement() {
  const { t, lang } = useLang();
  const sectionRef = useRef(null);
  const tokens = tokenize(t.statement);
  const plain = t.statement.replace(/\s*\{\d\}/g, '');

  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('[data-tok]', sectionRef.current);
      // la sección se fija arriba…
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => '+=' + window.innerHeight * 1.5,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
      // …pero la frase empieza a encenderse antes, mientras sube (así nunca se ve vacía)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          end: () => '+=' + window.innerHeight * (1.5 + .65),
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      let at = 0;
      items.forEach((el, k) => {
        if (el.dataset.tok === 'word') {
          tl.fromTo(el, { opacity: .2 }, { opacity: 1, duration: .5, ease: 'none' }, at);
          at += .22;
        } else {
          const drop = el.querySelector('.slot__drop');
          const rope = el.querySelector('.slot__rope');
          const dir = k % 2 ? 1 : -1;
          tl.fromTo(drop, { y: () => -window.innerHeight, rotate: 14 * dir },
            { y: 0, rotate: 0, duration: 1, ease: 'back.out(1.4)' }, at);
          tl.fromTo(rope, { opacity: 1 }, { opacity: 0, duration: .25, ease: 'none' }, at + .85);
          tl.fromTo(el, { '--ring': 1 }, { '--ring': 0, duration: .2, ease: 'none' }, at + .8);
          at += .45;
        }
      });
      tl.to({}, { duration: .6 }); // un respiro al final con la frase completa
    }, sectionRef);
    return () => ctx.revert();
  }, [lang]);

  return (
    <section className="statement" ref={sectionRef} aria-label={plain}>
      <div className="wrap">
        <p className="statement__text" aria-hidden="true">
          {tokens.map((tok, k) =>
            tok.type === 'word' ? (
              <span key={k}><span className="statement__w" data-tok="word">{tok.text}</span>{' '}</span>
            ) : (
              <span key={k}>
                <span className="slot-group">
                  <span className="slot" data-tok="slot">
                    <span className="slot__drop">
                      <span className="slot__rope" />
                      <ToolTile tool={TOOLS.find((x) => x.slug === STATEMENT_TOOLS[tok.i])} tabIndex={-1} />
                    </span>
                  </span>
                  {tok.tail && <span className="statement__w" data-tok="word">{tok.tail}</span>}
                </span>{' '}
              </span>
            )
          )}
        </p>
      </div>
    </section>
  );
}
