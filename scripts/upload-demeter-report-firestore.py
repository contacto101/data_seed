#!/usr/bin/env python3
"""Upload Demeter daily report to Firestore (private collection).

Reads the sanitized JSON report and writes it to Firestore if firebase-admin
is available and a project is configured. Exits 0 silently when Firebase is
not yet configured (expected state until a real GCP/Firebase project exists).

Usage:
    python3 scripts/upload-demeter-report-firestore.py [--collection NAME]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DEFAULT_REPORT = Path(os.environ.get(
    "DATASEED_PRIVATE_REPORT_PATH",
    "/opt/data/private-reports/demeter-daily-report.json",
))


def firebase_available() -> bool:
    try:
        import firebase_admin  # noqa: F401
        return True
    except ImportError:
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload daily report to Firestore")
    parser.add_argument("--collection", default="demeter_private_reports")
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    args = parser.parse_args()

    if not args.report.exists():
        print(f"report_not_found: {args.report}", file=sys.stderr)
        sys.exit(2)

    if not firebase_available():
        # Firebase SDK not installed — expected before GCP/Firebase project setup.
        # Exit 0 so the cron job does not treat this as an error.
        sys.exit(0)

    import firebase_admin
    from firebase_admin import credentials, firestore

    # Initialize only once (singleton guard).
    if not firebase_admin._apps:
        cred_path = os.environ.get(
            "GOOGLE_APPLICATION_CREDENTIALS",
            str(REPO.parent / "google-credentials.json"),
        )
        if Path(cred_path).exists():
            cred = credentials.Certificate(cred_path)
        else:
            # Try default credentials (e.g. on GCE / Cloud Run).
            cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    data = json.loads(args.report.read_text(encoding="utf-8"))
    period = data.get("period", "unknown")
    doc_ref = db.collection(args.collection).document(period)
    doc_ref.set(data, merge=True)


if __name__ == "__main__":
    main()
