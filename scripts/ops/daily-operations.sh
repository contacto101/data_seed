#!/bin/bash
# Script unificado de operaciones diarias Demeter.
# Orden: 1) actualizar grafo multi-branch optimizado, 2) limpiar task-log → daily-summary, 3) backup operativo.

set -euo pipefail

TIMESTAMP=$(TZ='America/Santiago' date '+%Y-%m-%d %H:%M:%S %Z')
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CANONICAL_REPO="${DATASEED_CANONICAL_REPO_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"

if [ -n "${DATASEED_TASK_TRACKING_REPO_DIR:-}" ]; then
  TRACKING_REPO="$DATASEED_TASK_TRACKING_REPO_DIR"
elif [ -f "/opt/data/data_seed_tasklog_worktree/task-log.md" ]; then
  TRACKING_REPO="/opt/data/data_seed_tasklog_worktree"
elif [ -f "/tmp/data_seed_tasklog_worktree/task-log.md" ]; then
  TRACKING_REPO="/tmp/data_seed_tasklog_worktree"
else
  TRACKING_REPO="/opt/data/data_seed"
fi

GRAPHIFY_BIN="${GRAPHIFY_BIN:-/opt/data/home/.local/share/uv/tools/graphifyy/bin/graphify}"
GRAPH_GENERATOR="${DATASEED_GRAPH_GENERATOR:-$CANONICAL_REPO/scripts/generate-multibranch-graph.py}"
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
echo "[$TIMESTAMP] Repo canónico: $CANONICAL_REPO"
echo "[$TIMESTAMP] Repo tracking: $TRACKING_REPO"
echo "[$TIMESTAMP] Graph generator: $GRAPH_GENERATOR"
echo "[$TIMESTAMP] Cleanup script: $TASK_CLEANUP"
echo "[$TIMESTAMP] Backup script: $BACKUP_SCRIPT"

# 0. Actualizar el grafo de conocimiento multi-branch deduplicado.
# No usar graphify update directo sobre el repo vivo: eso reemplaza el grafo optimizado
# por un grafo single-branch y puede dejar cambios locales que bloquean el backup.
echo "[$TIMESTAMP] Paso 0/3: Actualizando grafo de conocimiento optimizado..."
if [ -d "$CANONICAL_REPO" ] && [ -f "$GRAPH_GENERATOR" ]; then
  cd "$CANONICAL_REPO"
  git fetch origin --prune 2>&1 || {
    echo "[$TIMESTAMP] WARNING: No se pudo actualizar refs remotos antes de Graphify. Continuando con refs locales..."
  }
  python3 "$GRAPH_GENERATOR" 2>&1 || {
    echo "[$TIMESTAMP] WARNING: Error actualizando grafo multi-branch. Continuando con backup..."
  }
elif [ -d "$CANONICAL_REPO" ] && [ -x "$GRAPHIFY_BIN" ]; then
  echo "[$TIMESTAMP] WARNING: No existe generador multi-branch; usando fallback Graphify single-branch."
  cd "$CANONICAL_REPO"
  "$GRAPHIFY_BIN" update . --force 2>&1 || {
    echo "[$TIMESTAMP] WARNING: Error actualizando grafo fallback. Continuando con backup..."
  }
else
  echo "[$TIMESTAMP] WARNING: No se pudo actualizar Graphify; falta repo, generador o binario. Continuando..."
fi

# 1. Cleanup del task-log: genera resumen de últimas 24h y limpia el log.
echo "[$TIMESTAMP] Paso 1/3: Generando resumen diario y limpiando task-log..."
if [ ! -f "$TASK_CLEANUP" ]; then
  echo "[$TIMESTAMP] ERROR: no existe TASK_CLEANUP=$TASK_CLEANUP. Abortando backup."
  exit 1
fi
REPO_DIR="$TRACKING_REPO" DATASEED_TASK_TRACKING_REPO_DIR="$TRACKING_REPO" bash "$TASK_CLEANUP" 2>&1 || {
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
DATASEED_TASK_TRACKING_REPO_DIR="$TRACKING_REPO" \
DATASEED_CANONICAL_REPO_DIR="$CANONICAL_REPO" \
DATASEED_GRAPHIFY_SOURCE_REPO_DIR="$CANONICAL_REPO" \
python3 "$BACKUP_SCRIPT" 2>&1 || {
  echo "[$TIMESTAMP] ERROR en backup. El cleanup ya fue completado."
  exit 1
}

echo "[$TIMESTAMP] Operaciones diarias completadas exitosamente."
