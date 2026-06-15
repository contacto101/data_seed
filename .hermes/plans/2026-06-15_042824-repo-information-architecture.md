# Reorganización de información DataSeed — Plan operativo

> Plan ejecutable por Demeter. El objetivo es reorganizar el repo sin perder información, con validación doble, control de efectos colaterales y rollback claro.

## Objetivo

Transformar el repo DataSeed desde una memoria acumulada hacia una arquitectura de información mantenible:

- fuentes maestras claras;
- documentación conectada por índice;
- scripts separados por rol operativo/web;
- sitio bajo `site/`;
- backups curados;
- históricos en `archive/`;
- graphify liviano en repo y artefactos grandes regenerables.

## Rama y seguridad

- Trabajar en rama dedicada: `refactor/repo-information-architecture`.
- No editar `main` directamente.
- No borrar información útil: archivar primero, eliminar solo archivos triviales de prueba si quedan cubiertos por histórico git.
- Crear un snapshot de rollback con commit base antes de mover archivos.
- Registrar la tarea en `task-log.md` del sistema de tracking cuando esté disponible.

## Fases iterativas

### Fase 0 — Preflight

1. Capturar commit base con `git rev-parse HEAD`.
2. Capturar branch y estado con `git status --short --untracked-files=all`.
3. Detectar archivos trackeados con `git ls-files`.
4. Revisar scripts activos y rutas actuales.
5. Revisar cron jobs existentes con herramienta `cronjob list` antes de modificar referencias documentales.

Criterio de avance: estado entendido, sin operaciones destructivas pendientes.

### Fase 1 — Preparar rama y rollback

1. Crear rama `refactor/repo-information-architecture` desde `main`.
2. Agregar archivo de plan en `.hermes/plans/`.
3. Agregar README de rollback en `docs/operations/rollback.md` o sección rollback dentro del plan operativo si se decide no crear archivo separado.

Rollback si falla: `git checkout main` o `git reset --hard <commit_base>` dentro de la rama, dejando `main` intacto.

### Fase 2 — Estructura documental

Crear:

- `README.md`
- `docs/INDEX.md`
- `docs/product/agent-engine.md`
- `docs/product/publica.md`
- `docs/product/roadmap.md`
- `docs/product/strategy.md`
- `docs/commercial/landing-copy.md`
- `docs/commercial/stakeholder-report.md`
- `docs/commercial/faq.md`
- `docs/commercial/sales-pitch.md`
- `docs/operations/demeter.md`
- `docs/operations/task-tracking.md`
- `docs/operations/daily-backup.md`
- `docs/operations/restore.md`
- `docs/operations/cronjobs.md`
- `docs/operations/graphify.md`
- `docs/security/secret-policy.md`
- `docs/security/demo-guardrails.md`
- `docs/security/auth-plan.md`
- `docs/security/public-demo-risk-review.md`

Criterio de avance: todos los documentos existen, apuntan a fuentes existentes y declaran estado activo/histórico/borrador.

### Fase 3 — Mover activos sin romper operación

1. Mover `index.html` a `site/index.html`.
2. Dejar compatibilidad en la raíz mediante un `index.html` liviano que redirige/carga `site/index.html`, salvo que se valide que el deploy usa `site/` directamente.
3. Mover scripts:
   - `scripts/daily-operations.sh` → `scripts/ops/daily-operations.sh`
   - `scripts/daily-operations-wrapper.sh` → `scripts/ops/daily-operations-wrapper.sh`
   - `scripts/demeter_daily_backup.py` → `scripts/ops/demeter_daily_backup.py`
   - `scripts/dataseed_demo_proxy.py` → `scripts/web/dataseed_demo_proxy.py`
4. Mantener wrappers de compatibilidad en rutas antiguas durante una iteración para no romper cron jobs ni procesos externos.

Criterio de avance: `bash -n` pasa en shells, `python3 -m py_compile` pasa en Python, y wrappers antiguos delegan a rutas nuevas.

