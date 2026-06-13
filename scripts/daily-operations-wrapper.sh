#!/bin/bash
# Wrapper que ejecuta las operaciones diarias solo si son las 05:00 AM en America/Santiago
# Permite programar en UTC y que el script decida si es el momento correcto

HOUR=$(TZ='America/Santiago' date +%H)
MINUTE=$(TZ='America/Santiago' date +%M)

if [ "$HOUR" -eq 5 ] && [ "$MINUTE" -ge 0 ] && [ "$MINUTE" -lt 5 ]; then
  /opt/data/scripts/daily-operations.sh
else
  # No es la hora, salir silenciosamente
  exit 0
fi
