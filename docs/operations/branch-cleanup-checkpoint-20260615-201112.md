# Checkpoint de limpieza de branches DataSeed

Checkpoint creado antes de borrar ramas duplicadas/mergeadas.

## Fecha / ID

- ID: `20260615-201112`
- Repo: `contacto101/data_seed`
- Main checkpoint tag: `checkpoint/pre-branch-cleanup-20260615-201112`
- Main SHA: `606130495f907ff8c347f174f60db724602ad72a`

## Ramas borradas

| Branch | SHA | Tag rollback | Evidencia |
|---|---:|---|---|
| `chore/optimize-multibranch-information` | `02a0e402fa1bd274d8af7476692c1bac2261542e` | `checkpoint/deleted/chore-optimize-multibranch-information-20260615-201112` | Mergeado en `main`; árbol idéntico a `main` antes de borrar |
| `refactor/repo-information-architecture` | `1e9f2cb10c33961037e4d85636510e1803688256` | `checkpoint/deleted/refactor-repo-information-architecture-20260615-201112` | Mergeado en `main`; diff efectivo contra `main` vacío |
| `supabase-auth-staging` | `6a04768d314f90bbc5633f91e9b0f3f165035d50` | `checkpoint/deleted/supabase-auth-staging-20260615-201112` | Grafo deduplicado final mostró `files_included_unique: 0`; contenido duplicado en ramas conservadas/checkpoint |

## Ramas conservadas

Se conservaron las ramas con contenido único o rol operativo:

- `agent-landing-updates` — Activo con contenido único / revisar antes de integrar o cerrar — `6f676cd`
- `docs/factory-protocols` — Activo con contenido único / revisar antes de integrar o cerrar — `db6d022`
- `docs/hubspot-checkpoint-20260531` — Activo con contenido único / revisar antes de integrar o cerrar — `8562b0f`
- `feat/publica-platform` — Activo con contenido único / revisar antes de integrar o cerrar — `451e149`
- `feat/task-tracking-system` — Activo operativo — `cb30c27`
- `internal-agent-console` — Activo con contenido único / revisar antes de integrar o cerrar — `4667cf2`
- `vercel/install-vercel-speed-insights-ivlisy` — Activo con contenido único / revisar antes de integrar o cerrar — `351decd`

## Rollback rápido

```bash
git fetch origin --tags
git push origin refs/tags/checkpoint/deleted/chore-optimize-multibranch-information-20260615-201112:refs/heads/chore/optimize-multibranch-information
git push origin refs/tags/checkpoint/deleted/refactor-repo-information-architecture-20260615-201112:refs/heads/refactor/repo-information-architecture
git push origin refs/tags/checkpoint/deleted/supabase-auth-staging-20260615-201112:refs/heads/supabase-auth-staging
```

## Validación esperada post-limpieza

- `main` limpio y sincronizado con `origin/main`.
- Graphify multi-branch regenerado solo con branches remotos existentes.
- Cero referencias obsoletas del design system.
- Cron runtime sincronizado y con último estado OK.
