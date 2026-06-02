# Security architecture review — DataSeed daily reports portal

## Alcance revisado

Repositorio: `/opt/data/data_seed`  
Branch: `agent-landing-updates`  
Portal actual:

- `reports.html` con guard frontend `body data-require-auth="true"`.
- `js/gcp-firebase-auth.js` inicializa Firebase Auth Web SDK `12.14.0`, valida `allowedEmailDomains: ["dataseed.cl"]` en cliente y emite `dataseed:auth-ready`.
- `data/demeter-daily-report.json` es un asset estático generado desde `/opt/data/reports/report_*.md` por `scripts/export-demeter-daily-report.py`.
- No existen `firebase.json`, Cloud Functions, Firestore rules ni Storage rules en el repo.

Versiones verificadas por npm en 2026-06-02:

- `firebase`: `12.14.0`
- `firebase-tools`: `15.19.0`

## Hallazgo principal

La autenticación actual solo oculta la UI. No protege el dato privado.

Cualquier persona que conozca o adivine la URL puede solicitar directamente:

```text
https://dataseed.cl/data/demeter-daily-report.json
```

Firebase Hosting, Netlify, GitHub Pages u otro hosting estático sirven ese archivo antes de que el JavaScript de Firebase Auth pueda ejecutar una validación. Por lo tanto, la validación client-side de `allowedEmailDomains` no es un control de acceso real para el reporte.

## Riesgos concretos

### Crítico — JSON privado publicado como asset público

`data/demeter-daily-report.json` está dentro del árbol web público. El guard de `reports.html` no aplica a requests directos al JSON.

Impacto: exposición no autenticada del reporte diario.

### Alto — Validación de dominio solo en cliente

`js/gcp-firebase-auth.js` valida el dominio con:

```js
const domain = (user.email || '').split('@')[1] || '';
if (allowed.includes(domain)) return true;
```

Esto sirve para UX y redirección, pero no para autorización. El usuario puede modificar JS, llamar endpoints directamente o descargar assets estáticos.

### Alto — El reporte contiene metadata operativa sensible

El JSON actual incluye:

- Host interno.
- Rutas absolutas `/opt/data/...`.
- Rutas de sesiones WhatsApp y `creds.json`.
- Logs, DB state files, cron outputs.
- `rawMarkdown` completo.

Aunque no incluya el contenido de credenciales, sí expone topología, rutas y nombres de archivos sensibles. Eso aumenta superficie de ataque y facilita targeting.

### Medio — Registro de usuarios/password no recomendado para este caso

El login actual permite panel email/password y modo registro. Para “usuarios DataSeed en dataseed.cl”, el acceso principal debería ser Google Workspace corporativo. Email/password crea riesgos de cuentas con password débil, cuentas no verificadas, takeover y bypass del control corporativo si no hay enforcement server-side.

### Medio — Falta hardening web básico

No se observó configuración de Hosting con headers. Para un portal privado conviene definir:

- `Content-Security-Policy` estricta.
- `X-Frame-Options` o `frame-ancestors 'none'`.
- `Referrer-Policy`.
- `Cache-Control: no-store` para HTML del portal y responses privadas.

Esto no reemplaza autorización server-side, pero reduce impacto de XSS/clickjacking/filtración de URLs.

## Implementación segura recomendada para sitio estático + Firebase Hosting

### Decisión recomendada

Mantener el sitio como estático en Firebase Hosting, pero mover el reporte fuera de los assets públicos y servirlo mediante Firebase Hosting rewrite a Cloud Functions v2 o Cloud Run.

Flujo objetivo:

```text
reports.html estático
→ Firebase Auth Web SDK inicia sesión Google
→ cliente llama getIdToken()
→ fetch('/api/reports/demeter-daily', Authorization header with Firebase ID token)
→ Cloud Function verifica ID token con Firebase Admin SDK
→ valida email_verified + dominio dataseed.cl + proveedor Google
→ devuelve JSON privado con Cache-Control: no-store
```

Este es el patrón más directo y compatible con Firebase Hosting: Hosting sirve HTML/CSS/JS públicos, pero las rutas `/api/**` se reescriben a backend autenticado.

### Por qué no basta Firebase Hosting estático

Firebase Hosting no evalúa Firebase Auth por archivo estático. Las reglas de Firestore/Storage sí pueden evaluar `request.auth`, y Cloud Functions/Run pueden verificar ID tokens, pero un archivo estático bajo `/data/*.json` no tiene esa capa de autorización.

