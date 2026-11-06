// Avisa cuando terminó la pantalla de carga, para que el hero arranque su entrada.
let done = false;
const subs = new Set();
export function loaderDone() { done = true; subs.forEach((f) => f()); subs.clear(); }
export function onLoaderDone(fn) {
  if (done) { fn(); return () => {}; }
  subs.add(fn);
  return () => subs.delete(fn);
}
