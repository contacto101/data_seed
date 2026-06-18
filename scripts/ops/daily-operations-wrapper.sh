#!/usr/bin/env bash
# Wrapper que ejecuta operaciones diarias solo si son las 05:00 AM en America/Santiago.
# Mantiene compatibilidad con cron UTC y cambios de DST.
set -euo pipefail
HOUR=$(TZ='America/Santiago' date +%H)
MINUTE=$(TZ='America/Santiago' date +%M)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "$HOUR" -eq 5 ] && [ "$MINUTE" -ge 0 ] && [ "$MINUTE" -lt 5 ]; then
  exec "$SCRIPT_DIR/daily-operations.sh"
else
  exit 0
fi
