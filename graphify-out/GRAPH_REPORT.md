# Graph Report - data_seed  (2026-06-12)

## Corpus Check
- 12 files · ~31,407 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 113 nodes · 185 edges · 14 communities (8 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d41bb8db`
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

## God Nodes (most connected - your core abstractions)
1. `build_backup_md()` - 14 edges
2. `Backup operativo no sensible — DataSeed / Demeter` - 12 edges
3. `copy_safe_cron_scripts()` - 11 edges
4. `Task Log - Demeter` - 10 edges
5. `update_repo_files()` - 9 edges
6. `DemoProxy` - 8 edges
7. `sanitize_text()` - 8 edges
8. `run()` - 7 edges
9. `AGENT.md — Guía del Agente Demeter para DataSeed` - 7 edges
10. `config_summary()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `run()` --references--> `Path`  [EXTRACTED]
  scripts/demeter_daily_backup.py → scripts/demeter_daily_backup.py  _Bridges community 0 → community 5_
- `run()` --calls--> `sanitize_text()`  [EXTRACTED]
  scripts/demeter_daily_backup.py → scripts/demeter_daily_backup.py  _Bridges community 0 → community 3_
- `is_allowed_repo_output()` --calls--> `Path`  [EXTRACTED]
  scripts/demeter_daily_backup.py → scripts/demeter_daily_backup.py  _Bridges community 5 → community 3_

## Import Cycles
- 1-file cycle: `scripts/demeter_daily_backup.py -> scripts/demeter_daily_backup.py`

## Communities (14 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.20
Nodes (22): datetime, backup_outputs_summary(), build_backup_md(), commit_and_push(), config_summary(), copied_cron_scripts_summary(), cron_script_review_summary(), cron_summary() (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.21
Nodes (10): _completion_payload(), _cors_headers(), DemoProxy, _deterministic_guardrail_reply(), _rate_limit_check(), Return a safe canned reply for clearly out-of-scope or risky prompts., Guarantee public-demo guardrails even if the upstream model drifts., _sanitize_demo_payload() (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (12): Archivos actualizados por este backup, Archivos operativos clave observados, Backup operativo no sensible — DataSeed / Demeter, Configuración Hermes sanitizada, Cron jobs configurados y estado, Estado técnico, Exclusiones estrictas, Identidad operativa (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.29
Nodes (11): assert_no_secret_values(), build_completed_cycles_md(), build_restore_guide(), build_restore_sh(), copy_self_to_repo(), default_completed_cycles_md(), is_allowed_repo_output(), main() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (10): 2026-06-11 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.27
Nodes (10): Any, Path, copy_safe_cron_scripts(), is_approved_for_hardcopy(), load_cron_jobs_from_disk(), load_hardcopy_allowlist(), Load explicit human approvals for hard-copying cron scripts.      The file is in, Copy explicitly approved, non-sensitive cron scripts into scripts/cron/.      If (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (7): AGENT.md — Guía del Agente Demeter para DataSeed, Cómo solicitar cambios, Estilo editorial, Estructura de la landing, Flujo de trabajo, Identidad operativa, Reglas de operación

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (5): Archivos seguros de este backup, Guía de restauración crítica — DataSeed / Demeter, Nunca commitear, Pasos de recuperación, Principios

## Knowledge Gaps
- **37 isolated node(s):** `restore.sh script`, `daily-task-log-cleanup.sh script`, `daily-task-log-wrapper.sh script`, `StreamReader`, `Identidad operativa` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Path` connect `Community 5` to `Community 0`, `Community 1`, `Community 3`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `run()` connect `Community 0` to `Community 3`, `Community 5`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `restore.sh script`, `daily-task-log-cleanup.sh script`, `daily-task-log-wrapper.sh script` to the rest of the system?**
  _41 weakly-connected nodes found - possible documentation gaps or missing edges._