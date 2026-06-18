# Reorganización de información DataSeed — Plan operativo — COMPLETADO

> Plan ejecutado por Demeter. Reorganizó el repo sin perder información, con validación doble, control de efectos colaterales y rollback claro.
> **Estado: ✅ FINALIZADO — Mergeado a main y pusheado.**

## Objetivo

Transformar el repo DataSeed desde una memoria acumulada hacia una arquitectura de información mantenible:

- fuentes maestras claras;
- documentación conectada por índice;
- scripts separados por rol operativo/web;
- sitio bajo `site/`;
- backups curados;
- históricos en `archive/`;
- graphify liviano en repo y artefactos grandes regenerables.

## Resultado final

### Commits realizados

| Commit | Mensaje | Rama |
|--------|---------|------|
| `1e9f2cb` | refactor: reorganiza arquitectura de información del repo | refactor/repo-information-architecture |
| `9ca16ef` | refactor: mueve design-system MASTER.md a docs/product/ y actualiza índice | refactor/repo-information-architecture |
| `0f77b96` | refactor: merge reorganización arquitectura de información del repo | main |

### Push realizados

- `origin/main` → 0f77b96 (upstream actualizado)
- `origin/refactor/repo-information-architecture` → 9ca16ef
- `origin/feat/task-tracking-system` → 49ba44a (task-log actualizado)

## Estructura final en main

```
├── AGENTS.md                  (guía operativa activa)
├── README.md                  (nuevo, con mapa del repo)
├── index.html                 (redirect → site/index.html)
├── .gitignore                 (ignora graphify cache, runtime, secrets)
│
├── docs/
│   ├── INDEX.md               (índice maestro de documentación)
│   ├── product/
│   │   ├── agent-engine.md
│   │   ├── design-system.md   (movido de design-system/MASTER.md)
│   │   ├── publica.md
│   │   ├── roadmap.md
│   │   └── strategy.md
│   ├── commercial/
│   │   ├── faq.md
│   │   ├── landing-copy.md
│   │   ├── sales-pitch.md
│   │   └── stakeholder-report.md
│   ├── operations/
│   │   ├── cronjobs.md
│   │   ├── daily-backup.md
│   │   ├── demeter.md
│   │   ├── graphify.md
│   │   ├── restore.md
│   │   ├── rollback.md
│   │   └── task-tracking.md
│   └── security/
│       ├── auth-plan.md
│       ├── demo-guardrails.md
│       ├── public-demo-risk-review.md
│       └── secret-policy.md
│
├── scripts/
│   ├── daily-operations.sh           (wrapper → ops/)
│   ├── daily-operations-wrapper.sh   (wrapper → ops/)
│   ├── demeter_daily_backup.py       (wrapper → ops/)
│   ├── dataseed_demo_proxy.py        (wrapper → web/)
│   ├── ops/
│   │   ├── daily-operations.sh       (canónico)
│   │   ├── daily-operations-wrapper.sh (canónico)
│   │   ├── daily-task-log-cleanup.sh (sanitizado)
│   │   └── demeter_daily_backup.py   (canónico)
│   └── web/
│       └── dataseed_demo_proxy.py    (canónico, error 502 genérico)
│
├── site/
│   ├── index.html                    (landing pública)
│   └── assets/
│       └── dataseed_logo_black.png
│
├── backups/
│   ├── BACKUP.md
│   ├── COMPLETED_CYCLES.md
│   ├── RESTORE_GUIDE.md
│   └── restore.sh
│
├── archive/
│   ├── README.md
│   ├── legacy/
│   │   └── AGENT.md                  (histórico)
│   └── testing/
│       ├── hola.txt
│       ├── hola_segundo.txt
│       ├── hola_tercer.txt
│       ├── hola_whatsapp.txt
│       └── test_access.md
│
├── graphify-out/
│   ├── .graphify_labels.json
│   ├── GRAPH_REPORT.md
│   └── manifest.json
│
└── .hermes/plans/
    └── 2026-06-15_042824-repo-information-architecture.md
```

## Graphify resultado final

- **324 nodos · 377 edges · 39 communities**
- Corpus: 39 archivos · ~38,577 palabras
- Extracción: 100% EXTRACTED, 0% INFERRED
- Archivos pesados ignorados: `graph.json`, `graph.html`, `cache/`, snapshots multibranch

## Validaciones realizadas (segunda verificación)

| Validación | Resultado |
|------------|-----------|
| Estructura de carpetas | ✅ 14/14 correctos |
| Archivos clave existentes | ✅ 50/50 |
| Archivos prohibidos en raíz | ✅ 0 encontrados |
| Raíz limpia | ✅ (AGENTS.md, README.md, index.html) |
| Redirect raíz → site | ✅ meta-refresh + JS |
| Logo referenciado en site/ | ✅ assets/dataseed_logo_black.png |
| Wrappers apuntan a canónicos | ✅ 4/4 |
| py_compile Python | ✅ 0 errores |
| bash -n shell | ✅ 0 errores |
| Precedencia scripts canónicos | ✅ SCRIPT_DIR primero |
| Proxy sin str(e) | ✅ devuelve "demo_unavailable" |
| Secretos en diff | ✅ 0 hits |
| .gitignore graphify | ✅ 6/6 entradas |
| restore.sh actualizado | ✅ verifica ops/ |
| JSON válidos (manifest, labels) | ✅ |
| design-system/ en raíz | ✅ eliminado |
| docs/INDEX.md cobertura | ✅ 20/20 docs |

## Correcciones post-primera-validación

1. **design-system/MASTER.md**: No estaba contemplado en el plan original. Se movió a `docs/product/design-system.md` y se actualizó `docs/INDEX.md`.
2. **Precedencia canónica**: `scripts/ops/daily-operations.sh` ahora prefiere `$SCRIPT_DIR/daily-task-log-cleanup.sh` y `$SCRIPT_DIR/demeter_daily_backup.py` antes de caer a `/opt/data/scripts/*`.
3. **Proxy demo**: Error 502 ya no devuelve `str(e)`, devuelve `{"error":"demo_unavailable"}`.

## Rollback post-merge (si fuera necesario)

```bash
git revert 0f77b96 --no-edit
git push origin main
```

O para deshacer completamente (destructivo):

```bash
git reset --hard 2953fa5  # último commit antes de la reorganización
git push origin main --force  # solo si no hay otro trabajo posterior
```

## Lecciones aprendidas

- El `design-system/MASTER.md` debe incluirse explícitamente en el plan desde el preflight; no asumir que está en docs/ si estaba en raíz.
- El manifest de Graphify no trae archivos ocultos como `.gitignore`; verificar por separado.
- La primera revisión independiente detectó correctamente los dos puntos que corregí (precedencia canónica y proxy str(e)).
- Los wrappers de compatibilidad deben verificarse con grep del basename, no del path completo.

## Definition of Done — Cumplido

- [x] Estructura objetivo creada.
- [x] Scripts nuevos y wrappers de compatibilidad funcionando.
- [x] Documentos activos conectados en `docs/INDEX.md`.
- [x] Backups y restore actualizados.
- [x] Graphify pesado ignorado como regenerable.
- [x] Archivos de prueba fuera de la raíz.
- [x] Validación doble completada con salida real (0 fallos, 0 warnings).
- [x] Grafo regenerado y organización óptima confirmada.
- [x] Commit y push realizados en rama segura.
- [x] Merge a main sin conflictos.
- [x] Push de main a origin/main.
