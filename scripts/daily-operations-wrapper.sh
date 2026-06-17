#!/usr/bin/env bash
# Compatibilidad temporal: la implementación vive en scripts/ops/daily-operations-wrapper.sh.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec "$ROOT/scripts/ops/daily-operations-wrapper.sh" "$@"
