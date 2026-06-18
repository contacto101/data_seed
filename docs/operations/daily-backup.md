# Backup diario operativo

## Estado

Activo. Genera snapshot no sensible para recuperación crítica.

## Script canónico

- `scripts/ops/demeter_daily_backup.py`
- wrappers temporales: `scripts/demeter_daily_backup.py`

## Pipeline

`daily-operations-wrapper.sh` → `daily-operations.sh` → Graphify update → task-log cleanup → backup.

El script canónico `scripts/ops/daily-operations.sh` prefiere dependencias co-localizadas en `scripts/ops/` y solo usa `/opt/data/scripts/*` como fallback explícito o por variables de entorno.

## Archivos incluidos

- `backups/BACKUP.md`
- `backups/COMPLETED_CYCLES.md`
- `backups/RESTORE_GUIDE.md`
- `backups/restore.sh`
- scripts canónicos bajo `scripts/ops/`
- wrappers temporales bajo `scripts/`
- Graphify liviano: report, manifest y labels.

## Excluido

Secretos, sesiones, bases runtime, caches, logs completos, prompts completos de cron, `task-log.md`, `daily-summary.md`, `graph.json`, `graph.html` y `graphify-out/cache/`.
