# Graph Report - data_seed  (2026-06-15)

## Corpus Check
- 39 files · ~38,553 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 324 nodes · 377 edges · 40 communities (32 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `10394d67`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 126|Community 126]]

## God Nodes (most connected - your core abstractions)
1. `build_backup_md()` - 14 edges
2. `Backup operativo no sensible — DataSeed / Demeter` - 14 edges
3. `Design System — DataSeed` - 12 edges
4. `copy_safe_cron_scripts()` - 11 edges
5. `update_repo_files()` - 11 edges
6. `Fases iterativas` - 10 edges
7. `AGENT.md — Guía del Agente Demeter para DataSeed` - 9 edges
8. `sanitize_text()` - 8 edges
9. `write_repo_file()` - 8 edges
10. `DemoProxy` - 8 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- 1-file cycle: `scripts/ops/demeter_daily_backup.py -> scripts/ops/demeter_daily_backup.py`

## Communities (40 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (49): Any, datetime, assert_no_secret_values(), backup_outputs_summary(), build_backup_md(), build_completed_cycles_md(), build_python_compat_wrapper(), build_restore_guide() (+41 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (33): 10. Anti-Patterns (prohibido), 11. Checklist pre-entrega, 1. Identidad de Marca, 2. Paleta de Colores, 4. Espaciado y Grid, 5. Componentes, 6. Iconografía, 7. Motion y Animación (+25 more)

### Community 2 - "Community 2"
Cohesion: 0.21
Nodes (10): StreamReader, StreamWriter, _completion_payload(), _cors_headers(), DemoProxy, _deterministic_guardrail_reply(), _rate_limit_check(), Return a safe canned reply for clearly out-of-scope or risky prompts. (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (15): Definition of Done, Fase 0 — Preflight, Fase 1 — Preparar rama y rollback, Fase 2 — Estructura documental, Fase 3 — Mover activos sin romper operación, Fase 4 — Actualizar efectos colaterales, Fase 5 — Graphify y archivos regenerables, Fase 6 — Históricos y prueba (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.20
Nodes (9): AGENT.md — Guía del Agente Demeter para DataSeed, Cómo solicitar cambios, Estilo editorial, Estructura activa del repositorio, Estructura de la landing, Flujo de trabajo, Grafo de conocimiento (Graphify), Identidad operativa (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.22
Nodes (8): ¿Es solo una consultora BI?, Estado, FAQ comercial DataSeed, ¿La demo usa datos reales?, Preguntas base, ¿Qué es Agent Engine?, ¿Qué es Pública by DataSeed?, ¿Qué hace DataSeed?

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (7): Archivo, Comercial, Fuentes maestras, Operaciones, Producto, Seguridad, Índice maestro de documentación DataSeed

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (7): AGENT.md — Guía del Agente Demeter para DataSeed, Cómo solicitar cambios, Estilo editorial, Estructura de la landing, Flujo de trabajo, Identidad operativa, Reglas de operación

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (7): Cliente ideal inicial, Diferenciales, Estado, Promesa, Próxima acción, Pública by DataSeed, Resumen ejecutivo

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (7): Estado, Fase 1 — Ordenar el repositorio, Fase 2 — Producto demostrable, Fase 3 — Pública MVP, Fase 4 — Plataforma privada, Fase 5 — Operación robusta, Roadmap DataSeed

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (7): 3. Tipografías, Escala tipográfica, Fuente principal: Syne, Fuente secundaria: Inter, Fuente terciaria (dashboards/mono): JetBrains Mono, Google Fonts import (usar en todos los HTML), Reglas de tipografía

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (6): Archivos incluidos, Backup diario operativo, Estado, Excluido, Pipeline, Script canónico

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): Archivos livianos versionados, Artefactos regenerables ignorados, Estado, Graphify en DataSeed, Observación, Uso

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (6): Antes de merge, Commit base, Después de push pero antes de merge, Rollback — reorganización de información, Si falla cron, Si falla landing

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (6): Archivos, Estado, Regla, Script, Task tracking DataSeed / Demeter, Validación

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (6): Casos demo permitidos, DataSeed Agent Engine, Estado, Fuente técnica, Propuesta, Próxima acción

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (6): Estrategia de producto DataSeed, Fuente, Líneas activas, Narrativa, Posicionamiento, Tesis central

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (6): Decisión recomendada, Estado, Estado original observado, Plan de autenticación DataSeed, Próxima acción, Riesgo

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (5): Archivos seguros de este backup, Guía de restauración crítica — DataSeed / Demeter, Nunca commitear, Pasos de recuperación, Principios

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (5): Estado, Estructura, Landing copy DataSeed, Mensaje central, Reglas de edición

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (5): CTA, Para Pública by DataSeed, Pitch corto, Pitch ejecutivo, Sales pitch DataSeed

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (5): Estado, Puntos reutilizables, Reporte ejecutivo para stakeholders — síntesis, Síntesis, Uso recomendado

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (5): Cronjobs Hermes — DataSeed, Estado observado, Impacto de la reorganización, Migración recomendada después de merge, Rollback

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (5): Fuente maestra, Operación de Demeter, Próxima acción, Reglas clave, Rol

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (5): Fuente maestra, Principio, Restauración operativa, Rutas nuevas, Verificación rápida

### Community 25 - "Community 25"
Cohesion: 0.13
Nodes (14): Archivos actualizados por este backup, Archivos operativos clave observados, Backup operativo no sensible — DataSeed / Demeter, Configuración Hermes sanitizada, Cron jobs configurados y estado, Estado técnico, Exclusiones estrictas, Grafo de conocimiento del proyecto (Graphify) (+6 more)

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (5): Fuente técnica, Guardrails de demo pública, Principios, Tópicos permitidos, Verificación sugerida

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (5): Estado, Hallazgo principal, Regla activa, Revisión de riesgo — portal/reportes públicos, Riesgos

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (3): Archivo DataSeed, Regla, Subdirectorios

### Community 126 - "Community 126"
Cohesion: 0.29
Nodes (6): Compatibilidad temporal, DataSeed Repository Map, Estructura activa, Fuentes maestras, Graphify, Recuperación

## Knowledge Gaps
- **183 isolated node(s):** `restore.sh script`, `daily-operations-wrapper.sh script`, `daily-operations.sh script`, `daily-operations-wrapper.sh script`, `daily-operations.sh script` (+178 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Path` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Design System — DataSeed` connect `Community 1` to `Community 10`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `restore.sh script`, `daily-operations-wrapper.sh script`, `daily-operations.sh script` to the rest of the system?**
  _189 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10204081632653061 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Community 25` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._