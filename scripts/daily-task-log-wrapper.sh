#!/bin/bash
# Wrapper que ejecuta el cleanup solo si son las 04:30 AM en America/Santiago
# Permite programar en UTC y que el script decida si es el momento correcto

HOUR=$(TZ='America/Santiago' date +%H)
MINUTE=$(TZ='America/Santiago' date +%M)

if [ "$HOUR" -eq 4 ] && [ "$MINUTE" -ge 30 ] && [ "$MINUTE" -lt 35 ]; then
  /opt/data/scripts/daily-task-log-cleanup.sh
else
  # No es la hora, salir silenciosamente
  exit 0
fi
