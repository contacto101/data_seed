# Inventario de branches DataSeed

Este inventario separa la fuente oficial (`main`) de ramas activas, operativas e históricas. Fue actualizado después de borrar ramas duplicadas/mergeadas con checkpoint de rollback.

## Regla operativa

- `main` es la fuente oficial publicada.
- `feat/task-tracking-system` es operativo y mantiene `task-log.md` / `daily-summary.md`.
- Las demás ramas listadas abajo contienen contenido único detectado; no deben borrarse como duplicadas sin integrar o archivar su contenido útil.
- Las ramas mergeadas/duplicadas pueden cerrarse solo después de crear tags de rollback.
- El grafo multi-branch deduplicado trata archivos idénticos entre ramas como conocimiento compartido, no como documentos diferentes.

## Branches activos observados

| Branch | SHA | Fecha | Estado | Último asunto |
|---|---:|---|---|---|
| `agent-landing-updates` | `6f676cd` | 2026-06-02 | Activo con contenido único / revisar antes de integrar o cerrar | fix: meet WCAG AA color contrast on Matrix landing |
| `docs/factory-protocols` | `db6d022` | 2026-06-08 | Activo con contenido único / revisar antes de integrar o cerrar | docs: factory protocols for autonomous agent manufacturing |
| `docs/hubspot-checkpoint-20260531` | `8562b0f` | 2026-06-03 | Activo con contenido único / revisar antes de integrar o cerrar | hero: cambiar Transforma por Convierte en H1 |
| `feat/publica-platform` | `451e149` | 2026-06-03 | Activo con contenido único / revisar antes de integrar o cerrar | feat: add ChileCompra connector, alerts endpoint, and frontend integration |
| `feat/task-tracking-system` | `cb30c27` | 2026-06-15 | Activo operativo | docs: registra limpieza final de ramas duplicadas |
| `internal-agent-console` | `4667cf2` | 2026-06-04 | Activo con contenido único / revisar antes de integrar o cerrar | fix: bust console module cache |
| `main` | `83b8c37` | 2026-06-15 | Activo oficial | docs: documenta checkpoint y limpieza de ramas duplicadas |
| `vercel/install-vercel-speed-insights-ivlisy` | `351decd` | 2026-06-03 | Activo con contenido único / revisar antes de integrar o cerrar | fix: rewrite demo as commercial sales agent (sync from main) |

## Ramas duplicadas borradas con checkpoint

| Branch borrado | SHA respaldado | Tag de rollback | Motivo |
|---|---:|---|---|
| `chore/optimize-multibranch-information` | `02a0e402fa1b` | `checkpoint/deleted/chore-optimize-multibranch-information-20260615-201112` | Mergeado en `main`; árbol idéntico a `main` antes de borrar |
| `refactor/repo-information-architecture` | `1e9f2cb10c33` | `checkpoint/deleted/refactor-repo-information-architecture-20260615-201112` | Mergeado en `main`; diff efectivo contra `main` vacío |
| `supabase-auth-staging` | `6a04768d314f` | `checkpoint/deleted/supabase-auth-staging-20260615-201112` | Grafo deduplicado final mostró `files_included_unique: 0`; contenido duplicado en ramas conservadas/checkpoint |

## Checkpoint principal

- Tag: `checkpoint/pre-branch-cleanup-20260615-201112`
- SHA main previo al borrado: `606130495f90`

## Rollback de ramas borradas

Para restaurar una rama borrada desde su tag de rollback:

```bash
git fetch origin --tags
git push origin refs/tags/checkpoint/deleted/chore-optimize-multibranch-information-20260615-201112:refs/heads/chore/optimize-multibranch-information
git push origin refs/tags/checkpoint/deleted/refactor-repo-information-architecture-20260615-201112:refs/heads/refactor/repo-information-architecture
git push origin refs/tags/checkpoint/deleted/supabase-auth-staging-20260615-201112:refs/heads/supabase-auth-staging
```

## Próxima higiene pendiente

Las ramas activas con contenido único deben revisarse en ciclos separados: integrar a `main`, mover a `archive/`, o cerrarlas con aprobación explícita si dejan de ser necesarias.
