# Graphify en DataSeed

## Estado

Graphify se usa para mapear relaciones entre archivos, funciones y conceptos del repo.

## Archivos livianos versionados

- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/manifest.json`
- `graphify-out/.graphify_labels.json`

## Artefactos regenerables ignorados

- `graphify-out/graph.json`
- `graphify-out/graph.html`
- `graphify-out/cache/`
- snapshots multibranch temporales.

## Uso

Antes de responder preguntas de arquitectura, usar `graphify query`, `graphify path` o `graphify explain` cuando el grafo exista. Después de cambios grandes, regenerar el grafo con extracción AST-only.

## Observación

El grafo multibranch es útil para auditoría histórica, pero no debe mezclarse con la fuente activa si no está claramente etiquetado.
