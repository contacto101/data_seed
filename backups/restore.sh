#!/bin/bash
# Script de reconstrucción de Hermes Agent
# Generado: 2026-05-27
# Uso: bash restore.sh

echo "=== Hermes Agent Restore Script ==="
echo ""

# 1. Verificar Hermes instalado
if ! command -v hermes &> /dev/null; then
    echo "[1/5] Instalando Hermes Agent..."
    curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
else
    echo "[1/5] Hermes Agent ya instalado ✓"
fi

# 2. Verificar skills
echo "[2/5] Verifying skills directory..."
ls /opt/data/skills/ 2>/dev/null && echo "Skills directory exists ✓" || echo "WARNING: Skills directory missing"

# 3. Verificar Google Workspace
echo "[3/5] Verifying Google Workspace..."
if [ -f /opt/data/google_client_secret.json ]; then
    echo "Client secret exists ✓"
    echo "NOTE: Token OAuth must be re-authorized (cannot be backed up)"
    echo "Run: python3 /opt/data/skills/productivity/google-workspace/scripts/setup.py --auth-url"
else
    echo "WARNING: google_client_secret.json not found"
fi

# 4. Verificar GitHub
echo "[4/5] Verifying GitHub access..."
if [ -n "$HERMES_TOKEN" ]; then
    echo "HERMES_TOKEN is set ✓"
    git ls-remote https://$HERMES_TOKEN@github.com/ZeroSentinels/data_seed.git HEAD 2>/dev/null && echo "GitHub access OK ✓" || echo "WARNING: GitHub access failed"
else
    echo "WARNING: HERMES_TOKEN not set"
fi

# 5. Verificar cron
echo "[5/5] Verifying cron jobs..."
hermes cron list 2>/dev/null || echo "NOTE: Run 'hermes cron list' to check scheduled jobs"

echo ""
echo "=== Restore check complete ==="
echo "Review any WARNING messages above and fix manually."
