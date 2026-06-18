# Task tracking DataSeed / Demeter

## Estado

Activo en branch `feat/task-tracking-system`.

## Archivos

- `task-log.md`: log vivo del día, volátil.
- `daily-summary.md`: resumen diario generado a las 05:00 America/Santiago.
- `backups/COMPLETED_CYCLES.md`: solo hitos grandes completados.

## Regla

El backup diario no copia `task-log.md` ni `daily-summary.md`; solo los referencia. El detalle operativo diario vive en la rama de tracking.

## Script

Copia sanitizada: `scripts/ops/daily-task-log-cleanup.sh`.

## Validación

El cleanup debe considerar vacío el bloque completo solo si al quitar whitespace no queda contenido. No usar una línea en blanco como criterio de vacío.
