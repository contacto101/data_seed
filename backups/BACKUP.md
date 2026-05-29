# Backup operativo no sensible — DataSeed

**Identidad operativa:** Demeter  
**Timestamp Chile:** 2026-05-29 05:01:15 -04  
**Alcance:** configuración técnica no sensible para recuperación operativa.  
**Política:** secretos, credenciales, tokens, archivos `.env`, `auth.json`, `google_token.json`, `google_client_secret.json`, sesiones y llaves quedan excluidos.

Los datos se tratan como semillas técnicas: se ordenan, se cultivan y se mantienen recuperables para análisis, automatización y decisiones útiles.

## Referencias de restauración

- Guía principal: `backups/RESTORE_GUIDE.md`
- Script operativo: `backups/restore.sh`
- Este backup no reemplaza la guía ni el script de restauración.

## Runtime y configuración general no sensible

- Runtime/software base: Hermes Agent.
- Modelo por defecto configurado: `gpt-5.5`.
- Proveedor por defecto configurado: `openai-codex`.
- URL base configurada para proveedor por defecto: `https://chatgpt.com/backend-api/codex`.
- Proveedor fallback declarado: `openrouter` con modelo `nvidia/nemotron-3-super-120b-a12b:free`.
- Toolset global declarado en configuración: `hermes-cli`.
- Backend terminal: `local`.
- Directorio de trabajo por defecto de terminal: `.`.
- Timeout terminal: `180` segundos.
- Persistencia de shell: habilitada.
- Imagen contenedor declarada: `nikolaik/python-nodejs:python3.11-nodejs20`.
- Web backend configurado: `firecrawl`.
- Checkpoints: deshabilitados.
- Compresión de contexto: habilitada.
- Prompt caching: `5m`.
- Límite lectura de archivos: `100000` caracteres.
- Límite salida de herramienta: `50000` bytes, `2000` líneas.
- Variables, credenciales, claves, sesiones y valores largos sensibles: excluidos o redactados.

## Skills instalados

### Skills instalados en `/opt/data/skills`

- `apple`
- `autonomous-ai-agents`
- `business-strategy-delivery`
- `creative`
- `data-science`
- `devops`
- `diagramming`
- `dogfood`
- `domain`
- `email`
- `gaming`
- `gifs`
- `github`
- `inference-sh`
- `mcp`
- `media`
- `mlops`
- `note-taking`
- `productivity`
- `red-teaming`
- `research`
- `smart-home`
- `social-media`
- `software-development`
- `whatsapp-group-etiquette`
- `yuanbao`

### Skills base presentes en `/opt/hermes/skills`

- `apple`
- `autonomous-ai-agents`
- `creative`
- `data-science`
- `devops`
- `diagramming`
- `dogfood`
- `domain`
- `email`
- `gaming`
- `gifs`
- `github`
- `inference-sh`
- `mcp`
- `media`
- `mlops`
- `note-taking`
- `productivity`
- `red-teaming`
- `research`
- `smart-home`
- `social-media`
- `software-development`
- `yuanbao`

## Toolsets habilitados

- Configuración global: `hermes-cli`.
- Job `Demeter Daily Backup`: `terminal`, `file`, `cronjob`.
- Otros jobs programados: sin override explícito de toolsets; usan configuración heredada del runtime.

## Cron jobs configurados

| ID | Nombre | Schedule | Estado | Habilitado | Próxima ejecución UTC | Última ejecución UTC | Último estado |
|---|---|---:|---|---|---|---|---|
| `8b29cf53ca6c` | `Demeter Daily Backup` | `0 9 * * *` | `scheduled` | `true` | `2026-05-30T09:00:00+00:00` | `2026-05-28T09:05:50.479614+00:00` | `ok` |
| `f6254c8c4821` | `Growth Engine — Reporte Matutino 7:30 AM` | `30 11 * * *` | `scheduled` | `true` | `2026-05-29T11:30:00+00:00` | `2026-05-28T11:32:20.413833+00:00` | `ok` |
| `4ab827188183` | `Growth Engine — Reporte Vespertino 7:30 PM` | `30 23 * * *` | `scheduled` | `true` | `2026-05-29T23:30:00+00:00` | `2026-05-28T23:31:58.812241+00:00` | `ok` |
| `d1a0c5131f4b` | `Growth Engine — Auto Backlog Updater` | `0 */4 * * *` | `scheduled` | `true` | `2026-05-29T12:00:00+00:00` | `2026-05-29T08:05:48.967901+00:00` | `error: HTTP 429 free-model limit` |

Notas de seguridad:
- Prompts de cron excluidos.
- Destinos de entrega, chats, nombres visibles, identificadores de conversación y datos de origen excluidos.
- Errores se reducen a categoría técnica cuando pueden revelar contexto operativo.

## Estado operativo relevante

### Gateway

- Proceso gateway activo: `pid 11`.
- Comando técnico: `/opt/hermes/.venv/bin/hermes gateway run`.
- Estado gateway: `running`.
- Agentes activos reportados: `0`.
- Plataforma de mensajería: `whatsapp` en estado `connected`.
- Última actualización de plataforma: `2026-05-29T06:52:46.282444+00:00`.

### STT/TTS

- Herramienta TTS disponible en runtime: módulo `tts_tool` presente.
- Herramienta STT/transcripción disponible en runtime: módulo `transcription_tools` presente.
- No se detectaron procesos dedicados STT/TTS en ejecución durante la captura.

### Memoria y estado

- Base de estado presente: `/opt/data/state.db`.
- Archivos WAL/SHM presentes para estado transaccional.
- Herramienta de memoria disponible en runtime: módulo `memory_tool` presente.
- Contenido de memoria no incluido por política de minimización.

### Backups

- Repositorio de backup clonado temporalmente en `/tmp/data_seed_backup`.
- Archivo actualizado: `backups/BACKUP.md`.
- Restauración documentada por `backups/RESTORE_GUIDE.md` y `backups/restore.sh`.
- Limpieza final esperada: eliminación de `/tmp/data_seed_backup` al concluir el job.

### Repositorios

- Repositorio destino: `ZeroSentinels/data_seed`.
- Rama de trabajo: `main`.
- Remote técnico: `https://github.com/ZeroSentinels/data_seed.git`.
- Ruta local temporal: `/tmp/data_seed_backup`.

## Exclusiones obligatorias aplicadas

- No se incluyen archivos `.env`.
- No se incluyen `auth.json`, `google_token.json`, `google_client_secret.json` ni secretos OAuth.
- No se incluyen sesiones, cookies, credenciales, llaves privadas ni tokens.
- No se incluyen prompts completos de jobs programados.
- No se incluyen destinos personales, nombres visibles de chats ni credenciales de procesos.
- No se incluyen backups de configuración con valores históricos sensibles.

## Verificación

- `RESTORE_GUIDE.md`: conservado sin sobrescritura.
- `restore.sh`: conservado sin sobrescritura.
- `BACKUP.md`: regenerado con configuración no sensible y estado operativo actual.
- Política de identidad: documento emitido por Demeter; referencias a Hermes limitadas a runtime/software base, CLI o rutas técnicas.
