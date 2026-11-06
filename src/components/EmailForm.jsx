import { useState } from 'react';
import { mailchimpSubscribe, validEmail } from '../lib/mailchimp.js';
import recursos from '../../content/recursos.json';

// Campo de mail + botón. Manda a Mailchimp con la etiqueta de la guía (si tiene).
export default function EmailForm({ labels, tag, guide, button, dark, autoFocus, compact }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | ok | already | error | invalid
  const submit = async (e) => {
    e.preventDefault();
    if (!validEmail(email)) { setState('invalid'); return; }
    setState('sending');
    const mc = recursos.mailchimp || {};
    const fields = { EMAIL: email };
    if (tag) fields.tags = tag;
    if (mc.guide_field && guide) fields[mc.guide_field] = guide;
    try { const r = await mailchimpSubscribe(mc.url, fields); setState(r.already ? 'already' : 'ok'); }
    catch (_) { setState('error'); }
  };
  if (state === 'ok' || state === 'already') return <p className={'mform__ok' + (dark ? ' is-dark' : '')}>✓ {labels[state]}</p>;
  return (
    <form className={'mform' + (dark ? ' mform--dark' : '')} onSubmit={submit} noValidate>
      <div className="mform__row">
        <input type="email" inputMode="email" autoComplete="email" placeholder={labels.email} aria-label={labels.email} value={email} autoFocus={autoFocus}
          onChange={(e) => { setEmail(e.target.value); if (state !== 'sending') setState('idle'); }} />
        {compact
          ? <button type="submit" className="mform__go" disabled={state === 'sending'} aria-label={button}>{state === 'sending' ? '…' : '→'}</button>
          : <button type="submit" className="btn btn--sm" disabled={state === 'sending'}>{state === 'sending' ? labels.sending : button} <span className="arr">→</span></button>}
      </div>
      {(state === 'error' || state === 'invalid') && <p className="mform__err">{labels[state]}</p>}
    </form>
  );
}
