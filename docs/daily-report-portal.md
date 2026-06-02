# Portal privado de reporte diario — DataSeed.cl

## Objetivo

Mostrar el reporte diario de Demeter en una interfaz visual dentro del área privada de `dataseed.cl`, usando identidad corporativa DataSeed y acceso restringido a cuentas autorizadas del dominio `dataseed.cl`.

## Componentes implementados

| Componente | Función |
|---|---|
| `reports.html` | Interfaz visual privada del reporte diario dentro del dashboard |
| `data/demeter-daily-report.json` | Último reporte diario exportado como JSON estático |
| `scripts/export-demeter-daily-report.py` | Exporta `/opt/data/reports/report_*.md` al JSON consumido por el portal |
| `js/gcp-firebase-auth.js` | Emite evento `dataseed:auth-ready` después de validar sesión y dominio |
| `dashboard.html` | Agrega navegación y acceso al reporte diario |
| Cron `d5d651ec2a4d` | Publica el reporte diario todos los días a las 23:45 UTC en branch `agent-landing-updates` |

## Flujo de acceso

```text
Usuario Google corporativo → login.html → Firebase Auth → validación dominio dataseed.cl → reports.html → carga data/demeter-daily-report.json
```

La carga del reporte se retrasa hasta que `gcp-firebase-auth.js` confirma un usuario autenticado y dispara:

```js
window.dispatchEvent(new CustomEvent('dataseed:auth-ready', ...))
```

## Seguridad

Estado actual: protección frontend con Firebase Auth y allowlist de dominio.

Para seguridad fuerte de datos privados, el siguiente paso debe ser mover el reporte desde JSON estático público a una de estas opciones:

1. Firebase Hosting + Cloud Functions que valide ID token antes de servir el JSON.
2. Firestore con reglas por dominio/usuario.
3. Cloud Storage con reglas Firebase Auth.

Mientras el sitio sea estático, `reports.html` está dentro del login, pero un asset estático como `data/demeter-daily-report.json` no tiene control de acceso server-side propio si alguien conoce la URL exacta. Por eso el JSON solo debe contener resumen operativo no sensible.

## Actualización diaria

Script local usado por cron:

```bash
/opt/data/scripts/dataseed_daily_report_publish.sh
```

Características:

- Lee el último `/opt/data/reports/report_*.md`.
- Regenera `data/demeter-daily-report.json`.
- Commit/push solo si cambió el JSON.
- Mantiene salida silenciosa si todo sale bien.
- Publica al branch `agent-landing-updates` para no tocar `main` sin autorización.

## Dependencias para quedar live en dataseed.cl

1. Merge/deploy aprobado desde `agent-landing-updates` hacia `main` o configurar deploy del branch.
2. Firebase real configurado (`js/firebase-config.js`).
3. Google provider activo en Firebase Auth.
4. Authorized domains: `dataseed.cl` y `www.dataseed.cl`.
5. `allowedEmailDomains: ["dataseed.cl"]`.

## Verificación realizada

- `python3 scripts/export-demeter-daily-report.py` genera JSON válido.
- `python3 -m json.tool data/demeter-daily-report.json` OK.
- `node --check js/gcp-firebase-auth.js` OK.
- `reports.html` carga visualmente con métricas, tablas, metadata, registro de actividad y reporte técnico completo.
- La navegación desde `dashboard.html` incluye `Reporte diario`.
