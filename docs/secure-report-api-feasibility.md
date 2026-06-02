# Revisión de factibilidad — API segura `/api/daily-report`

## Conclusión

Es factible implementar el endpoint autenticado con cambios pequeños, pero no basta con cambiar el `fetch()` del frontend: el JSON actual `data/demeter-daily-report.json` queda público si Firebase Hosting publica la raíz del repo. Para que la protección sea real, el reporte debe dejar de servirse como asset estático y pasar a leerse desde Cloud Functions, validando el Firebase ID token con Admin SDK y restringiendo el dominio `dataseed.cl`.

## Estado actual observado

- No existen `firebase.json`, `.firebaserc`, `functions/` ni `package.json` en el repo.
- El sitio es HTML/JS estático.
- `reports.html` espera el evento `dataseed:auth-ready`, pero luego carga `data/demeter-daily-report.json` sin token.
- `js/gcp-firebase-auth.js` valida sesión en frontend y dominio permitido, pero esa validación no protege archivos estáticos.
- `docs/daily-report-portal.md` ya documenta este riesgo y recomienda Firebase Hosting + Cloud Functions como siguiente paso.

## Cambios mínimos recomendados

### 1) Crear `firebase.json`

Configura Hosting para publicar la raíz estática y reescribir `/api/daily-report` hacia una Function. También excluye el JSON privado para que no quede público.

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      ".firebaserc",
      "functions/**",
      "docs/**",
      "scripts/**",
      "data/demeter-daily-report.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/daily-report",
        "function": "dailyReport"
      }
    ],
    "headers": [
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

Nota: si se quiere publicar solo un directorio limpio, conviene migrar los assets estáticos a `public/`, pero eso ya no sería el cambio mínimo.

### 2) Crear `.firebaserc` opcional

Solo si ya se conoce el project id Firebase/GCP real:

```json
{
  "projects": {
    "default": "REPLACE_WITH_FIREBASE_PROJECT_ID"
  }
}
```

Si no se conoce, puede omitirse y usar `--project <project-id>` en comandos.

### 3) Crear `functions/package.json`

```json
{
  "name": "dataseed-secure-report-api",
  "private": true,
  "main": "index.js",
  "engines": {
    "node": "22"
  },
  "dependencies": {
    "firebase-admin": "^13.6.0",
    "firebase-functions": "^6.4.0"
  },
  "scripts": {
    "check": "node --check index.js"
  }
}
```

### 4) Crear `functions/index.js`

```js
const fs = require('node:fs/promises');
const path = require('node:path');
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

const ALLOWED_DOMAIN = 'dataseed.cl';
const REPORT_PATH = path.join(__dirname, 'data', 'demeter-daily-report.json');

function sendJson(res, status, payload) {
  res.set('Cache-Control', 'no-store');
  res.status(status).json(payload);
}

async function authenticate(req) {
  const header = req.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    const error = new Error('Missing bearer token');
    error.status = 401;
    throw error;
  }

  const decoded = await admin.auth().verifyIdToken(match[1], true);
  const email = String(decoded.email || '').toLowerCase();
  const domain = email.split('@')[1] || '';

  if (!email || domain !== ALLOWED_DOMAIN) {
    const error = new Error('Forbidden domain');
    error.status = 403;
    throw error;
  }

  return decoded;
}

exports.dailyReport = onRequest({ region: 'us-central1', cors: false }, async (req, res) => {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'method_not_allowed' });

  try {
    const user = await authenticate(req);
    const raw = await fs.readFile(REPORT_PATH, 'utf8');
    const report = JSON.parse(raw);
    return sendJson(res, 200, {
      ...report,
      servedAt: new Date().toISOString(),
      viewer: { email: user.email || '' }
    });
  } catch (error) {
    const status = error.status || (error.code === 'auth/id-token-revoked' ? 401 : 500);
    const publicError = status === 500 ? 'internal_error' : error.message;
    console.error('[dailyReport]', status, error.code || '', error.message);
    return sendJson(res, status, { error: publicError });
  }
});
```

### 5) Crear `functions/data/demeter-daily-report.json`

Copiar el reporte actual allí para que Functions lo lea sin exponerlo como asset estático:

```bash
mkdir -p functions/data
cp data/demeter-daily-report.json functions/data/demeter-daily-report.json
```

### 6) Modificar `scripts/export-demeter-daily-report.py`

Agregar una segunda salida para mantener sincronizada la copia privada:

```py
OUT = ROOT / 'data' / 'demeter-daily-report.json'
FUNCTIONS_OUT = ROOT / 'functions' / 'data' / 'demeter-daily-report.json'
```

Después de escribir `OUT`, crear el directorio y escribir el mismo JSON en `FUNCTIONS_OUT`.

Alternativa todavía más limpia: dejar de generar `data/demeter-daily-report.json` y generar solo `functions/data/demeter-daily-report.json`, pero eso rompe el preview estático actual.

### 7) Modificar `reports.html`

Cambiar la carga del JSON estático por una llamada autenticada al endpoint:

```js
const user = window.DataseedAuth?.auth?.currentUser;
if (!user) throw new Error('Usuario no autenticado');
const token = await user.getIdToken();
const response = await fetch('/api/daily-report', {
  cache: 'no-store',
  headers: { Authorization: 'Bearer ' + token }
});
```

También actualizar el mensaje de error de `data/demeter-daily-report.json` a `/api/daily-report`.

## Archivos exactos involucrados

Nuevos:

- `firebase.json`
- `.firebaserc` opcional, si se conoce el proyecto
- `functions/package.json`
- `functions/index.js`
- `functions/data/demeter-daily-report.json`

Modificados:

- `reports.html`
- `scripts/export-demeter-daily-report.py`
- opcional: `docs/daily-report-portal.md`, para registrar el nuevo flujo seguro

## Validación local sin deploy

### Validar estado actual

```bash
cd /opt/data/data_seed
python3 -m json.tool data/demeter-daily-report.json >/tmp/demeter-daily-report.validated.json
node --check js/gcp-firebase-auth.js
node --check js/auth-ui.js
```

Resultado local de esta revisión: OK, sin salida de error.

### Instalar dependencias de Functions

```bash
cd /opt/data/data_seed
npm --prefix functions install
npm --prefix functions run check
```

### Validar configuración Firebase Hosting/Functions

```bash
cd /opt/data/data_seed
npx firebase-tools --version
npx firebase-tools emulators:start --only hosting,functions --project demo-dataseed
```

En otra terminal:

```bash
curl -i http://127.0.0.1:5000/api/daily-report
```

Esperado sin token:

```text
HTTP/1.1 401 Unauthorized
{"error":"Missing bearer token"}
```

### Validar con token real desde navegador

Con el emulador levantado y `js/firebase-config.js` apuntando al proyecto/auth real o al Auth emulator, abrir el sitio local, iniciar sesión y ejecutar en consola:

```js
const token = await window.DataseedAuth.auth.currentUser.getIdToken();
await fetch('/api/daily-report', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
```

Esperado para usuario `@dataseed.cl`: JSON del reporte con `servedAt` y `viewer.email`.

Esperado para otro dominio: `403`.

## Riesgos y decisiones pendientes

- Sin proyecto Firebase real y `js/firebase-config.js`, no se puede validar punta a punta con login real.
- Si Hosting publica la raíz del repo, hay que mantener cuidadosamente `hosting.ignore` para no exponer `functions/`, `docs/`, `scripts/` ni el JSON privado.
- La opción más ordenada a mediano plazo es mover HTML/CSS/JS/assets públicos a `public/` y configurar `hosting.public = "public"`.
- Para reportes sensibles, considerar mover la fuente a Firestore o Cloud Storage privado en vez de empaquetar el JSON dentro del source de Functions.