## Must-fix antes de publicar en producción

1. Eliminar `data/demeter-daily-report.json` del deploy público o dejarlo solo con datos demo/no sensibles.
2. Crear backend autenticado para el reporte:
   - Opción A recomendada: Cloud Functions v2 detrás de Firebase Hosting rewrite.
   - Opción B aceptable: Firestore con Security Rules.
   - Opción C aceptable: Cloud Storage con Firebase Security Rules, sin URLs públicas ni download tokens.
3. Cambiar `reports.html` para hacer fetch a `/api/reports/demeter-daily` enviando ID token, no a `data/demeter-daily-report.json`.
4. En backend, verificar siempre:
   - ID token válido con Admin SDK.
   - Token no revocado si el riesgo lo amerita: `verifyIdToken(token, true)`.
   - `email_verified === true`.
   - dominio normalizado exacto: `dataseed.cl`.
   - proveedor permitido: idealmente `google.com` para usuarios Google Workspace.
5. Deshabilitar registro abierto email/password para el portal interno, o mantenerlo solo si hay allowlist server-side por UID/custom claims.
6. Sanitizar el payload del reporte:
   - Remover `rawMarkdown` del response público/portal.
   - Remover rutas absolutas sensibles o mapearlas a categorías: `logs`, `cron`, `reports`, `system`.
   - No publicar nombres como `creds.json`, session IDs, DB internals ni directorios completos.
7. Agregar `firebase.json` con rewrites y headers de seguridad.
8. Asegurar que `js/firebase-config.js` no contenga secretos. Firebase web config puede estar público; service accounts nunca.

## Diseño concreto — Opción A: Cloud Functions v2 + Firebase Hosting rewrite

### Estructura propuesta

```text
firebase.json
functions/package.json
functions/index.js
reports.html
js/gcp-firebase-auth.js
```

El reporte real debe estar en un backend no público. Opciones:

- Cloud Storage privado: `gs://<bucket>/private-reports/demeter-latest.json`.
- Firestore document: `reports/demeterDailyLatest`.
- Secret/volume/config controlado por pipeline si el reporte se genera fuera de Firebase.

Para este portal, Cloud Storage privado es simple: el cron sube el JSON sanitizado a Storage con Firebase Admin/GCP credentials; la Function lo lee con Admin SDK y lo devuelve solo si el usuario está autorizado.

