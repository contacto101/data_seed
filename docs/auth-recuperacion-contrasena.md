# Recuperación de contraseña (portal y Pública)

Estado al 2026-09-29.

## Flujo

1. «¿Olvidaste tu contraseña?» llama a `POST /api/auth/forgot-password` (portal)
   o `POST /api/auth/publica/forgot-password` (Pública). El servidor pide a
   Supabase `POST /auth/v1/recover` con `redirect_to`:
   - portal: `${APP_ORIGIN}/site/login.html?recovery=1`
   - Pública: `${APP_ORIGIN}/publica-login?recovery=1`
2. `/recover` se llama sin `code_challenge`, así que Supabase usa el **flujo
   implícito**: el enlace del correo pasa por `/auth/v1/verify` y vuelve a
   `redirect_to#access_token=…&refresh_token=…&type=recovery`. Si el enlace
   venció o ya se usó, vuelve con `#error=…&error_code=otp_expired`.
3. La página de login lee el fragmento, lo borra de la barra de direcciones
   (`history.replaceState`) y muestra «Define tu contraseña nueva». El token
   queda en una variable de la página; no va a `localStorage` ni a cookies.
4. El formulario manda `{ access_token, password }` a
   `POST /api/auth/reset-password` o `POST /api/auth/publica/reset-password`
   (mismo origen). El servidor hace `PUT /auth/v1/user { password }` con ese
   token, revoca la sesión (`/auth/v1/logout`, que sin `scope` cierra todas las
   del usuario) y borra las cookies de sesión de ese navegador.
5. La página vuelve al login con el correo ya escrito. El usuario entra con la
   contraseña nueva por el login normal, que valida organización y membresía.

Código: `api/auth/_lib/password-reset.js` (lógica compartida),
`api/auth/reset-password.js`, `api/auth/_lib/publica-handlers/reset-password.js`,
`site/login.js`, `site/publica-login.js`.

No se usó PKCE a propósito: exige que el correo se abra en el mismo navegador
que pidió el enlace (la cookie con el verifier vive ahí). Abrir el correo en el
teléfono después de pedirlo en el computador fallaría.

## Redirect URLs de Supabase

Se configuran en el dashboard: Authentication → URL Configuration → Redirect
URLs. Es un cambio de configuración que hace una persona con acceso al
proyecto; no se hace desde el repositorio.

Medido el 2026-09-29 con una sonda a `/auth/v1/verify` con un token inválido:
GoTrue devuelve 303 al `redirect_to` si está permitido y al Site URL
(`https://dataseed.cl`, la landing) si no.

| Origen | ¿Permitido hoy? | Qué agregar |
|---|---|---|
| `https://dataseed.cl/...` (apex, cualquier ruta) | Sí | Nada. Si se reescribe la lista, conservar `https://dataseed.cl/**`. |
| `https://www.dataseed.cl/...` | **No**, cae a la landing | `https://www.dataseed.cl/**` |
| Previews de Vercel (`*.vercel.app`) | **No**, caen a la landing | `https://data-seed-*-<equipo>.vercel.app/**`, con el sufijo de equipo que muestra el comentario de Vercel en cada PR |
| `http://localhost:<puerto>` | No | `http://localhost:3000/**` solo si se prueba en local |

`www` hoy no muerde si `APP_ORIGIN` está fijado al apex en producción, porque el
servidor arma el `redirect_to` con `APP_ORIGIN` antes que con el `Origin` del
navegador. Agregarlo protege el día que `APP_ORIGIN` falte o cambie.

En los previews, además de la allowlist, `APP_ORIGIN` del entorno Preview de
Vercel tiene que estar vacío o apuntar al propio preview: si apunta al apex, el
correo pedido desde el preview devuelve al usuario a producción.

## Si el correo sigue llevando a la landing

Revisar en este orden:

1. Desde qué origen se pidió el correo (apex, `www` o un preview). Solo el
   apex está permitido hoy.
2. Si el correo se disparó desde el dashboard de Supabase (Users → Send
   password recovery): ese botón usa el Site URL como destino, no nuestro
   `redirect_to`.
3. La plantilla «Reset Password» (Authentication → Email Templates) debe usar
   `{{ .ConfirmationURL }}`. Si enlaza a `{{ .SiteURL }}`, siempre lleva a la
   landing.
4. `auth_logs` del proyecto, filtrando `/verify` a la hora del intento: el
   `referer` muestra el destino que GoTrue aceptó.
