import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { arrivedWithCurtain } from '../lib/pageTransition.js';

// Si llegaste desde la otra página, la cortina negra se levanta y muestra esta.
export default function PageCurtain() {
  const [on] = useState(() => arrivedWithCurtain());
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!on) return;
    const el = document.querySelector('.curtain--in');
    gsap.to(el, { yPercent: -100, duration: .9, ease: 'expo.inOut', delay: .15, onComplete: () => setGone(true) });
  }, [on]);
  if (!on || gone) return null;
  return <div className="curtain curtain--in" aria-hidden="true"><span className="curtain__mark"><i /><i /></span></div>;
}
