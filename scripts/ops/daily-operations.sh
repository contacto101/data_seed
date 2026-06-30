#!/usr/bin/env bash
# Operaciones diarias Demeter: grafo optimizado -> cleanup task-log -> backup operativo.
# Runtime estable para cron: usa /opt/data/scripts como fuente de scripts, no el checkout vivo del repo.
set -euo pipefail

# Brokered GitHub access for non-interactive Hermes cron.
# Security invariant: this script must not read .env, export raw tokens, write
# ~/.git-credentials, or answer Git credential prompts. GitHub access must be
# provided by Agent Vault/proxy policy; otherwise the job fails closed.
disable_direct_git_credentials() {
  local count="${GIT_CONFIG_COUNT:-0}"
  case "$count" in
    ''|*[!0-9]*) count=0 ;;
  esac
  export "GIT_CONFIG_KEY_${count}=credential.helper"
  export "GIT_CONFIG_VALUE_${count}="
  export GIT_CONFIG_COUNT=$((count + 1))
}

setup_brokered_git_env() {
  export HOME="${HOME:-/opt/data/home}"
  mkdir -p "$HOME"
  unset GITHUB_TOKEN GH_TOKEN GITHUB_PAT
  export GIT_TERMINAL_PROMPT=0
  if [ -x /bin/false ]; then
    export GIT_ASKPASS=/bin/false
    export SSH_ASKPASS=/bin/false
  else
    unset GIT_ASKPASS SSH_ASKPASS
  fi
  disable_direct_git_credentials
}

