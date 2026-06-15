# Inventario de branches DataSeed

Este inventario separa la fuente oficial (`main`) de ramas activas, operativas e históricas. Sirve para reducir duplicados en el grafo multi-branch y evitar que material viejo contamine la arquitectura de información.

## Regla operativa

- `main` es la fuente oficial publicada.
- `feat/task-tracking-system` es operativo y mantiene `task-log.md` / `daily-summary.md`.
- Las ramas activas deben alinearse gradualmente con la estructura de `main`: `docs/`, `site/`, `scripts/ops`, `scripts/web`, `archive/`.
- Las ramas mergeadas o históricas no se borran automáticamente; se cierran solo con confirmación humana explícita.
- El grafo multi-branch deduplicado debe tratar archivos idénticos entre ramas como conocimiento compartido, no como documentos diferentes.

## Branches observados

| Branch | SHA | Fecha | Estado | Último asunto |
|---|---:|---|---|---|
| `agent-landing-updates` | `6f676cd` | 2026-06-02 | Activo/candidato a integrar | fix: meet WCAG AA color contrast on Matrix landing |
| `docs/factory-protocols` | `db6d022` | 2026-06-08 | Activo/candidato a integrar | docs: factory protocols for autonomous agent manufacturing |
| `docs/hubspot-checkpoint-20260531` | `8562b0f` | 2026-06-03 | Histórico/candidato a archivar | hero: cambiar Transforma por Convierte en H1 |
| `feat/publica-platform` | `451e149` | 2026-06-03 | Activo/candidato a integrar | feat: add ChileCompra connector, alerts endpoint, and frontend integration |
| `feat/task-tracking-system` | `a8c2961` | 2026-06-15 | Activo operativo | docs: registra optimización multibranch del repo |
| `internal-agent-console` | `4667cf2` | 2026-06-04 | Activo/candidato a integrar | fix: bust console module cache |
| `main` | `da2ec24` | 2026-06-15 | Activo oficial | docs: actualiza plan operativo con resultados finales de la reorganización |
| `refactor/repo-information-architecture` | `1e9f2cb` | 2026-06-15 | Mergeado; candidato a cerrar tras respaldo | refactor: reorganiza arquitectura de información del repo |
| `supabase-auth-staging` | `6a04768` | 2026-06-05 | Activo/candidato a integrar | chore: ignore local backups and add sanitized auth seed example |
| `vercel/install-vercel-speed-insights-ivlisy` | `351decd` | 2026-06-03 | Histórico/candidato a archivar | fix: rewrite demo as commercial sales agent (sync from main) |

## Candidatos de higiene detectados por el grafo

- `refactor/repo-information-architecture`: ya fue mergeado a `main`; puede cerrarse tras confirmar que no se necesita como rama de rollback.
- `docs/hubspot-checkpoint-20260531`: parece checkpoint histórico; evaluar si su contenido debe vivir en `docs/commercial/` o `archive/`.
- `vercel/install-vercel-speed-insights-ivlisy`: branch puntual de integración; cerrar si el cambio ya fue absorbido o descartado.
- Ramas antiguas con `AGENT.md`, `hola*.txt`, `test_access.md` o logo en raíz deben migrar al patrón de `main` antes de considerarse activas.

## Criterios para cerrar una rama

1. El contenido útil está en `main` o documentado en `archive/`.
2. No hay trabajo pendiente no migrado.
3. El grafo multi-branch no necesita esa rama para explicar una decisión activa.
4. El operador humano aprueba explícitamente borrar o cerrar la rama remota.
