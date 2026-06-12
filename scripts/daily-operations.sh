#!/bin/bash
# Script unificado de operaciones diarias Demeter
# Orden: 1) Cleanup task-log → resumen del día, 2) Backup → snapshot post-cleanup

set -euo pipefail

TIMESTAMP=$(TZ='America/Santiago' date '+%Y-%m-%d %H:%M:%S %Z')
echo "[$TIMESTAMP] Iniciando operaciones diarias unificadas..."

# 1. Cleanup del task-log: genera resumen de últimas 24h y limpia el log
echo "[$TIMESTAMP] Paso 1/2: Generando resumen diario y limpiando task-log..."
/opt/data/scripts/daily-task-log-cleanup.sh 2>&1 || {
  echo "[$TIMESTAMP] ERROR en cleanup del task-log. Abortando backup."
  exit 1
}

# 2. Backup operativo: snapshot post-cleanup (incluye daily-summary actualizado)
echo "[$TIMESTAMP] Paso 2/2: Ejecutando backup operativo..."
cd /opt/data
python3 /opt/data/scripts/demeter_daily_backup.py 2>&1 || {
  echo "[$TIMESTAMP] ERROR en backup. El cleanup ya fue completado."
  exit 1
}

echo "[$TIMESTAMP] Operaciones diarias completadas exitosamente."
