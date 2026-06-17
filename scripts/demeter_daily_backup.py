#!/usr/bin/env python3
"""Compatibilidad temporal: la implementación vive en scripts/ops/demeter_daily_backup.py."""
from __future__ import annotations

import os
import sys
from pathlib import Path

TARGET = Path(__file__).resolve().parent.parent / "scripts/ops/demeter_daily_backup.py"
os.execv("/usr/bin/env", ["/usr/bin/env", "python3", str(TARGET), *sys.argv[1:]])
