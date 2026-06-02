#!/usr/bin/env python3
"""Export the latest Demeter activity report as a sanitized private JSON payload.

Security rule: do not write operational report data into the public web tree.
The generated file is intended for upload to a private backend document/object
(Firestore/Storage) and for local verification only.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = Path('/opt/data/reports')
DEFAULT_OUT = Path('/opt/data/private-reports/demeter-daily-report.json')

SENSITIVE_PATTERNS = (
    'creds', 'credential', 'secret', 'token', 'session-', 'device-list',
    'state.db', '.env', 'auth.json', 'google_token', 'client_secret'
)


def read_latest_report() -> tuple[Path, str]:
    reports = sorted(SOURCE_DIR.glob('report_*.md'))
    if not reports:
        raise FileNotFoundError(f'No report_*.md files found in {SOURCE_DIR}')
    latest = reports[-1]
    return latest, latest.read_text(encoding='utf-8', errors='replace')


def extract_meta(text: str) -> dict[str, str]:
    meta = {}
    for key in ['Fecha', 'Model']:
        match = re.search(rf'\*\*{re.escape(key)}:\*\*\s*(.+)', text)
        if match:
            meta[key.lower()] = match.group(1).strip()
    return meta


def extract_table(text: str, heading: str) -> dict[str, str]:
    pattern = rf'##\s+[^\n]*{re.escape(heading)}[^\n]*\n(?P<body>.*?)(?:\n---|\n##\s|\Z)'
    match = re.search(pattern, text, flags=re.S)
    if not match:
        return {}
    body = match.group('body')
    data: dict[str, str] = {}
    for raw in body.splitlines():
        line = raw.strip()
        if not line.startswith('|') or '---' in line or 'Métrica' in line:
            continue
        parts = [p.strip() for p in line.strip('|').split('|')]
        if len(parts) >= 2 and parts[0]:
            data[parts[0]] = parts[1]
    return data


def extract_code_block(text: str, heading: str) -> list[str]:
    pattern = rf'##\s+[^\n]*{re.escape(heading)}[^\n]*\n(?P<body>.*?)(?:\n---|\n##\s|\Z)'
    match = re.search(pattern, text, flags=re.S)
    if not match:
        return []
    body = match.group('body')
    code = re.search(r'```\n(?P<code>.*?)\n```', body, flags=re.S)
    if not code:
        return []
    return [line.strip() for line in code.group('code').splitlines() if line.strip()]


def extract_bullets(text: str, heading: str) -> list[str]:
    pattern = rf'##\s+[^\n]*{re.escape(heading)}[^\n]*\n(?P<body>.*?)(?:\n---|\n##\s|\Z)'
    match = re.search(pattern, text, flags=re.S)
    if not match:
        return []
    bullets = []
    for raw in match.group('body').splitlines():
        line = raw.strip()
        if line.startswith('- '):
            bullets.append(re.sub(r'\*\*', '', line[2:]).strip())
    return bullets


def classify_path(path: str) -> str:
    p = path.lower()
    if any(marker in p for marker in SENSITIVE_PATTERNS):
        return 'seguridad/sesiones privadas'
    if '/reports/' in p:
        return 'reportes'
    if '/logs/' in p or p.endswith('.log') or p.endswith('.jsonl'):
        return 'logs operativos'
    if '/cron/' in p:
        return 'automatizaciones cron'
    if '/workspace/' in p:
        return 'workspace operativo'
    if '/data_seed/' in p:
        return 'repositorio DataSeed'
    return 'otros cambios operativos'


def sanitize_changed_files(paths: list[str]) -> list[str]:
    counts = Counter(classify_path(path) for path in paths)
    return [f'{category}: {count}' for category, count in sorted(counts.items())]


def sanitize_summary_item(item: str) -> str:
    cleaned = re.sub(r'/opt/[\w./-]+', '[ruta interna]', item)
    cleaned = re.sub(r'\b[a-f0-9]{12,}\b', '[id]', cleaned, flags=re.I)
    return cleaned


def sanitize_system(system: dict[str, str]) -> dict[str, str]:
    allowed = ('Uptime', 'Load Average', 'Memoria', 'Disco', 'Procesos activos')
    return {key: system[key] for key in allowed if key in system}


def classify_health(system: dict[str, str]) -> dict[str, str]:
    disk = system.get('Disco', '')
    memory = system.get('Memoria', '')
    status = 'ok'
    notes = []
    disk_pct = re.search(r'\((\d+)%\)', disk)
    if disk_pct and int(disk_pct.group(1)) >= 80:
        status = 'warn'
        notes.append('Disco sobre 80%')
    load = system.get('Load Average', '')
    if load:
        try:
            first = float(load.split(',')[0].strip())
            if first >= 4:
                status = 'warn'
                notes.append('Load average alto')
        except Exception:
            pass
    if not notes:
        notes.append('Operación estable según métricas del reporte')
    return {'status': status, 'summary': '; '.join(notes), 'disk': disk, 'memory': memory}


def build_payload() -> dict:
    source, text = read_latest_report()
    meta = extract_meta(text)
    system = sanitize_system(extract_table(text, 'SISTEMA'))
    activity = extract_table(text, 'ACTIVIDAD DEL DÍA')
    raw_paths = extract_code_block(text, 'REGISTRO DE ACTIVIDAD')
    executive = extract_bullets(text, 'RESUMEN EJECUTIVO')
    report_date = meta.get('fecha', source.stem.replace('report_', ''))
    return {
        'schemaVersion': 2,
        'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
        'title': 'Reporte diario Demeter',
        'date': report_date,
        'system': system,
        'activity': activity,
        'changedFiles': sanitize_changed_files(raw_paths),
        'executiveSummary': [sanitize_summary_item(item) for item in executive],
        'health': classify_health(system),
        'technicalSummary': [
            f'Reporte fuente: {source.name}',
            f'Categorías de actividad detectadas: {len(set(classify_path(path) for path in raw_paths))}',
            'Payload sanitizado: no expone rutas absolutas, host interno, sesiones, credenciales ni markdown crudo.'
        ]
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default=str(DEFAULT_OUT), help='Private output JSON path')
    args = parser.parse_args()
    out = Path(args.output)
    payload = build_payload()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(out)


if __name__ == '__main__':
    main()
