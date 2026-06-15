#!/bin/bash
# Script unificado de operaciones diarias Demeter
# Orden: 1) actualizar grafo, 2) limpiar task-log → daily-summary, 3) backup operativo.

set -euo pipefail

TIMESTAMP=$(TZ='America/Santiago' date '+%Y-%m-%d %H:%M:%S %Z')
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

TRACKING_REPO="${DATASEED_TASK_TRACKING_REPO_DIR:-/opt/data/data_seed}"
GRAPHIFY_BIN="${GRAPHIFY_BIN:-/opt/data/home/.local/share/uv/tools/graphifyy/bin/graphify}"
TASK_CLEANUP="${DATASEED_TASK_CLEANUP_SCRIPT:-$SCRIPT_DIR/daily-task-log-cleanup.sh}"
BACKUP_SCRIPT="${DATASEED_DAILY_BACKUP_SCRIPT:-$SCRIPT_DIR/demeter_daily_backup.py}"

# Fuente canónica: scripts versionados co-localizados en scripts/ops/.
# Compatibilidad: si se ejecuta desde un entorno restaurado sin esas copias,
# usar los scripts runtime antiguos bajo /opt/data/scripts/ como fallback explícito.
if [ ! -f "$TASK_CLEANUP" ] && [ -f "/opt/data/scripts/daily-task-log-cleanup.sh" ]; then
  TASK_CLEANUP="/opt/data/scripts/daily-task-log-cleanup.sh"
fi
if [ ! -f "$BACKUP_SCRIPT" ] && [ -f "/opt/data/scripts/demeter_daily_backup.py" ]; then
  BACKUP_SCRIPT="/opt/data/scripts/demeter_daily_backup.py"
fi

echo "[$TIMESTAMP] Iniciando operaciones diarias unificadas..."
echo "[$TIMESTAMP] Repo tracking: $TRACKING_REPO"
echo "[$TIMESTAMP] Cleanup script: $TASK_CLEANUP"
echo "[$TIMESTAMP] Backup script: $BACKUP_SCRIPT"

# 0. Actualizar el grafo de conocimiento (AST-only, sin costo de API)
echo "[$TIMESTAMP] Paso 0/3: Actualizando grafo de conocimiento..."
if [ -d "$TRACKING_REPO" ] && [ -x "$GRAPHIFY_BIN" ]; then
  cd "$TRACKING_REPO"
  "$GRAPHIFY_BIN" update . --force 2>&1 || {
    echo "[$TIMESTAMP] WARNING: Error actualizando grafo. Continuando con backup..."
  }
else
  echo "[$TIMESTAMP] WARNING: No se pudo actualizar Graphify; falta repo o binario. Continuando..."
fi

# 1. Cleanup del task-log: genera resumen de últimas 24h y limpia el log
echo "[$TIMESTAMP] Paso 1/3: Generando resumen diario y limpiando task-log..."
if [ ! -f "$TASK_CLEANUP" ]; then
  echo "[$TIMESTAMP] ERROR: no existe TASK_CLEANUP=$TASK_CLEANUP. Abortando backup."
  exit 1
fi
bash "$TASK_CLEANUP" 2>&1 || {
  echo "[$TIMESTAMP] ERROR en cleanup del task-log. Abortando backup."
  exit 1
}

# 2. Backup operativo: snapshot post-cleanup (incluye daily-summary actualizado por referencia)
echo "[$TIMESTAMP] Paso 2/3: Ejecutando backup operativo..."
if [ ! -f "$BACKUP_SCRIPT" ]; then
  echo "[$TIMESTAMP] ERROR: no existe BACKUP_SCRIPT=$BACKUP_SCRIPT."
  exit 1
fi
cd /opt/data
python3 "$BACKUP_SCRIPT" 2>&1 || {
  echo "[$TIMESTAMP] ERROR en backup. El cleanup ya fue completado."
  exit 1
}

echo "[$TIMESTAMP] Operaciones diarias completadas exitosamente."
