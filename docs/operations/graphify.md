# Graphify en DataSeed

## Estado

Graphify se usa para mapear relaciones entre archivos, funciones y conceptos del repositorio DataSeed.

Desde la optimización multi-branch, el grafo oficial se genera desde un snapshot temporal que incluye todos los branches remotos y deduplica archivos idénticos entre ramas. Esto evita que copias repetidas de `AGENT.md`, backups, wrappers, archivos de prueba o documentación histórica inflen artificialmente las comunidades.

## Archivos livianos versionados

- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/manifest.json`
- `graphify-out/.graphify_labels.json`

## Artefactos regenerables ignorados

- `graphify-out/graph.json`
- `graphify-out/graph.html`
- `graphify-out/cache/`
- snapshots multi-branch temporales.

## Generación multi-branch deduplicada

Script canónico:

- `scripts/generate-multibranch-graph.py`

Principios:

1. No hace checkout de ramas ni modifica el working tree durante el snapshot.
2. Exporta cada branch remoto con `git archive` hacia una carpeta temporal única.
3. Excluye secretos, `.env` reales, caches, bases runtime, binarios pesados, `node_modules`, `graphify-out`, archivos de prueba triviales (`hola*.txt`, `test_access.md`) y artefactos regenerables.
4. Deduplica por hash de contenido: si el mismo archivo aparece idéntico en varias ramas, se guarda una sola vez bajo `_shared/` y cada `BRANCH.md` apunta a esa copia compartida.
5. Trata documentos operativos globales (`backups/`, `AGENTS.md`, `README.md`, `docs/INDEX.md` y docs operativos del grafo/inventario) como fuente canónica de `main`; las copias históricas en ramas de feature no se indexan para evitar duplicación semántica.
6. Mantiene archivos divergentes bajo `branches/<branch>/...` para que el grafo preserve diferencias reales entre ramas.
7. Copia al repo solo los artefactos livianos versionados; `graph.html` y `graph.json` quedan disponibles para ZIP/visualización pero no se commitean.

## Uso

Después de cambios de arquitectura o cuando se necesite visión global de ramas:

```bash
python3 scripts/generate-multibranch-graph.py
```

Para preguntas puntuales de arquitectura, usar `graphify query`, `graphify path` o `graphify explain` cuando `graphify-out/graph.json` exista localmente.

## Criterios de calidad

Un grafo multi-branch se considera optimizado cuando:

- todos los branches remotos aparecen en `snapshot_manifest.json` y en los nodos del grafo;
- no hay referencias obsoletas a rutas reemplazadas del design system;
- los duplicados exactos entre branches se colapsan bajo `_shared/`;
- las ramas activas mantienen la estructura oficial: `docs/`, `site/`, `scripts/ops`, `scripts/web`, `archive/`;
- las ramas históricas están clasificadas en `docs/operations/branch-inventory.md`;
- el porcentaje de nodos aislados baja respecto al snapshot no deduplicado.

## Observación

El grafo multi-branch es útil para auditoría histórica y detección de drift. No reemplaza la fuente activa (`main`), pero sí muestra qué ramas aún contienen estructura antigua o duplicados que deben integrarse, cerrar o archivar con aprobación humana.
