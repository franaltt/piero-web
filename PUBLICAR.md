# Publicar en Netlify + panel para Piero

Se hace una sola vez. Unos 10 minutos.

## 1. Repo en GitHub
Ya está en `github.com/franaltt/piero-web`.

## 2. Conectar Netlify
1. app.netlify.com → **Add new site → Import an existing project → GitHub** → elegí `piero-web`.
2. Netlify lee `netlify.toml` solo (build `npm run build`, carpeta `dist`). **Deploy**.
3. Opcional: Site configuration → Change site name (ej. `piero-dbenedetto`) o conectá un dominio propio.

## 3. Login con GitHub para el panel
1. GitHub → Settings → Developer settings → **OAuth Apps → New OAuth App**
   - Application name: `Panel Piero`
   - Homepage URL: la URL de Netlify del sitio
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. Copiá el **Client ID** y generá un **Client secret**.
3. Netlify → tu sitio → **Site configuration → Access & security → OAuth → Install provider → GitHub** → pegá ID y secret.

## 4. Darle acceso a Piero
GitHub → repo `piero-web` → Settings → **Collaborators → Add people** → su usuario de GitHub (si no tiene, que se cree uno gratis). Acepta la invitación por mail y listo.

Piero entra a `https://<sitio>.netlify.app/admin`, toca **Iniciar sesión con GitHub**, y edita.

## Qué puede cambiar Piero
- **Precios y ofertas**: precio del piloto, los 3 planes, y la oferta (activar, precio, fecha de fin, texto). La oferta se apaga sola cuando pasa la fecha.
- **Números, contacto y trabajos**: clientes, piezas, redes, WhatsApp, los trabajos del carrusel.
- **Recursos gratis**: guías, la skill IRIS, URL de Mailchimp.
- **Textos de la web**: todo, en español, italiano e inglés.
