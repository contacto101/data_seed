#!/usr/bin/env python3
"""Export the latest Demeter daily activity report into a static JSON asset.

The generated JSON is consumed by reports.html inside the authenticated DataSeed
portal. It intentionally excludes private file contents and only exposes the
same operational summary already present in /opt/data/reports/report_*.md.
"""
from __future__ import annotations

import datetime as dt
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = Path('/opt/data/reports')
OUT = ROOT / 'data' / 'demeter-daily-report.json'


def read_latest_report() -> tuple[Path, str]:
    reports = sorted(SOURCE_DIR.glob('report_*.md'))
    if not reports:
        raise FileNotFoundError(f'No report_*.md files found in {SOURCE_DIR}')
    latest = reports[-1]
    return latest, latest.read_text(encoding='utf-8', errors='replace')


def extract_meta(text: str) -> dict[str, str]:
    meta = {}
    for key in ['Fecha', 'Host', 'Model']:
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
    body = match.group('body')
    bullets = []
    for raw in body.splitlines():
        line = raw.strip()
        if line.startswith('- '):
            bullets.append(re.sub(r'\*\*', '', line[2:]).strip())
    return bullets


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


def main() -> None:
    source, text = read_latest_report()
    meta = extract_meta(text)
    system = extract_table(text, 'SISTEMA')
    activity = extract_table(text, 'ACTIVIDAD DEL DÍA')
    files = extract_code_block(text, 'REGISTRO DE ACTIVIDAD')
    executive = extract_bullets(text, 'RESUMEN EJECUTIVO')
    payload = {
        'schemaVersion': 1,
        'generatedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
        'sourceFile': str(source),
        'title': 'Reporte diario Demeter',
        'date': meta.get('fecha', source.stem.replace('report_', '')),
        'host': meta.get('host', ''),
        'model': meta.get('model', '').replace('owl', 'demeter'),
        'system': system,
        'activity': activity,
        'changedFiles': files,
        'executiveSummary': executive,
        'health': classify_health(system),
        'rawMarkdown': text.replace('OWL DAILY ACTIVITY REPORT', 'DEMETER DAILY ACTIVITY REPORT').replace('OWL Activity Monitor', 'Demeter Activity Monitor').replace('openrouter/owl-alpha', 'openrouter/demeter-alpha'),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(OUT)


if __name__ == '__main__':
    main()
