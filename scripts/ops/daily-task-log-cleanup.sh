#!/usr/bin/env bash
# Limpieza diaria de task-log.md y generación de daily-summary.md.
# Runtime estable para cron: NO delega al repo vivo, para que los cambios del repo no rompan el cron.
set -euo pipefail

# GitHub auth bootstrap for non-interactive Hermes cron.
load_github_token() {
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    return 0
  fi
  local env_file="${HERMES_HOME:-/opt/data}/.env"
  if [ ! -f "$env_file" ]; then
    return 0
  fi
  local line value
  while IFS= read -r line; do
    case "$line" in
      GITHUB_TOKEN=*)
        value="${line#GITHUB_TOKEN=}"
        value="${value%$'\r'}"
        value="${value%\"}"; value="${value#\"}"
        value="${value%\'}"; value="${value#\'}"
        export GITHUB_TOKEN="$value"
        return 0
        ;;
    esac
  done < "$env_file"
}

setup_git_auth() {
  export HOME="${HOME:-/opt/data/home}"
  mkdir -p "$HOME"
  load_github_token || true
  git config --global credential.helper "store --file=$HOME/.git-credentials" >/dev/null 2>&1 || true
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    if [ ! -f "$HOME/.git-credentials" ] || ! grep -q 'github.com' "$HOME/.git-credentials"; then
      umask 077
      printf 'https://x-access-token:%s@github.com\n' "$GITHUB_TOKEN" > "$HOME/.git-credentials"
      chmod 600 "$HOME/.git-credentials" 2>/dev/null || true
    fi
    ASKPASS_FILE="$(mktemp /tmp/dataseed-git-askpass.XXXXXX)"
    cat > "$ASKPASS_FILE" <<'ASKPASS'
#!/bin/sh
case "$1" in
  *Username*) printf '%s\n' 'x-access-token' ;;
  *Password*) printf '%s\n' "$GITHUB_TOKEN" ;;
  *) printf '\n' ;;
esac
ASKPASS
    chmod 700 "$ASKPASS_FILE"
    export GIT_ASKPASS="$ASKPASS_FILE"
    export GIT_TERMINAL_PROMPT=0
    trap 'rm -f "${ASKPASS_FILE:-}"' EXIT
  fi
}

ensure_git_identity() {
  if ! git config user.name >/dev/null 2>&1; then
    git config user.name "Demeter Ops Bot"
  fi
  if ! git config user.email >/dev/null 2>&1; then
    git config user.email "demeter@dataseed.local"
  fi
}

setup_git_auth

if [ -n "${REPO_DIR:-}" ]; then
  REPO_DIR="$REPO_DIR"
elif [ -n "${DATASEED_TASK_TRACKING_REPO_DIR:-}" ]; then
  REPO_DIR="$DATASEED_TASK_TRACKING_REPO_DIR"
elif [ -f "/opt/data/data_seed_tasklog_worktree/task-log.md" ]; then
  REPO_DIR="/opt/data/data_seed_tasklog_worktree"
elif [ -f "/tmp/data_seed_tasklog_worktree/task-log.md" ]; then
  REPO_DIR="/tmp/data_seed_tasklog_worktree"
else
  REPO_DIR="/opt/data/data_seed"
fi
TASK_LOG="$REPO_DIR/task-log.md"
DAILY_SUMMARY="$REPO_DIR/daily-summary.md"
DATE=$(TZ='America/Santiago' date '+%Y-%m-%d')
TIMESTAMP=$(TZ='America/Santiago' date '+%Y-%m-%d %H:%M:%S %Z')
PUSH_ENABLED="${DATASEED_CLEANUP_PUSH:-1}"

if [ ! -f "$TASK_LOG" ]; then
  echo "[$TIMESTAMP] ERROR: no existe task-log.md en $REPO_DIR"
  exit 1
fi
if [ ! -f "$DAILY_SUMMARY" ]; then
  touch "$DAILY_SUMMARY"
fi

if ! grep -q "<!-- ENTRADAS -->" "$TASK_LOG"; then
  echo "[$TIMESTAMP] task-log.md no tiene el marcador de entradas. Saltando."
  exit 0
fi

ENTRIES=$(sed -n '/<!-- ENTRADAS -->/,$p' "$TASK_LOG" | tail -n +3)
if [ -z "$(printf '%s' "$ENTRIES" | tr -d '[:space:]')" ]; then
  echo "[$TIMESTAMP] No hay entradas en task-log.md para el $DATE. Saltando resumen."
  exit 0
fi

SUCCESS=$(printf '%s
' "$ENTRIES" | grep -ciE '^\*\*Estado:\*\*.*(✅|finalizada exitosamente|exitosamente|completada)' || true)
ERRORS=$(printf '%s
' "$ENTRIES" | grep -ciE '^\*\*Estado:\*\*.*(❌|error|fallida)' || true)
ACTIVE=$(printf '%s
' "$ENTRIES" | grep -ciE '^\*\*Estado:\*\*.*(🔄|(^|[^[:alpha:]])activa([^[:alpha:]]|$)|en progreso|in_progress)' || true)
PENDING=$(printf '%s
' "$ENTRIES" | grep -ciE '^\*\*Estado:\*\*.*(⏳|⚠️|espera|pendiente|waiting|bloquead)' || true)

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

chmod 0644 "$TASK_LOG" "$DAILY_SUMMARY" 2>/dev/null || true

cd "$REPO_DIR"
ensure_git_identity
git add task-log.md daily-summary.md
if git diff --cached --quiet; then
  echo "[$TIMESTAMP] No hay cambios para commitear."
else
  git commit -m "chore: daily task log cleanup and summary for $DATE" --no-verify
  if [ "$PUSH_ENABLED" = "0" ]; then
    echo "[$TIMESTAMP] Push deshabilitado por DATASEED_CLEANUP_PUSH=0."
  else
    git push origin feat/task-tracking-system
  fi
fi

echo "[$TIMESTAMP] Limpieza completada. Resumen agregado al daily-summary.md."
