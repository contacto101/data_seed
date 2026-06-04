#!/usr/bin/env python3
"""Export Demeter daily report — sanitized JSON for private consumption.

Reads operational state from the DataSeed workspace and produces a
sanitized daily report at the path given by --output.

Usage:
    python3 scripts/export-demeter-daily-report.py [--output PATH]
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = Path(os.environ.get(
    "DATASEED_PRIVATE_REPORT_PATH",
    "/opt/data/private-reports/demeter-daily-report.json",
))

# Fields that must never appear in an exported report.
BLOCKLIST_PREFIX = ("token", "secret", "password", "api_key", "apikey",
                    "private_key", "credential", "auth_token")


def is_blocklisted(key: str) -> bool:
    low = key.lower()
    return any(low.startswith(p) for p in BLOCKLIST_PREFIX)


def sanitize(obj):
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            if is_blocklisted(k):
                out[k] = "[REDACTED]"
            else:
                out[k] = sanitize(v)
        return out
    if isinstance(obj, list):
        return [sanitize(v) for v in obj]
    return obj


def repo_status() -> dict:
    try:
        branch = subprocess.check_output(
            ["git", "branch", "--show-current"],
            cwd=REPO, text=True, stderr=subprocess.DEVNULL,
        ).strip()
        last_commit = subprocess.check_output(
            ["git", "log", "-1", "--format=%H|%s|%ar"],
            cwd=REPO, text=True, stderr=subprocess.DEVNULL,
        ).strip().split("|")
        dirty = bool(subprocess.check_output(
            ["git", "status", "--porcelain"],
            cwd=REPO, text=True, stderr=subprocess.DEVNULL,
        ).strip())
        return {
            "branch": branch,
            "last_commit_hash": last_commit[0] if last_commit else None,
            "last_commit_subject": last_commit[1] if len(last_commit) > 1 else None,
            "last_commit_relative": last_commit[2] if len(last_commit) > 2 else None,
            "dirty": dirty,
        }
    except FileNotFoundError:
        return {"branch": None, "error": "git not found"}
    except subprocess.CalledProcessError as exc:
        return {"branch": None, "error": str(exc)}


def read_backlog() -> dict:
    backlog = REPO.parent / "TASK_BACKLOG.md"
    if not backlog.exists():
        return {"present": False, "path": str(backlog)}
    content = backlog.read_text(encoding="utf-8")
    tasks_crit = [l for l in content.splitlines() if l.strip().startswith("| T-") and "PENDIENTE" in l]
    tasks_prog = [l for l in content.splitlines() if l.strip().startswith("| T-") and "EN PROGRESO" in l]
    tasks_done = [l for l in content.splitlines() if l.strip().startswith("| C-")]
    return {
        "present": True,
        "path": str(backlog),
        "open_critical": len(tasks_crit),
        "in_progress": len(tasks_prog),
        "completed_total": len(tasks_done),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Export Demeter sanitized daily report")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    now = dt.datetime.now(dt.UTC)
    report: dict = {
        "schema_version": "1.1",
        "generated_at": now.isoformat().replace("+00:00", "Z"),
        "agent": "Demeter",
        "agency": "DataSeed",
        "period": now.strftime("%Y-%m-%d"),
        "repo": repo_status(),
        "backlog": read_backlog(),
        "system": {
            "hostname": os.uname().nodename,
            "python": sys.version.split(" ")[0],
            "cwd": str(Path.cwd()),
        },
    }

    clean = sanitize(report)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(clean, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    # Exit 0, stdout silent (cron script pipes to /dev/null)


if __name__ == "__main__":
    main()
