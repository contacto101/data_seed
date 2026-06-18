# Cronjobs Hermes — DataSeed

## Estado observado

Cron activo observado con herramienta Hermes:

- ID: `ea05ea193912`
- Nombre: Demeter Daily Operations (5:00 AM Chile)
- Schedule: `0 9 * * *`
- Modo: `no-agent`
- Script: `daily-operations-wrapper.sh`
- Último estado observado: ok

## Impacto de la reorganización

El cron runtime sigue apuntando al script relativo `daily-operations-wrapper.sh`. Para evitar ruptura, el repo conserva wrappers temporales en `scripts/daily-operations-wrapper.sh` y `scripts/daily-operations.sh`, delegando a `scripts/ops/`.

## Migración recomendada después de merge

1. Copiar o desplegar `scripts/ops/` al directorio runtime de Hermes si se decide migrar físicamente.
2. Mantener `daily-operations-wrapper.sh` como wrapper de compatibilidad al menos un ciclo diario.
3. Ejecutar `bash -n` sobre wrappers y scripts canónicos.
4. Ejecutar el wrapper fuera de ventana horaria y esperar salida silenciosa con exit 0.
5. Recién después actualizar cron si se adopta una ruta nueva.

## Rollback

Si el cron falla, volver a apuntar o restaurar el wrapper antiguo `daily-operations-wrapper.sh` y ejecutar `cronjob list` + revisión de salida.
