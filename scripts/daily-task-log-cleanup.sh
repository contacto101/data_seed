#!/bin/bash
# Script de limpieza diaria de task-log.md y generación de resumen
# Se ejecuta a las 05:00 AM hora Chile (America/Santiago)

set -e

REPO_DIR="${REPO_DIR:-/opt/data/data_seed}"
TASK_LOG="$REPO_DIR/task-log.md"
DAILY_SUMMARY="$REPO_DIR/daily-summary.md"
DATE=$(TZ='America/Santiago' date '+%Y-%m-%d')
TIMESTAMP=$(TZ='America/Santiago' date '+%Y-%m-%d %H:%M:%S %Z')

# Verificar que task-log.md tiene entradas
if ! grep -q "<!-- ENTRADAS -->" "$TASK_LOG"; then
  echo "[$TIMESTAMP] task-log.md no tiene el marcador de entradas. Saltando."
  exit 0
fi

# Extraer entradas (todo lo después de <!-- ENTRADAS -->)
ENTRIES=$(sed -n '/<!-- ENTRADAS -->/,$p' "$TASK_LOG" | tail -n +3)

# Solo saltar si el bloque completo está vacío o contiene únicamente espacios.
# Antes se usaba `grep -qP '^\s*$'`, que marca como vacío cualquier bloque
# que tenga una línea en blanco; las entradas Markdown normales siempre tienen
# líneas en blanco entre título, tarea, acción y estado.
if [ -z "$(printf '%s' "$ENTRIES" | tr -d '[:space:]')" ]; then
  echo "[$TIMESTAMP] No hay entradas en task-log.md para el $DATE. Saltando resumen."
  exit 0
fi

# Contar por estado usando solo líneas de Estado para evitar falsos positivos
# en textos de Tarea/Acción que mencionen "error", "exitosamente", etc.
SUCCESS=$(printf '%s\n' "$ENTRIES" | grep -ciE '^\*\*Estado:\*\*.*(✅|finalizada exitosamente|exitosamente|completada)' || true)
ERRORS=$(printf '%s\n' "$ENTRIES" | grep -ciE '^\*\*Estado:\*\*.*(❌|error|fallida)' || true)
ACTIVE=$(printf '%s\n' "$ENTRIES" | grep -ciE '^\*\*Estado:\*\*.*(🔄|(^|[^[:alpha:]])activa([^[:alpha:]]|$)|en progreso|in_progress)' || true)
PENDING=$(printf '%s\n' "$ENTRIES" | grep -ciE '^\*\*Estado:\*\*.*(⏳|⚠️|espera|pendiente|waiting|bloquead)' || true)

# Agregar resumen al daily-summary.md
{
  echo ""
  echo "## Resumen $DATE"
  echo ""
  echo "**Generado:** $TIMESTAMP"
  echo ""
  echo "| Estado | Cantidad |"
  echo "|--------|----------|"
  echo "| ✅ Finalizada exitosamente | $SUCCESS |"
  echo "| ❌ Finalizada con error | $ERRORS |"
  echo "| 🔄 Activa | $ACTIVE |"
  echo "| ⏳ En espera de acción de usuario | $PENDING |"
  echo ""
  echo "### Detalle de tareas"
  echo ""
  echo "$ENTRIES"
  echo ""
  echo "---"
} >> "$DAILY_SUMMARY"

# Limpiar task-log.md (mantener encabezado y marcador)
{
  echo "# Task Log - Demeter"
  echo ""
  echo "> **Archivo volátil**: Se reinicia automáticamente cada 24 horas a las 05:00 AM (hora Chile, America/Santiago)."
  echo "> No editar manualmente fuera del flujo automático."
  echo ""
  echo "---"
  echo ""
  echo "<!-- ENTRADAS -->"
} > "$TASK_LOG"

# Commit y push al repo. Si hay cambios, el push debe fallar fuerte para que
# el cron reporte el problema en vez de marcar éxito falso.
cd "$REPO_DIR"
git add task-log.md daily-summary.md
if git diff --cached --quiet; then
  echo "[$TIMESTAMP] No hay cambios para commitear."
else
  git commit -m "chore: daily task log cleanup and summary for $DATE" --no-verify
  git push origin feat/task-tracking-system
fi

echo "[$TIMESTAMP] Limpieza completada. Resumen agregado al daily-summary.md."
