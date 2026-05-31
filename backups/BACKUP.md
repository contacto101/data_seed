# Backup operativo no sensible — DataSeed

**Identidad operativa:** Demeter  
**Timestamp Chile:** 2026-05-31 05:00:49 -04 (-0400)  
**Alcance:** configuración técnica no sensible para recuperación operativa.  
**Política:** secretos, credenciales, tokens, archivos `.env`, `auth.json`, `google_token.json`, `google_client_secret.json`, sesiones, llaves privadas, cookies, prompts completos y destinos personales quedan excluidos.

Los datos se conservan como semillas técnicas: orden mínimo, trazabilidad y restauración verificable para análisis, automatización y decisiones útiles.

## Referencias de restauración

- Guía principal: `backups/RESTORE_GUIDE.md`.
- Script operativo: `backups/restore.sh`.
- Este backup actualiza solo `backups/BACKUP.md`; la guía y el script de restauración se conservan sin sobrescritura.

## Runtime y configuración general no sensible

- Runtime/software base: Hermes Agent v0.15.1, proyecto `/opt/hermes`, Python `3.13.5`.
- Estado de actualización reportado por CLI: 1 commit detrás de la imagen `nousresearch/hermes-agent:latest`.
- Modelo por defecto configurado: `gpt-5.5`.
- Proveedor por defecto configurado: `openai-codex`.
- URL base configurada: `https://chatgpt.com/backend-api/codex`.
- Toolset global declarado: `hermes-cli`.
- Backend terminal: `local`; shell persistente habilitada; timeout terminal `180` segundos.
- Backend web configurado: `firecrawl`; gateway web deshabilitado.
- Checkpoints: deshabilitados; retención configurada 7 días; máximo 20 snapshots si se habilitan.
- Compresión de contexto: habilitada; threshold 80%; target ratio 20%; protección de últimos 20 mensajes y primeros 3 mensajes no sistema.
- Prompt caching: TTL `5m`.
- Límites: salida de herramienta `50000` bytes, `2000` líneas, longitud de línea `2000`.
- TTS: proveedor `edge`, voz `es-CL-CatalinaNeural`; otros proveedores definidos solo como configuración técnica no activa.
- STT: habilitado, proveedor `local`, modelo `large`.
- Memoria: `memory_enabled=true`, `user_profile_enabled=true`, límites `2200/1375` caracteres.
- Seguridad: URLs privadas no permitidas; Tirith habilitado; instalaciones diferidas permitidas; redacción de secretos configurada.
- Plataformas de mensajería: Telegram y Discord no configurados por CLI; WhatsApp opera mediante bridge administrado por gateway.

## Skills instalados

- Resumen CLI: `0` hub-installed, `85` builtin, `7` local; `92` enabled, `0` disabled.
- Directorio primario: `/opt/data/skills` (`99` `SKILL.md` detectados, incluyendo archivo `.archive`).
- Directorio base del runtime: `/opt/hermes/skills` (`90` `SKILL.md` detectados).
- Categorías detectadas: `apple`, `autonomous-ai-agents`, `business-strategy-delivery`, `creative`, `data-science`, `devops`, `dogfood`, `email`, `gaming`, `github`, `mcp`, `media`, `mlops`, `note-taking`, `productivity`, `red-teaming`, `research`, `smart-home`, `social-media`, `software-development`, `whatsapp-group-etiquette`, `yuanbao`.

### Skills habilitados reportados por CLI

