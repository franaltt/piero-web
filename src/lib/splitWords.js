// Envuelve cada palabra en una máscara para animarla de abajo hacia arriba.
export function splitWords(el) {
  if (el.dataset.split === 'done') return el.querySelectorAll('.wm > span');
  const walk = (node, out) => {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { out.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'wm';
          const i = document.createElement('span'); i.textContent = part;
          w.appendChild(i); out.appendChild(w);
        });
      } else if (n.nodeType === 1) {
        const c = n.cloneNode(false); walk(n, c); out.appendChild(c);
      }
    });
  };
  const frag = document.createDocumentFragment();
  walk(el, frag);
  el.textContent = '';
  el.appendChild(frag);
  el.dataset.split = 'done';
  return el.querySelectorAll('.wm > span');
}
