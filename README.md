# DataSeed Repository Map

DataSeed transforma datos dispersos en terreno fértil para análisis, automatización y decisiones accionables. Este repositorio organiza la landing pública, documentación operativa/comercial, scripts de Demeter y material de recuperación no sensible.

## Fuentes maestras

| Área | Fuente maestra | Estado |
|---|---|---|
| Operación de Demeter | `AGENTS.md` | Activo |
| Identidad visual | `docs/product/design-system.md` | Activo |
| Índice documental | `docs/INDEX.md` | Activo |
| Recuperación crítica | `backups/RESTORE_GUIDE.md` | Activo |
| Sitio público | `site/index.html` | Activo |

## Estructura activa

- `site/`: landing pública y assets web.
- `docs/product/`: productos DataSeed, Agent Engine y Pública.
- `docs/commercial/`: copy, pitch, FAQ y material de ventas.
- `docs/operations/`: Demeter, task tracking, backup diario, cronjobs, Graphify y rollback.
- `docs/security/`: política de secretos, guardrails demo, auth y revisión de riesgos.
- `scripts/ops/`: scripts operativos canónicos.
- `scripts/web/`: proxy/demo web.
- `backups/`: snapshots curados, no sensibles.
- `archive/`: material histórico o pruebas conservadas para trazabilidad.

## Compatibilidad temporal

Los scripts antiguos bajo `scripts/` se mantienen como wrappers hacia `scripts/ops/` o `scripts/web/` para evitar romper cronjobs, restauraciones o procesos externos mientras se migra el runtime.

## Graphify

El repo conserva solo archivos livianos del grafo:

- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/manifest.json`
- `graphify-out/.graphify_labels.json`

`graphify-out/graph.json`, `graph.html` y `cache/` son regenerables y quedan ignorados por Git.

## Recuperación

Ejecutar una verificación segura:

```bash
bash backups/restore.sh
```

Los secretos, sesiones, bases runtime, logs completos y credenciales nunca deben estar en el repo.