- `business-strategy-delivery` — local — enabled
- `dogfood` — builtin — enabled
- `whatsapp-group-etiquette` — local — enabled
- `yuanbao` — builtin — enabled
- `autonomous-ai-agents/claude-code` — builtin — enabled
- `autonomous-ai-agents/codex` — builtin — enabled
- `autonomous-ai-agents/hermes-agent` — builtin — enabled
- `autonomous-ai-agents/kanban-codex-lane` — builtin — enabled
- `autonomous-ai-agents/opencode` — builtin — enabled
- `creative/architecture-diagram` — builtin — enabled
- `creative/ascii-art` — builtin — enabled
- `creative/ascii-video` — builtin — enabled
- `creative/baoyu-article-illustrator` — builtin — enabled
- `creative/baoyu-comic` — builtin — enabled
- `creative/baoyu-infographic` — builtin — enabled
- `creative/claude-design` — builtin — enabled
- `creative/comfyui` — builtin — enabled
- `creative/design-md` — builtin — enabled
- `creative/excalidraw` — builtin — enabled
- `creative/humanizer` — builtin — enabled
- `creative/ideation` — builtin — enabled
- `creative/manim-video` — builtin — enabled
- `creative/p5js` — builtin — enabled
- `creative/pixel-art` — builtin — enabled
- `creative/popular-web-designs` — builtin — enabled
- `creative/pretext` — builtin — enabled
- `creative/sketch` — builtin — enabled
- `creative/songwriting-and-ai-music` — builtin — enabled
- `creative/touchdesigner-mcp` — builtin — enabled
- `data-science/jupyter-live-kernel` — builtin — enabled
- `devops/kanban-orchestrator` — builtin — enabled
- `devops/kanban-worker` — builtin — enabled
- `devops/webhook-subscriptions` — builtin — enabled
- `email/himalaya` — builtin — enabled
- `gaming/minecraft-modpack-server` — builtin — enabled
- `gaming/pokemon-player` — builtin — enabled
- `github/codebase-inspection` — builtin — enabled
- `github/github-auth` — builtin — enabled
- `github/github-code-review` — builtin — enabled
- `github/github-issues` — builtin — enabled
- `github/github-pr-workflow` — builtin — enabled
- `github/github-repo-management` — builtin — enabled
- `mcp/native-mcp` — builtin — enabled
- `media/gif-search` — builtin — enabled
- `media/heartmula` — builtin — enabled
- `media/songsee` — builtin — enabled
- `media/spotify` — builtin — enabled
- `media/youtube-content` — builtin — enabled
- `mlops/audiocraft-audio-generation` — builtin — enabled
- `mlops/dspy` — builtin — enabled
- `mlops/evaluating-llms-harness` — builtin — enabled
- `mlops/huggingface-hub` — builtin — enabled
- `mlops/llama-cpp` — builtin — enabled
- `mlops/obliteratus` — builtin — enabled
- `mlops/segment-anything-model` — builtin — enabled
- `mlops/serving-llms-vllm` — builtin — enabled
- `mlops/weights-and-biases` — builtin — enabled
- `note-taking/obsidian` — builtin — enabled
- `productivity/airtable` — builtin — enabled
- `productivity/dataseed-hubspot-control-plan` — local — enabled
- `productivity/google-workspace` — builtin — enabled
- `productivity/linear` — builtin — enabled
- `productivity/maps` — builtin — enabled
- `productivity/markdown-backlog-maintenance` — local — enabled
- `productivity/nano-pdf` — builtin — enabled
- `productivity/notion` — builtin — enabled
- `productivity/ocr-and-documents` — builtin — enabled
- `productivity/powerpoint` — builtin — enabled
- `productivity/teams-meeting-pipeline` — builtin — enabled
- `red-teaming/godmode` — builtin — enabled
- `research/arxiv` — builtin — enabled
- `research/blogwatcher` — builtin — enabled
- `research/current-procedure-research` — local — enabled
- `research/llm-wiki` — builtin — enabled
- `research/polymarket` — builtin — enabled
- `research/research-paper-writing` — builtin — enabled
- `smart-home/openhue` — builtin — enabled
- `social-media/xurl` — builtin — enabled
- `software-development/agent-landing-manager` — local — enabled
- `software-development/critical-context-checkpoint` — local — enabled
- `software-development/debugging-hermes-tui-commands` — builtin — enabled
- `software-development/hermes-agent-skill-authoring` — builtin — enabled
- `software-development/hermes-s6-container-supervision` — builtin — enabled
- `software-development/node-inspect-debugger` — builtin — enabled
- `software-development/plan` — builtin — enabled
- `software-development/python-debugpy` — builtin — enabled
- `software-development/requesting-code-review` — builtin — enabled
- `software-development/spike` — builtin — enabled
- `software-development/subagent-driven-development` — builtin — enabled
- `software-development/systematic-debugging` — builtin — enabled
- `software-development/test-driven-development` — builtin — enabled
- `software-development/writing-plans` — builtin — enabled

## Toolsets habilitados