normalize_agent_vault_git_env() {
  # Git/libcurl treats a proxy URL with only username as a prompt for password.
  # Agent Vault accepts an empty password, so add the ':' while preserving the proxy.
  if [ -n "${HTTPS_PROXY:-}" ] && [[ "$HTTPS_PROXY" == http://*@* ]] && [[ "$HTTPS_PROXY" != *://*:*@* ]]; then
    export HTTPS_PROXY="${HTTPS_PROXY/@/:@}"
  fi
  if [ -n "${HTTP_PROXY:-}" ] && [[ "$HTTP_PROXY" == http://*@* ]] && [[ "$HTTP_PROXY" != *://*:*@* ]]; then
    export HTTP_PROXY="${HTTP_PROXY/@/:@}"
  fi
  if [ -z "${GIT_SSL_CAINFO:-}" ]; then
    if [ -n "${SSL_CERT_FILE:-}" ] && [ -f "$SSL_CERT_FILE" ]; then
      export GIT_SSL_CAINFO="$SSL_CERT_FILE"
    elif [ -n "${REQUESTS_CA_BUNDLE:-}" ] && [ -f "$REQUESTS_CA_BUNDLE" ]; then
      export GIT_SSL_CAINFO="$REQUESTS_CA_BUNDLE"
    elif [ -f /opt/agent-vault-ca.pem ]; then
      export GIT_SSL_CAINFO=/opt/agent-vault-ca.pem
    elif [ -f /opt/data/agent-vault/agent-vault-ca.pem ]; then
      export GIT_SSL_CAINFO=/opt/data/agent-vault/agent-vault-ca.pem
    fi
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

setup_brokered_git_env
normalize_agent_vault_git_env

TIMESTAMP=$(TZ='America/Santiago' date '+%Y-%m-%d %H:%M:%S %Z')
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CANONICAL_REPO="${DATASEED_CANONICAL_REPO_DIR:-/opt/data/data_seed}"

if [ -n "${DATASEED_TASK_TRACKING_REPO_DIR:-}" ]; then
  TRACKING_REPO="$DATASEED_TASK_TRACKING_REPO_DIR"
elif [ -f "/opt/data/data_seed_tasklog_worktree/task-log.md" ]; then
  TRACKING_REPO="/opt/data/data_seed_tasklog_worktree"
elif [ -f "/tmp/data_seed_tasklog_worktree/task-log.md" ]; then
  TRACKING_REPO="/tmp/data_seed_tasklog_worktree"
else
  TRACKING_REPO="$CANONICAL_REPO"
fi

GRAPH_GENERATOR="${DATASEED_GRAPH_GENERATOR:-$SCRIPT_DIR/generate-multibranch-graph.py}"
TASK_CLEANUP="${DATASEED_TASK_CLEANUP_SCRIPT:-$SCRIPT_DIR/daily-task-log-cleanup.sh}"
BACKUP_SCRIPT="${DATASEED_DAILY_BACKUP_SCRIPT:-$SCRIPT_DIR/demeter_daily_backup.py}"

# Fallbacks de recuperación si falta algún runtime script.
if [ ! -f "$GRAPH_GENERATOR" ] && [ -f "$CANONICAL_REPO/scripts/generate-multibranch-graph.py" ]; then
  GRAPH_GENERATOR="$CANONICAL_REPO/scripts/generate-multibranch-graph.py"
fi
if [ ! -f "$TASK_CLEANUP" ] && [ -f "$CANONICAL_REPO/scripts/ops/daily-task-log-cleanup.sh" ]; then
  TASK_CLEANUP="$CANONICAL_REPO/scripts/ops/daily-task-log-cleanup.sh"
fi
if [ ! -f "$BACKUP_SCRIPT" ] && [ -f "$CANONICAL_REPO/scripts/ops/demeter_daily_backup.py" ]; then
  BACKUP_SCRIPT="$CANONICAL_REPO/scripts/ops/demeter_daily_backup.py"
fi

echo "[$TIMESTAMP] Iniciando operaciones diarias unificadas..."
echo "[$TIMESTAMP] Repo canónico: $CANONICAL_REPO"
echo "[$TIMESTAMP] Repo tracking: $TRACKING_REPO"
echo "[$TIMESTAMP] Graph generator: $GRAPH_GENERATOR"
echo "[$TIMESTAMP] Cleanup script: $TASK_CLEANUP"
echo "[$TIMESTAMP] Backup script: $BACKUP_SCRIPT"

echo "[$TIMESTAMP] Paso 0/3: Actualizando grafo de conocimiento optimizado..."
if [ -d "$CANONICAL_REPO/.git" ] && [ -f "$GRAPH_GENERATOR" ]; then
  git -C "$CANONICAL_REPO" fetch origin --prune 2>&1 || {
    echo "[$TIMESTAMP] WARNING: No se pudo actualizar refs remotos antes de Graphify. Continuando con refs locales..."
  }
  DATASEED_CANONICAL_REPO_DIR="$CANONICAL_REPO" python3 "$GRAPH_GENERATOR" 2>&1 || {
    echo "[$TIMESTAMP] WARNING: Error actualizando grafo multi-branch. Continuando con backup..."
  }
else
  echo "[$TIMESTAMP] WARNING: No se pudo actualizar Graphify; falta repo o generador. Continuando..."
fi

echo "[$TIMESTAMP] Paso 1/3: Generando resumen diario y limpiando task-log..."
if [ ! -f "$TASK_CLEANUP" ]; then
  echo "[$TIMESTAMP] ERROR: no existe TASK_CLEANUP=$TASK_CLEANUP. Abortando backup."
  exit 1
fi
REPO_DIR="$TRACKING_REPO" DATASEED_TASK_TRACKING_REPO_DIR="$TRACKING_REPO" bash "$TASK_CLEANUP" 2>&1 || {
  echo "[$TIMESTAMP] ERROR en cleanup del task-log. Abortando backup."
  exit 1
}

echo "[$TIMESTAMP] Paso 2/3: Ejecutando backup operativo..."
if [ ! -f "$BACKUP_SCRIPT" ]; then
  echo "[$TIMESTAMP] ERROR: no existe BACKUP_SCRIPT=$BACKUP_SCRIPT."
  exit 1
fi
cd /opt/data
DATASEED_TASK_TRACKING_REPO_DIR="$TRACKING_REPO" DATASEED_CANONICAL_REPO_DIR="$CANONICAL_REPO" DATASEED_GRAPHIFY_SOURCE_REPO_DIR="$CANONICAL_REPO" python3 "$BACKUP_SCRIPT" 2>&1 || {
  echo "[$TIMESTAMP] ERROR en backup. El cleanup ya fue completado."
  exit 1
}

echo "[$TIMESTAMP] Operaciones diarias completadas exitosamente."
