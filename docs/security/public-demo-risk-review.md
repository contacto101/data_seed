# Revisión de riesgo — portal/reportes públicos

## Estado

Histórico útil. Fuente: `agent-landing-updates/docs/security-daily-report-portal-review.md`.

## Hallazgo principal

La autenticación client-side solo oculta UI; no protege archivos JSON privados servidos como assets estáticos.

## Riesgos

- JSON privado publicado directamente.
- Validación de dominio solo en cliente.
- Exposición de metadata operativa: rutas internas, sesiones, DB state, cron outputs.
- Falta de headers de hardening.

## Regla activa

No publicar reportes internos ni JSON operativo como assets bajo el sitio estático. Si se requiere portal privado, usar API/Cloud Function con verificación server-side.
