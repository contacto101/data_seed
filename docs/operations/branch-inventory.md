# Inventario de branches DataSeed

Este inventario separa la fuente oficial (`main`) de ramas activas, operativas e históricas. Última actualización: 2026-06-17.

## Regla operativa

- `main` es la fuente oficial publicada.
- `feat/task-tracking-system` es operativo y mantiene `task-log.md` / `daily-summary.md`.
- Las demás ramas listadas abajo contienen contenido único detectado; no deben borrarse sin integrar o archivar su contenido útil.
- Las ramas mergeadas/duplicadas pueden cerrarse solo después de crear tags de rollback.
- El grafo multi-branch deduplicado trata archivos idénticos entre ramas como conocimiento compartido, no como documentos diferentes.

## Branches activos

| Branch | SHA | Fecha | Estado | Contenido único |
|---|---|---|---|---|
| `agent-landing-updates` | `6f676cd` | 2026-06-02 | Feature / pendiente integrar | Blog posts, landing Matrix, WCAG fixes, publica report scripts |
| `docs/factory-protocols` | `db6d022` | 2026-06-08 | Feature / pendiente integrar | Factory protocols (6 docs), auth seed example, supabase migrations |
| `docs/hubspot-checkpoint-20260531` | `8562b0f` | 2026-06-31 | Feature / pendiente integrar | HubSpot adapter checkpoint, copy change en H1 |
| `feat/publica-platform` | `451e149` | 2026-06-03 | Feature / pendiente integrar | ChileCompra connector, Publica API, alerts endpoint, tests |
| `feat/task-tracking-system` | `cb30c27` | 2026-06-15 | Operativo | Task log, daily summary, Graphify liviano |
| `internal-agent-console` | `4667cf2` | 2026-06-04 | Feature / pendiente integrar | Ops dashboard, console components, session store |
| `main` | `b43bb3e` | 2026-06-17 | Oficial | Demo 24/7 con Caddy, proxy endurecido, grafo deduplicado |
| `vercel/install-vercel-speed-insights-ivlisy` | `351decd` | 2026-06-03 | Candidato a archivar | Vercel Speed Insights install, versión vieja del proxy |

## Ramas duplicadas borradas (con checkpoint)

| Branch borrado | Tag de rollback | Motivo |
|---|---|---|
| `chore/optimize-multibranch-information` | `checkpoint/deleted/chore-optimize-multibranch-information-20260615-201112` | Mergeado en main; contenido idéntico |
| `refactor/repo-information-architecture` | `checkpoint/deleted/refactor-repo-information-architecture-20260615-201112` | Mergeado en main; diff efectivo vacío |
| `supabase-auth-staging` | `checkpoint/deleted/supabase-auth-staging-20260615-201112` | Contenido duplicado; 0 archivos únicos |

## Checkpoints

| Tag | Descripción |
|---|---|
| `checkpoint/pre-branch-cleanup-20260615-201112` | Estado previo al primer borrado de duplicados |
| `checkpoint/demo-production-24x7-20260617-142129` | Pre-deploy de demo 24/7 |
| `checkpoint/post-demo-deploy-20260617-142452` | Post-deploy de demo 24/7 en main |
| `checkpoint/pre-cleanup-20260617-142129` | Pre-limpieza general |

## Rollback

Para restaurar una rama borrada desde su tag:

```bash
git push origin refs/tags/<tag>:refs/heads/<nombre-rama>
```

## Resumen

- **3 ramas duplicadas borradas** (con checkpoint)
- **6 ramas de feature activas** (con contenido único, pendientes de integrar)
- **1 candidata a archivar** (vercel)
- **1 operativa** (task-tracking-system)
- **1 oficial** (main)
