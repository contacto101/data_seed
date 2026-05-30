#!/usr/bin/env python3
from pathlib import Path
import json, datetime
ROOT = Path(__file__).resolve().parents[1]
opps = json.loads((ROOT/'data'/'publica-ai-demo-opportunities.json').read_text(encoding='utf-8'))
today = datetime.date.today().isoformat()
lines = [f"# Radar semanal Pública AI — demo {today}", "", "Este reporte demo implementa el flujo inicial captura → análisis → reporte semanal definido para Pública AI.", ""]
for i,o in enumerate(opps,1):
    lines += [f"## {i}. {o['titulo']}", f"- Comprador: {o['comprador']}", f"- Cierre: {o['cierre']}", f"- Monto: {o['monto']}", f"- Región: {o['region']}", f"- Razón del match: {o['match']}", f"- Dificultad: {o['dificultad']}", f"- Recomendación: {o['recomendacion']}", f"- Link oficial: {o['link']}", ""]
out = ROOT/'reports'/f'publica-ai-radar-demo-{today}.md'
out.write_text('\n'.join(lines), encoding='utf-8')
print(out)
