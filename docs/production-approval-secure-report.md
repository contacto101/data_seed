# Solicitud de aprobación de producción — portal seguro de reportes DataSeed

## Resumen ejecutivo

Se corrigió el problema de seguridad principal del portal de reportes: el reporte diario ya no se consume como JSON estático público. La nueva implementación usa Firebase Auth en frontend y una Cloud Function con validación server-side del Firebase ID token antes de entregar el reporte.

## Decisión solicitada

Aprobar el paso a producción del branch `agent-landing-updates` cuando estén configuradas las credenciales/proyecto Firebase.

## Qué cambia para el equipo

- El equipo entra por `dataseed.cl/login.html` con Google corporativo.
- Solo `contacto@dataseed.cl` queda autorizado por defecto para el reporte; la allowlist puede ampliarse con `REPORT_ALLOWED_EMAILS` en producción.
- `reports.html` muestra el dashboard visual del reporte diario.
- El dato del reporte se entrega desde `/api/reports/demeter-daily`, no desde un archivo público.

## Controles de seguridad implementados

1. Backend obligatorio para datos privados
   - `reports.html` llama `/api/reports/demeter-daily` con `Authorization: Bearer <Firebase ID token>`.
   - La Cloud Function valida el token con Firebase Admin SDK.

2. Restricción server-side
   - Token válido y no revocado.
   - Email verificado.
   - dominio exacto `dataseed.cl`.
   - provider `google.com`.
   - email en allowlist, por defecto `contacto@dataseed.cl`.

3. Sanitización de reporte
   - No se expone `rawMarkdown`.
   - No se exponen rutas internas `/opt/data` o `/opt/hermes`.
   - No se exponen `creds.json`, sesiones, `state.db`, tokens, host interno ni archivos sensibles.
   - La actividad se agrupa por categorías operativas.

4. Hardening web
   - `Cache-Control: no-store` para portal/API.
   - CSP en `reports.html`.
   - `Referrer-Policy`.
   - `X-Content-Type-Options: nosniff`.

5. Prevención de publicación accidental
   - `.gitignore` bloquea `data/*.json`, tokens, secrets, backups y `js/firebase-config.js` real.
   - `firebase.json` ignora `data/*.json`, `docs/**`, `scripts/**`, `functions/**` como assets públicos.

## Archivos principales del cambio

- `.gitignore`
- `firebase.json`
- `functions/package.json`
- `functions/index.js`
- `reports.html`
- `js/gcp-firebase-auth.js`
- `js/firebase-config.example.js`
- `scripts/export-demeter-daily-report.py`
- `scripts/upload-demeter-report-firestore.py`
- `docs/daily-report-portal.md`
- `docs/security-daily-report-portal-review.md`
- `docs/secure-report-api-feasibility.md`

## Validaciones realizadas

- Exportación sanitizada del reporte: OK.
- JSON privado parseable: OK.
- Revisión de marcadores sensibles: OK.
  - Sin `/opt/data`.
  - Sin `/opt/hermes`.
  - Sin `creds.json`.
  - Sin `session-`.
  - Sin `state.db`.
  - Sin `rawMarkdown`.
- `node --check js/gcp-firebase-auth.js`: OK.
- `node --check functions/index.js`: OK.
- `require('./functions/index.js')`: OK.
- `npm --prefix functions audit --omit=dev`: 0 vulnerabilidades.
- `firebase.json` parseable: OK.
- Cron actualizado para dejar de commitear JSON público y pasar a sincronización privada: OK.

## Pendientes antes de aprobar deploy

1. Confirmar Firebase project ID real.
2. Crear/copiar `js/firebase-config.js` en producción.
3. Activar Google provider en Firebase Auth.
4. Agregar authorized domains: `dataseed.cl` y `www.dataseed.cl`.
5. Habilitar Firestore.
6. Configurar credenciales Firebase Admin/ADC en el VPS para que el cron suba el reporte privado.
7. Instalar dependencias de Functions:

```bash
npm --prefix functions install
```

8. Desplegar con Firebase CLI autenticado:

```bash
npx firebase-tools deploy --only hosting,functions --project <firebase-project-id>
```

## Pruebas de aceptación en producción

1. Sin token:

```bash
curl -i https://dataseed.cl/api/reports/demeter-daily
```

Esperado: `401 unauthorized`.

2. Usuario Google externo o no autorizado:

```text
Login externo/no allowlist → no ve reporte → 403/aviso de permiso.
```

3. Usuario Google `contacto@dataseed.cl` verificado:

```text
Login → reports.html → reporte carga desde backend autenticado.
```

4. Validar que esta URL no exista como dato público:

```bash
curl -i https://dataseed.cl/data/demeter-daily-report.json
```

Esperado: `404` o no publicado.

## Riesgo residual

Hasta configurar Firebase real y desplegar Functions, la funcionalidad queda preparada en branch, pero no activa en producción. No se recomienda mergear a `main` sin completar los pendientes de Firebase.