### `firebase.json` recomendado

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "functions/**",
      "data/demeter-daily-report.json"
    ],
    "rewrites": [
      { "source": "/api/reports/demeter-daily", "function": "getDemeterDailyReport" },
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "/reports.html",
        "headers": [
          { "key": "Cache-Control", "value": "no-store" },
          { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' https://www.gstatic.com https://www.googletagmanager.com 'unsafe-inline'; connect-src 'self' https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; img-src 'self' data: https:; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "X-Content-Type-Options", "value": "nosniff" }
        ]
      },
      {
        "source": "/api/**",
        "headers": [
          { "key": "Cache-Control", "value": "no-store" }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions"
  }
}
```

Nota: el `public: "."` funciona con la estructura actual, pero es mejor mover assets públicos a `public/` para evitar publicar docs/scripts/backups por accidente. Si no se reestructura, `ignore` debe ser estricto.

### Cloud Function v2 ejemplo

```js
const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');

if (!getApps().length) initializeApp();

const ALLOWED_DOMAIN = 'dataseed.cl';
const REPORT_OBJECT = 'private-reports/demeter-latest.json';

function unauthorized(res, status = 401, message = 'Unauthorized') {
  res.status(status).set('Cache-Control', 'no-store').json({ error: message });
}

exports.getDemeterDailyReport = onRequest({ region: 'us-central1' }, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') return unauthorized(res, 405, 'Method not allowed');

  const header = req.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return unauthorized(res);

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(match[1], true);
  } catch (_) {
    return unauthorized(res);
  }

  const email = String(decoded.email || '').toLowerCase();
  const domain = email.split('@').pop();
  const provider = decoded.firebase?.sign_in_provider;

  if (!decoded.email_verified) return unauthorized(res, 403, 'Email not verified');
  if (domain !== ALLOWED_DOMAIN) return unauthorized(res, 403, 'Domain not allowed');
  if (provider !== 'google.com') return unauthorized(res, 403, 'Provider not allowed');

  const bucket = getStorage().bucket();
  const [bytes] = await bucket.file(REPORT_OBJECT).download();
  const report = JSON.parse(bytes.toString('utf8'));

  res.json(report);
});
```

### Cambio cliente en `reports.html`

El cliente debe esperar `dataseed:auth-ready`, obtener el ID token y llamar al endpoint privado:

```js
async function loadReport() {
  const auth = window.DataseedAuth?.auth;
  const user = auth?.currentUser;
  if (!user) throw new Error('Missing authenticated user');

  const token = await user.getIdToken();
  const response = await fetch('/api/reports/demeter-daily', {
    method: 'GET',
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error('HTTP ' + response.status);
  const report = await response.json();
  // render existente
}
```

La validación client-side de dominio puede quedarse para UX, pero no debe considerarse seguridad.

## Diseño alternativo — Firestore con reglas

Si se prefiere no usar Functions, guardar el reporte sanitizado como documento Firestore y leerlo con SDK después de auth.

Reglas mínimas:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isDataseedUser() {
      return request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email.matches('(?i)^[^@]+@dataseed\\.cl$');
    }

    match /dailyReports/{reportId} {
      allow read: if isDataseedUser();
      allow write: if false;
    }
  }
}
```

Ventajas: menos backend.  
Desventajas: reglas por dominio son menos flexibles que backend/custom claims; el cliente accede directo a base de datos; para auditoría granular puede quedarse corto.

Mejor versión: asignar custom claim `reportViewer: true` a usuarios autorizados y validar `request.auth.token.reportViewer == true`.

## Diseño alternativo — Cloud Storage con reglas

Guardar `private-reports/demeter-latest.json` en Storage y leerlo con SDK. No generar URLs públicas de descarga.

Reglas mínimas:

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isDataseedUser() {
      return request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email.matches('(?i)^[^@]+@dataseed\\.cl$');
    }

    match /private-reports/{fileName} {
      allow read: if isDataseedUser();
      allow write: if false;
    }
  }
}
```

Advertencia: no usar download tokens públicos (`getDownloadURL`) si el objetivo es privacidad fuerte. Preferir SDK autenticado o Cloud Function proxy.

## Recomendaciones de Auth

### Configuración Firebase Auth

1. Authorized domains:
   - `dataseed.cl`
   - `www.dataseed.cl`
   - dominio Firebase Hosting usado en deploy, si aplica.
2. Sign-in methods:
   - Habilitar Google como principal.
   - Deshabilitar registro email/password para portal interno, salvo que exista allowlist server-side.
   - Microsoft solo si hay necesidad real.
3. En UI:
   - `enabledProviders: ["google"]` para producción interna.
   - `requireEmailVerification: true` si email/password queda habilitado.
4. En backend:
   - Nunca confiar en `allowedEmailDomains` del cliente.
   - Validar `email_verified`, dominio y proveedor o custom claim.

### Dominio vs custom claims

Dominio `@dataseed.cl` es un buen primer control para equipo interno. Para producción robusta, usar custom claims o una allowlist en Firestore:

- `reportViewer: true`
- `org: "dataseed"`
- `role: "admin" | "viewer"`

Así se puede revocar acceso a una persona aunque conserve correo corporativo.

## Validaciones exactas antes de darlo por seguro

### Checks de repo/build

```bash
# Confirmar branch y cambios
git status --short --branch

# Validar que no se despliegue el JSON público
test ! -f data/demeter-daily-report.json || grep -q 'data/demeter-daily-report.json' firebase.json

# Validar sintaxis JS
node --check js/gcp-firebase-auth.js
node --check functions/index.js

# Validar JSON config hosting
python3 -m json.tool firebase.json >/dev/null

# Validar que no hay secretos en config pública
grep -R "service_account\|private_key\|client_secret\|creds.json" -n js firebase.json functions || true
```

### Checks de deploy Firebase

```bash
# Login/permiso admin requerido
npx firebase-tools@15.19.0 projects:list

# Validar config antes de deploy
npx firebase-tools@15.19.0 deploy --only hosting,functions --dry-run

# Deploy real
npx firebase-tools@15.19.0 deploy --only hosting,functions
```

### Checks HTTP obligatorios

Sin sesión debe fallar:

```bash
curl -i https://dataseed.cl/data/demeter-daily-report.json
# Esperado: 404/403 o no contener reporte real. Nunca 200 con datos privados.