- Configuración global: `hermes-cli`.
- Toolsets por plataforma `cli` y `whatsapp`: `browser`, `clarify`, `code_execution`, `computer_use`, `cronjob`, `delegation`, `file`, `image_gen`, `memory`, `messaging`, `session_search`, `skills`, `terminal`, `todo`, `tts`, `vision`, `web`.
- Plugin toolset conocido: `spotify` para `cli` y `whatsapp`.
- Job `Demeter Daily Backup`: override explícito `terminal`, `file`, `cronjob`.
- Jobs sin override explícito: heredan configuración del runtime.

## Cron jobs configurados

| ID | Nombre | Schedule UTC | Estado | Habilitado | Próxima ejecución UTC | Última ejecución UTC | Último estado | Ejecuciones | Toolsets explícitos |
|---|---|---:|---|---|---|---|---|---:|---|
| `8b29cf53ca6c` | `Demeter Daily Backup` | `0 9 * * *` | `scheduled` | `true` | `2026-06-01T09:00:00+00:00` | `2026-05-30T09:04:27.781230+00:00` | `ok` | `3` | `terminal`, `file`, `cronjob` |
| `f6254c8c4821` | `Growth Engine — Reporte Matutino 7:30 AM` | `30 11 * * *` | `scheduled` | `true` | `2026-05-31T11:30:00+00:00` | `2026-05-30T11:31:34.817407+00:00` | `ok` | `3` | heredado |
| `4ab827188183` | `Growth Engine — Reporte Vespertino 7:30 PM` | `30 23 * * *` | `scheduled` | `true` | `2026-05-31T23:30:00+00:00` | `2026-05-30T23:31:40.547983+00:00` | `ok` | `3` | heredado |
| `d1a0c5131f4b` | `Growth Engine — Auto Backlog Updater` | `0 */4 * * *` | `scheduled` | `true` | `2026-05-31T12:00:00+00:00` | `2026-05-31T08:01:06.890929+00:00` | `ok` | `20` | heredado |

Notas de seguridad: prompts completos, destinos de entrega, chats, nombres visibles, identificadores de conversación y datos de origen no se incluyen.

## Estado operativo relevante

### Gateway

- Estado gateway: `running`.
- PID técnico: `11`.
- Comando técnico: `/opt/hermes/.venv/bin/hermes gateway run`.
- Modo de servicio: ejecución manual, no instalada como servicio del sistema.
- Bridge WhatsApp activo como proceso Node administrado por gateway: `node /opt/hermes/scripts/whatsapp-bridge/bridge.js --port 3000 --session /opt/data/whatsapp/session --mode bot`.
- Identificadores de chats, sesiones y URLs públicas se excluyen.

### STT/TTS

- STT habilitado en configuración: proveedor local, modelo `large`.
- TTS configurado: proveedor edge, voz `es-CL-CatalinaNeural`.
- No se respaldan cachés de audio, grabaciones ni transcripciones.

### Memoria y estado

- Memoria habilitada; perfil de usuario habilitado.
- Base de estado esperada: `/opt/data/state.db` con archivos auxiliares si están presentes.
- Contenido de memoria, sesiones, dumps de requests y logs con posible información operativa sensible quedan excluidos.

### Backups y repositorios

- Repositorio destino: `ZeroSentinels/data_seed`.
- Rama de trabajo: `main`.
- HEAD previo al backup: `be9eb03`.
- Ruta temporal de trabajo: `/tmp/data_seed_backup`.
- Archivo regenerado: `backups/BACKUP.md`.
- Archivos de restauración referenciados y conservados: `backups/RESTORE_GUIDE.md`, `backups/restore.sh`.

## Exclusiones obligatorias aplicadas

- Archivos `.env`, `auth.json`, `google_token.json`, `google_client_secret.json` y credenciales OAuth no se incluyen.
- Tokens, API keys, contraseñas, client secrets, cookies, sesiones, llaves privadas y credenciales Git no se incluyen.
- Prompts completos de jobs, destinos personales, nombres visibles y datos de entrega no se incluyen.
- Cachés de audio, imagen, documentos y archivos con nombres sensibles no se incluyen.
- Configuraciones históricas `config.yaml.bak*` no se incluyen por posible presencia de valores obsoletos sensibles.

## Verificación

- `backups/RESTORE_GUIDE.md`: conservado sin sobrescritura.
- `backups/restore.sh`: conservado sin sobrescritura.
- `backups/BACKUP.md`: regenerado con configuración no sensible y estado operativo actual.
- Política de identidad: documento emitido por Demeter; menciones a Hermes limitadas a runtime/software base, CLI, rutas técnicas o nombres técnicos de skills.
