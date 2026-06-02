# Portal privado de reporte diario — DataSeed.cl

## Objetivo

Mostrar el reporte diario de Demeter dentro del área privada de `dataseed.cl`, con identidad corporativa DataSeed y acceso real restringido a cuentas Google verificadas del dominio `dataseed.cl`.

## Cambio de seguridad aplicado

La versión inicial cargaba `data/demeter-daily-report.json` como asset estático. Eso no era suficiente para producción porque un archivo estático puede descargarse directamente aunque la página `reports.html` esté detrás de login.

La versión segura elimina ese JSON del deploy público y cambia el flujo a backend autenticado:

```text
Usuario Google @dataseed.cl
→ login.html / Firebase Auth
→ reports.html espera dataseed:auth-ready
→ cliente obtiene Firebase ID token
→ fetch('/api/reports/demeter-daily', Authorization: Bearer <token>)
→ Cloud Function valida token + email_verified + dominio dataseed.cl + provider google.com
→ Function lee reporte desde Firestore privado
→ devuelve payload sanitizado con Cache-Control: no-store
```

## Componentes implementados

| Componente | Función |
|---|---|
| `reports.html` | Interfaz visual privada; ya no carga JSON estático, consume `/api/reports/demeter-daily` con Bearer token |
| `firebase.json` | Configura Firebase Hosting, rewrite a Cloud Function y headers de seguridad/no-cache |
| `functions/index.js` | Cloud Function `getDemeterDailyReport` con validación server-side del Firebase ID token |
| `functions/package.json` | Dependencias Firebase Admin/Functions actuales |
| `scripts/export-demeter-daily-report.py` | Exporta reporte sanitizado a `/opt/data/private-reports/demeter-daily-report.json` |
| `scripts/upload-demeter-report-firestore.py` | Sube el reporte sanitizado a Firestore cuando existan credenciales Firebase Admin |
| `/opt/data/scripts/dataseed_daily_report_secure_sync.sh` | Script de cron: genera reporte privado y sincroniza Firestore si está configurado |
| `.gitignore` | Bloquea publicación accidental de `data/*.json`, secrets, tokens, backups y config real Firebase |
| `js/gcp-firebase-auth.js` | Mantiene guard frontend y exige verificación de email cuando `requireEmailVerification` está activo |

## Seguridad aplicada

- No se publica `data/demeter-daily-report.json`.
- No se expone `rawMarkdown`.
- No se exponen rutas absolutas `/opt/data`, host interno, `creds.json`, sesiones, DB state ni tokens.
- La autorización real ocurre en backend, no en JavaScript cliente.
- El backend exige:
  - token Firebase válido y no revocado;
  - email verificado;
  - dominio exacto `dataseed.cl`;
  - provider `google.com`.
- Headers de producción para portal privado:
  - `Cache-Control: no-store`;
  - `Content-Security-Policy`;
  - `Referrer-Policy`;
  - `X-Content-Type-Options`.

## Estado de producción

Listo para aprobación técnica, pero no desplegado a `main`.

Bloqueos reales antes de producción:

1. Configurar proyecto Firebase real y `js/firebase-config.js`.
2. Activar Google provider en Firebase Auth.
3. Agregar authorized domains: `dataseed.cl` y `www.dataseed.cl`.
4. Habilitar Cloud Firestore.
5. Configurar credenciales Firebase Admin/ADC para que el cron suba el reporte privado.
6. Instalar dependencias Functions y desplegar Hosting + Functions con Firebase CLI autenticado.

## Validación local realizada

- `python3 scripts/export-demeter-daily-report.py --output /opt/data/private-reports/demeter-daily-report.json` OK.
- `python3 -m json.tool /opt/data/private-reports/demeter-daily-report.json` OK.
- Payload sanitizado verificado: sin `/opt/data`, `/opt/hermes`, `creds.json`, `session-`, `state.db` ni `rawMarkdown`.
- `node --check js/gcp-firebase-auth.js` OK.
- `node --check functions/index.js` OK y `require('./functions/index.js')` carga correctamente.
- `npm --prefix functions audit --omit=dev` OK: 0 vulnerabilidades después de usar dependencias actuales y override seguro de `uuid`.
- `python3 scripts/upload-demeter-report-firestore.py` no falla si todavía no hay credenciales; queda silencioso antes de producción.

## Validación esperada con Firebase real

Sin sesión:

```bash
curl -i https://dataseed.cl/api/reports/demeter-daily
# Esperado: 401 unauthorized
```

Con cuenta externa:

```text
Login Google no @dataseed.cl → 403 forbidden / sin reporte
```

Con cuenta `@dataseed.cl` verificada:

```text
Login Google → reports.html → carga métricas desde /api/reports/demeter-daily
```
