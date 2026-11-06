// Suscribe un mail a la lista de Mailchimp de Piero sin salir de la página.
// actionUrl: la dirección del formulario de Mailchimp (la que termina en /subscribe/post?u=…&id=…),
// se pega en el panel (/admin → Recursos → Mailchimp).
export function mailchimpSubscribe(actionUrl, fields) {
  return new Promise((resolve, reject) => {
    if (!actionUrl) { reject(Object.assign(new Error('Falta configurar Mailchimp'), { code: 'config' })); return; }
    const base = actionUrl.replace('/post?', '/post-json?').replace(/&amp;/g, '&');
    const cb = 'mc_' + Date.now() + '_' + Math.floor(Math.random() * 1e4);
    const params = new URLSearchParams();
    Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, v); });
    params.set('c', cb);
    const s = document.createElement('script');
    const timer = setTimeout(() => { cleanup(); reject(Object.assign(new Error('timeout'), { code: 'network' })); }, 12000);
    function cleanup() { clearTimeout(timer); delete window[cb]; s.remove(); }
    window[cb] = (res) => {
      cleanup();
      if (res.result === 'success') resolve({ already: false });
      else if (/already subscribed|ya está suscrito|già iscritto/i.test(res.msg || '')) resolve({ already: true });
      else reject(Object.assign(new Error(res.msg || 'error'), { code: 'mailchimp' }));
    };
    s.onerror = () => { cleanup(); reject(Object.assign(new Error('network'), { code: 'network' })); };
    s.src = base + (base.includes('?') ? '&' : '?') + params.toString();
    document.body.appendChild(s);
  });
}
export const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
