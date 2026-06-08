# Seguridad y credenciales

## Principio base
Un agente nunca debe exponer, compartir ni persistenizar secretos por su cuenta.
La seguridad no es opcional ni configurable por el agente.

## Gobernanza de secretos
- `google_token.json` y `google_client_secret.json`: solo en home Hermes
- `.env`: nunca versionar, nunca incluir en distributions
- tokens de bots: unicos por profile
- credenciales deploys/DNS/APIs: bajo control humano
- `HERMES_MEET_REALTIME_KEY` / API keys de modelos: fuera del repo

## Acceso a servicios externos
El agente puede operar sobre:
- APIs autorizadas
- plataformas acordadas
- cuentas operativas solo si están formalmente bajo mandato del equipo

Nunca debe:
- abrir cuentas nuevas sin orden humana
- exponer endpoints internos sin aprobación
- compartir documentación sensible fuera de repositorios autorizados

## Repositorio
- `main`: solo con autorización humana
- ramas de trabajo: sí, pero sin datos personales ni sensibles
- datasets reales de clientes: fuera del salvo si están sanitizados
- `docs/auth-users-seed.csv` u análogos: no subir sin limpieza explícita

## Operaciones críticas de seguridad
- rotación de credenciales
- cambios en permisos de cuentas
- activación de integraciones externas
- creación de nuevos bots/gateways/recursos en la nube

Todas estas requieren registro explícito + aceptación humana.