### Fase 4 — Actualizar efectos colaterales

Actualizar referencias en:

- `AGENTS.md`
- `README.md`
- `backups/BACKUP.md`
- `backups/RESTORE_GUIDE.md`
- `backups/restore.sh`
- docs de operaciones
- scripts de backup (`ALLOWED_REPO_OUTPUTS`, rutas copiadas, instrucciones de regeneración)
- cron docs: los cronjobs deben apuntar a wrappers compatibles hasta que se haga migración real.

Criterio de avance: búsquedas por rutas viejas no muestran referencias rotas, o están marcadas como compatibilidad temporal.

### Fase 5 — Graphify y archivos regenerables

1. Mantener en repo solo:
   - `graphify-out/GRAPH_REPORT.md`
   - `graphify-out/manifest.json`
   - `graphify-out/.graphify_labels.json`
2. Agregar `.gitignore` para:
   - `graphify-out/cache/`
   - `graphify-out/graph.json`
   - `graphify-out/graph.html`
   - `graphify-out/.graphify_root`
   - `graphify-out/multibranch_manifest.json`
   - `graphify-out/MULTIBRANCH_README.md`
3. No eliminar artefactos locales no trackeados salvo que se cree respaldo o se confirme que son regenerables.

Criterio de avance: `git status --short --untracked-files=all` ya no queda inundado por cache Graphify.

### Fase 6 — Históricos y prueba

1. Mover o archivar archivos de prueba:
   - `hola.txt`
   - `hola_segundo.txt`
   - `hola_tercer.txt`
   - `hola_whatsapp.txt`
   - `test_access.md`
2. Preferencia: `archive/testing/` en vez de borrado directo.
3. Agregar `archive/README.md` explicando criterio.

Criterio de avance: raíz limpia y archivos recuperables.

### Fase 7 — Validación doble

Primer chequeo automático:

- `bash -n scripts/**/*.sh`
- `python3 -m py_compile scripts/**/*.py`
- revisar enlaces/rutas con script Python propio.
- revisar que no haya secretos en diff.
- revisar `git status` y `git diff --stat`.

Segundo chequeo cruzado:

- ejecutar wrappers con `--help` o modo dry-run si existe;
- validar que cron job actual siga teniendo ruta compatible;
- verificar que `backups/restore.sh` no falle por rutas nuevas;
- verificar que `README.md` y `docs/INDEX.md` cubren todos los documentos nuevos;
- ejecutar revisión independiente de diff si hay cambios de código.

Criterio de avance: cero errores bloqueantes. Si falla algo, corregir y repetir.

### Fase 8 — Commit, push y PR opcional

1. Commit con mensaje: `refactor: reorganiza arquitectura de información del repo`.
2. Push de rama.
3. Si `gh` está disponible, crear PR contra `main`; si no, entregar rama y comandos.

## Rollback operativo

Rollback local antes de merge:

```bash
git checkout refactor/repo-information-architecture
git reset --hard <commit_base>
git clean -fd -- .hermes docs scripts site archive README.md .gitignore
```

Rollback después de push pero antes de merge:

```bash
git checkout refactor/repo-information-architecture
git revert <commit_reorganizacion>
git push
```

Rollback si se rompe un proceso por rutas:

1. Mantener wrappers temporales en rutas antiguas.
2. Restaurar cron a `daily-operations-wrapper.sh` antiguo si fuera necesario.
3. Ejecutar `bash -n`/`py_compile`.
4. Probar wrapper manualmente.
5. Revertir commit si la restauración no es suficiente.

## Definition of Done

- Estructura objetivo creada.
- Scripts nuevos y wrappers de compatibilidad funcionando.
- Documentos activos conectados en `docs/INDEX.md`.
- Backups y restore actualizados.
- Graphify pesado ignorado como regenerable.
- Archivos de prueba fuera de la raíz.
- Validación doble completada con salida real.
- Commit y push realizados en rama segura.
