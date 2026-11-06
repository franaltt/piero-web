# Web de Piero D'Benedetto

React + Vite, con GSAP, Lenis y matter-js para las animaciones. Dos páginas: la landing (`/`) y Recursos gratis (`/recursos/`). Panel de edición en `/admin`.

## Arrancar en tu compu

```bash
npm install
npm run dev
```

Se abre en http://localhost:5173

## Dónde está cada cosa

- `content/` — **todo lo que Piero puede editar desde el panel** (textos, precios, oferta, números, trabajos, recursos). Son archivos JSON.
- `src/sections/` — una sección por archivo (Hero, Trabajo, Precios, RecursosPage…)
- `src/components/` — piezas reutilizables (Nav, intro, cursor, formulario de mail…)
- `src/styles/global.css` — colores, tipografía y estilos
- `public/admin/` — el panel (Decap CMS). `config.yml` se genera solo, ver abajo.
- `public/trabajos/`, `public/recursos/`, `public/img/`, `public/logos/` — imágenes y videos
- `originales/` — fotos sin optimizar (no se suben a GitHub)

## El panel (/admin)

Piero entra a `tusitio.netlify.app/admin`, inicia sesión con GitHub y edita. Cada vez que guarda, el cambio queda en GitHub y Netlify vuelve a publicar la web sola (1-2 minutos).

Probarlo en tu compu, sin GitHub:

```bash
npm run dev          # en una terminal
npx decap-server     # en otra
```

y abrís http://localhost:5173/admin/index.html — los cambios se guardan directo en `content/`.

Si agregás textos nuevos a `content/textos/*.json`, regenerá el panel:

```bash
python3 scripts/generar-panel.py
```

## Mailchimp (Recursos gratis)

En el panel → Recursos gratis → Mailchimp, pegá la URL del formulario de Mailchimp (Audience → Signup forms → Embedded forms → el `action` del form, algo como `https://xxxx.us21.list-manage.com/subscribe/post?u=...&id=...`). Cada guía tiene su etiqueta para armar una automatización que mande el PDF correcto.

Publicar: ver `PUBLICAR.md`.
