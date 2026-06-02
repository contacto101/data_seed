#!/usr/bin/env python3
"""Upload the sanitized Demeter daily report to Firestore.

Requires Firebase Admin credentials in one of these forms:
- GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
- FIREBASE_PROJECT_ID plus Application Default Credentials

This script is intentionally quiet when credentials/dependencies are not ready,
so scheduled runs do not spam the team before production approval.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

REPORT_PATH = Path(os.environ.get('DATASEED_PRIVATE_REPORT_PATH', '/opt/data/private-reports/demeter-daily-report.json'))
DOC_PATH = os.environ.get('DATASEED_FIRESTORE_REPORT_DOC', 'privateReports/demeterDailyLatest')
VERBOSE = os.environ.get('VERBOSE') == '1'


def log(message: str) -> None:
    if VERBOSE:
        print(message)


def main() -> int:
    if not REPORT_PATH.exists():
      log(f'Reporte privado no existe: {REPORT_PATH}')
      return 0

    has_adc = bool(os.environ.get('GOOGLE_APPLICATION_CREDENTIALS') or os.environ.get('FIREBASE_PROJECT_ID') or os.environ.get('GOOGLE_CLOUD_PROJECT'))
    if not has_adc:
        log('Firebase credentials not configured; skipping Firestore upload.')
        return 0

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except Exception as exc:
        log(f'firebase-admin Python dependency missing; skipping upload: {exc}')
        return 0

    if not firebase_admin._apps:
        cred_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
        if cred_path:
            firebase_admin.initialize_app(credentials.Certificate(cred_path))
        else:
            firebase_admin.initialize_app()

    payload = json.loads(REPORT_PATH.read_text(encoding='utf-8'))
    if '/opt/data' in json.dumps(payload, ensure_ascii=False) or 'creds.json' in json.dumps(payload, ensure_ascii=False):
        raise RuntimeError('Sanitization failed: sensitive path marker found in payload')

    db = firestore.client()
    db.document(DOC_PATH).set({'report': payload, 'updatedAt': firestore.SERVER_TIMESTAMP}, merge=True)
    log(f'Uploaded sanitized report to Firestore document {DOC_PATH}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