curl -i https://dataseed.cl/api/reports/demeter-daily
# Esperado: 401 Unauthorized.
```

Con token inválido debe fallar:

```bash
curl -i https://dataseed.cl/api/reports/demeter-daily \
  -H 'Authorization: Bearer BAD_ID_TOKEN'
# Esperado: 401 Unauthorized.
```

Con usuario autenticado fuera de dominio debe fallar:

```bash
ID_TOKEN='<id_token_usuario_no_dataseed>'
curl -i https://dataseed.cl/api/reports/demeter-daily \
  -H "Authorization: Bearer $ID_TOKEN"
# Esperado: 403 Domain not allowed.
```

Con usuario `@dataseed.cl` no verificado debe fallar:

```bash
ID_TOKEN='<id_token_email_no_verificado>'
curl -i https://dataseed.cl/api/reports/demeter-daily \
  -H "Authorization: Bearer $ID_TOKEN"
# Esperado: 403 Email not verified.
```

Con usuario Google Workspace `@dataseed.cl` válido debe pasar:

```bash
ID_TOKEN='<id_token_google_dataseed_verificado>'
curl -i https://dataseed.cl/api/reports/demeter-daily \
  -H "Authorization: Bearer $ID_TOKEN"
# Esperado: 200, Cache-Control: no-store, JSON sanitizado.
```

Validar headers:

```bash
curl -I https://dataseed.cl/reports.html
# Esperado: Cache-Control: no-store, CSP, X-Content-Type-Options, Referrer-Policy.

curl -I https://dataseed.cl/api/reports/demeter-daily
# Esperado: 401 y Cache-Control: no-store cuando no hay token.
```

Validar contenido del JSON:

```bash
curl -s https://dataseed.cl/api/reports/demeter-daily \
  -H "Authorization: Bearer $ID_TOKEN" \
  -o /tmp/report.json
jq . /tmp/report.json

# No debe devolver rutas/secretos/markdown crudo
grep -E "/opt/data|creds\.json|session-|state\.db|rawMarkdown" /tmp/report.json && echo "FAIL" || echo "OK"
```

### Checks Firebase Rules si se usa Firestore/Storage

```bash
npx firebase-tools@15.19.0 emulators:start --only firestore,storage
npx firebase-tools@15.19.0 emulators:exec --only firestore,storage "npm test"
```

Tests mínimos:

- `request.auth == null` no puede leer.
- `email_verified == false` no puede leer.
- `email` fuera de `dataseed.cl` no puede leer.
- `email` `usuario@dataseed.cl` verificado sí puede leer.
- Ningún cliente puede escribir reportes.

## Orden de ejecución recomendado

1. Sanitizar el generador para producir `demeter-daily-report.private.json` sin `rawMarkdown` ni rutas sensibles.
2. Subir ese JSON a Cloud Storage privado o Firestore.
3. Crear Cloud Function `getDemeterDailyReport` con validación Admin SDK.
4. Agregar `firebase.json` con rewrite `/api/reports/demeter-daily` e ignore del JSON público.
5. Cambiar `reports.html` para consumir API con header `Authorization: Bearer <Firebase ID token>`.
6. Configurar Firebase Auth: Google provider, authorized domains, email/password off para producción.
7. Ejecutar validaciones HTTP negativas y positivas.
8. Solo después publicar el portal en `dataseed.cl`.

## Resumen ejecutivo en español

El portal actual permite login con Firebase Auth, pero no protege realmente el reporte porque `data/demeter-daily-report.json` es un archivo estático público. La validación de dominio `dataseed.cl` ocurre en JavaScript del navegador y sirve como UX, no como autorización. Antes de producción, el reporte debe salir del hosting estático público y servirse desde un backend o base con reglas que verifique el ID token de Firebase en servidor.

La solución recomendada es mantener Firebase Hosting para el sitio estático y agregar una Cloud Function detrás de `/api/reports/demeter-daily`. `reports.html` obtiene el ID token del usuario y llama esa API. La Function valida token, email verificado, dominio exacto `dataseed.cl` y proveedor Google, y recién entonces devuelve un JSON sanitizado. Además, hay que eliminar `rawMarkdown` y rutas sensibles del reporte, desactivar registro abierto email/password para el portal interno y agregar headers de seguridad.
