import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Odometer from '../components/Odometer.jsx';
import { PILOT, PLANS, CHANNELS, weekLayout } from '../data/plans.js';
import { fill } from '../i18n/texts.js';
import { getOffer, shortDate } from '../data/offer.js';
import { WORK } from '../data/work.js';
import { useLang } from '../i18n/LangContext.jsx';

gsap.registerPlugin(ScrollTrigger);

const THUMBS = WORK.filter((w) => w.type === 'anuncio').map((w) => w.src).concat(WORK.filter((w) => w.poster).map((w) => w.poster));

export default function Pricing() {
  const { t } = useLang();
  const pr = t.pricing;
  const tk = pr.ticket;
  const sectionRef = useRef(null);
  const ticketRef = useRef(null);
  const stampRef = useRef(null);
  const segRef = useRef(null);
  const [planIdx, setPlanIdx] = useState(Math.max(0, PLANS.findIndex((p) => p.recommended)));
  const [round, setRound] = useState(0); // cambia en cada elección para que las piezas vuelvan a caer
  const plan = PLANS[planIdx];
  const offer = getOffer();
  const pilotDeal = offer && offer.applies_to === 'pilot' ? offer : null;
  const planDeal = offer && offer.applies_to === plan.id ? offer : null;

  // entrada: el ticket llega y el sello cae con un golpe
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: ticketRef.current, start: 'top 75%', once: true } });
      tl.from(ticketRef.current, { y: 80, rotate: -3, opacity: 0, duration: 1.2, ease: 'expo.out' })
        .fromTo(stampRef.current, { scale: 2.4, rotate: -30, opacity: 0 }, { scale: 1, rotate: -12, opacity: 1, duration: .45, ease: 'power4.in' }, '-=.4')
        .to(ticketRef.current, { x: 4, duration: .05, yoyo: true, repeat: 3, ease: 'none' })
        .set(ticketRef.current, { x: 0 });
      gsap.from('.pricing__head > *, .plans__head > *', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // el indicador del selector se desliza hasta el plan elegido
  useLayoutEffect(() => {
    const box = segRef.current;
    const btn = box?.querySelectorAll('button')[planIdx];
    const thumb = box?.querySelector('.seg__thumb');
    if (!btn || !thumb) return;
    gsap.to(thumb, { x: btn.offsetLeft, width: btn.offsetWidth, duration: .6, ease: 'expo.out' });
  }, [planIdx, t]);

  useEffect(() => { setRound((r) => r + 1); }, [planIdx]);

  const pick = (i) => setPlanIdx(i);
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setPlanIdx((i) => Math.min(PLANS.length - 1, i + 1)); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setPlanIdx((i) => Math.max(0, i - 1)); }
  };

  const days = weekLayout(plan.perWeek);
  const byDay = pr.week.map((_, d) => days.map((dd, k) => (dd === d ? k : -1)).filter((k) => k >= 0));

  return (
    <section className="pricing" id="precios" ref={sectionRef}>
      <div className="wrap">
        <div className="pricing__head"><h2>{pr.title}</h2></div>

        {/* El piloto: una entrada con talón */}
        <div className="ticket" ref={ticketRef}>
          <div className="ticket__main">
            <div className="ticket__row">
              <span className="ticket__name">{tk.name}</span>
              <span className="ticket__once">{tk.once}</span>
            </div>
            {pilotDeal && <div className="deal"><span className="deal__badge">{t.offer.badge}</span><s>USD {PILOT.price}</s><span>{fill(t.offer.until, { date: shortDate(pilotDeal.until) })}</span></div>}
            <div className="ticket__price"><small>USD</small>{pilotDeal ? pilotDeal.price : PILOT.price}</div>
            <div className="ticket__facts">
              <span><b>{PILOT.pieces}</b> {tk.pieces}</span>
              <span><b>{PILOT.weeks}</b> {tk.weeks}</span>
            </div>
            <p className="ticket__inc">{tk.includes}</p>
            <p className="ticket__disc">{tk.discount}</p>
            <a className="btn btn--light" href="#muestra">{tk.cta} <span className="arr">→</span></a>
          </div>
          <div className="ticket__stub">
            <div className="ticket__admit"><span>{tk.admit}</span><b>{tk.admitV}</b></div>
            <p>{fill(tk.guarantee, { price: PILOT.price })}</p>
            <div className="ticket__code" aria-hidden="true">{Array.from({ length: 34 }, (_, i) => <i key={i} style={{ width: (i * 7) % 3 + 1 }} />)}</div>
            <span className="stamp" ref={stampRef}>{tk.stamp}</span>
          </div>
        </div>

        {/* Los planes: elegís cuántas piezas por semana */}
        <div className="plans">
          <div className="plans__head"><h3>{pr.plansTitle}</h3></div>
          <div className="plans__grid">
            <div className="plans__left">
              <div className="seg" ref={segRef} role="radiogroup" aria-label={pr.perWeek} onKeyDown={onKey}>
                <span className="seg__thumb" aria-hidden="true" />
                {PLANS.map((p, i) => (
                  <button key={p.id} type="button" role="radio" aria-checked={i === planIdx} tabIndex={i === planIdx ? 0 : -1} className={i === planIdx ? 'on' : ''} onClick={() => pick(i)}>
                    <b>{p.perWeek}</b><span>{pr.names[p.id]}</span>
                  </button>
                ))}
              </div>
              <p className="plans__per">{pr.perWeek} · <b>{plan.perWeek * 4}</b> {pr.perMonth}</p>

              {planDeal && <div className="deal deal--light"><span className="deal__badge">{t.offer.badge}</span><s>USD {plan.price}</s><span>{fill(t.offer.until, { date: shortDate(planDeal.until) })}</span></div>}
              <div className="plans__price">
                <small>USD</small>
                <Odometer value={planDeal ? planDeal.price : plan.price} />
                <span className="plans__month">{pr.month}</span>
                {plan.recommended && <span className="plans__rec">{pr.recommended}</span>}
              </div>

              <ul className="plans__list" key={plan.id}>
                <li>{pr.formats}</li>
                <li>{fill(pr.changes, { h: plan.changes }) + (plan.priority ? pr.priority : '')}</li>
                <li>{plan.publish ? pr.publishYes : pr.publishNo}</li>
              </ul>

              <div className="plans__channels">
                {Object.entries(CHANNELS).map(([k, label]) => (
                  <span key={k} className={plan.channels.includes(k) ? 'on' : ''}>{label}</span>
                ))}
              </div>
              <a className="btn" href="#muestra">{pr.cta} <span className="arr">→</span></a>
            </div>

            <div className="plans__week" aria-hidden="true">
              {pr.week.map((d, i) => (
                <div key={i} className="pday">
                  <span className="pday__d">{d}</span>
                  <div className="pday__col">
                    {byDay[i].map((k, j) => (
                      <img key={round + '-' + k} src={THUMBS[(k * 3 + i) % THUMBS.length]} alt="" style={{ animationDelay: `${(i * .06 + j * .12).toFixed(2)}s` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="plans__nocontract">{pr.noContract}</p>
        </div>
      </div>
    </section>
  );
}
