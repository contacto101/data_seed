# Graph Report - data_seed  (2026-06-14)

## Corpus Check
- 13 files · ~31,115 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 118 nodes · 195 edges · 15 communities (8 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `21d726a4`
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

## God Nodes (most connected - your core abstractions)
1. `Task Log - Demeter` - 16 edges
2. `build_backup_md()` - 14 edges
3. `copy_safe_cron_scripts()` - 11 edges
4. `update_repo_files()` - 11 edges
5. `DemoProxy` - 8 edges
6. `sanitize_text()` - 8 edges
7. `write_repo_file()` - 8 edges
8. `AGENTS.md — Guía del Agente Demeter para DataSeed` - 8 edges
9. `run()` - 7 edges
10. `assert_no_secret_values()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `run()` --calls--> `sanitize_text()`  [EXTRACTED]
  scripts/demeter_daily_backup.py → scripts/demeter_daily_backup.py  _Bridges community 0 → community 1_
- `is_approved_for_hardcopy()` --references--> `Path`  [EXTRACTED]
  scripts/demeter_daily_backup.py → scripts/demeter_daily_backup.py  _Bridges community 0 → community 14_
- `copy_safe_cron_scripts()` --calls--> `sanitize_text()`  [EXTRACTED]
  scripts/demeter_daily_backup.py → scripts/demeter_daily_backup.py  _Bridges community 1 → community 14_

## Import Cycles
- 1-file cycle: `scripts/demeter_daily_backup.py -> scripts/demeter_daily_backup.py`

## Communities (15 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.19
Nodes (25): datetime, Path, backup_outputs_summary(), build_backup_md(), commit_and_push(), config_summary(), copied_cron_scripts_summary(), cron_script_review_summary() (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.27
Nodes (13): assert_no_secret_values(), build_completed_cycles_md(), build_restore_guide(), build_restore_sh(), copy_graphify_outputs(), copy_new_scripts(), copy_self_to_repo(), default_completed_cycles_md() (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.21
Nodes (10): _completion_payload(), _cors_headers(), DemoProxy, _deterministic_guardrail_reply(), _rate_limit_check(), Return a safe canned reply for clearly out-of-scope or risky prompts., Guarantee public-demo guardrails even if the upstream model drifts., _sanitize_demo_payload() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (16): 2026-06-11 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet, 2026-06-12 | Daniel Caignet (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (8): AGENTS.md — Guía del Agente Demeter para DataSeed, Cómo solicitar cambios, Estilo editorial, Estructura de la landing, Flujo de trabajo, Grafo de conocimiento (Graphify), Identidad operativa, Reglas de operación

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (5): Archivos seguros de este backup, Guía de restauración crítica — DataSeed / Demeter, Nunca commitear, Pasos de recuperación, Principios

### Community 6 - "Community 6"
Cohesion: 0.40
Nodes (4): Archivos actualizados por este backup, Archivos operativos clave observados, Backup operativo no sensible — DataSeed / Demeter, Exclusiones estrictas

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (9): Any, copy_safe_cron_scripts(), is_approved_for_hardcopy(), load_cron_jobs_from_disk(), load_hardcopy_allowlist(), Load explicit human approvals for hard-copying cron scripts.      The file is in, Copy explicitly approved, non-sensitive cron scripts into scripts/cron/.      If, repo_path_for_cron_script() (+1 more)

## Knowledge Gaps
- **37 isolated node(s):** `restore.sh script`, `daily-operations-wrapper.sh script`, `daily-operations.sh script`, `daily-task-log-cleanup.sh script`, `StreamReader` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Path` connect `Community 0` to `Community 2`, `Community 14`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `run()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `restore.sh script`, `daily-operations-wrapper.sh script`, `daily-operations.sh script` to the rest of the system?**
  _43 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._