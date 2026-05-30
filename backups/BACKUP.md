# Backup operativo no sensible — DataSeed

**Identidad operativa:** Demeter
**Timestamp Chile:** 2026-05-30 05:03:20 -04 (-0400)
**Alcance:** configuración técnica no sensible para recuperación operativa.
**Política:** secretos, credenciales, tokens, archivos `.env`, `auth.json`, `google_token.json`, `google_client_secret.json`, sesiones, llaves y destinos personales quedan excluidos.

Los datos se conservan como semillas técnicas: orden mínimo, trazabilidad y restauración verificable para análisis, automatización y decisiones útiles.

## Referencias de restauración

- Guía principal: `backups/RESTORE_GUIDE.md`.
- Script operativo: `backups/restore.sh`.
- Este backup no reemplaza ni sobrescribe la guía ni el script de restauración.

## Runtime y configuración general no sensible

- Runtime/software base: Hermes Agent.
- Modelo por defecto configurado: `gpt-5.5`.
- Proveedor por defecto configurado: `openai-codex`.
- URL base configurada: `https://chatgpt.com/backend-api/codex`.
- Fallback declarado: proveedor `openrouter`, modelo `nvidia/nemotron-3-super-120b-a12b:free`.
- Toolset global declarado: `hermes-cli`.
- Backend terminal: `local`; shell persistente habilitada; timeout terminal `180` segundos.
- Backend web configurado: `firecrawl`.
- Checkpoints: deshabilitados.
- Compresión de contexto: habilitada; prompt caching `5m`.
- Límites: lectura de archivos `100000` caracteres; salida de herramienta `50000` bytes y `2000` líneas.
- TTS: proveedor `edge`, voz `es-CL-CatalinaNeural`; auto TTS deshabilitado.
- STT: habilitado, proveedor `local`, modelo `large`.
- Memoria: `memory_enabled=true`, `user_profile_enabled=true`, límites `2200/1375` caracteres.
- Seguridad: URLs privadas no permitidas; Tirith habilitado; instalaciones diferidas permitidas.
- Plataformas: WhatsApp configurado con `require_mention=true`; detalles de chats excluidos.

## Skills instalados

- Directorio primario: `/opt/data/skills` (96 skills detectados).
- Categorías primarias: `apple`, `autonomous-ai-agents`, `business-strategy-delivery`, `creative`, `data-science`, `devops`, `diagramming`, `dogfood`, `domain`, `email`, `gaming`, `gifs`, `github`, `inference-sh`, `mcp`, `media`, `mlops`, `note-taking`, `productivity`, `red-teaming`, `research`, `smart-home`, `social-media`, `software-development`, `whatsapp-group-etiquette`, `yuanbao`.
- Categorías base del runtime: `apple`, `autonomous-ai-agents`, `creative`, `data-science`, `devops`, `diagramming`, `dogfood`, `domain`, `email`, `gaming`, `gifs`, `github`, `inference-sh`, `mcp`, `media`, `mlops`, `note-taking`, `productivity`, `red-teaming`, `research`, `smart-home`, `social-media`, `software-development`, `yuanbao`.

### Lista de skills detectados por `SKILL.md`

- `apple/apple-notes`
- `apple/apple-reminders`
- `apple/findmy`
- `apple/imessage`
- `apple/macos-computer-use`
- `autonomous-ai-agents/claude-code`
- `autonomous-ai-agents/codex`
- `autonomous-ai-agents/hermes-agent`
- `autonomous-ai-agents/opencode`
- `business-strategy-delivery`
- `creative/architecture-diagram`
- `creative/ascii-art`
- `creative/ascii-video`
- `creative/baoyu-comic`
- `creative/baoyu-infographic`
- `creative/claude-design`
- `creative/comfyui`
- `creative/creative-ideation`
- `creative/design-md`
- `creative/excalidraw`
- `creative/humanizer`
- `creative/manim-video`
- `creative/p5js`
- `creative/pixel-art`
- `creative/popular-web-designs`
- `creative/pretext`
- `creative/sketch`
- `creative/songwriting-and-ai-music`
- `creative/touchdesigner-mcp`
- `data-science/jupyter-live-kernel`
- `devops/kanban-orchestrator`
- `devops/kanban-worker`
- `devops/webhook-subscriptions`
- `dogfood`
- `email/himalaya`
- `gaming/minecraft-modpack-server`
- `gaming/pokemon-player`
- `github/codebase-inspection`
- `github/github-auth`
- `github/github-code-review`
- `github/github-issues`
- `github/github-pr-workflow`
- `github/github-repo-management`
- `mcp/native-mcp`
- `media/gif-search`
- `media/heartmula`
- `media/songsee`
- `media/spotify`
- `media/youtube-content`
- `mlops/evaluation/lm-evaluation-harness`
- `mlops/evaluation/weights-and-biases`
- `mlops/huggingface-hub`
- `mlops/inference/llama-cpp`
- `mlops/inference/obliteratus`
- `mlops/inference/vllm`
- `mlops/models/audiocraft`
- `mlops/models/segment-anything`
- `mlops/research/dspy`
- `note-taking/obsidian`
- `productivity/airtable`
- `productivity/business-growth-strategy`
- `productivity/dataseed-hubspot-control-plan`
- `productivity/google-workspace`
- `productivity/linear`
- `productivity/maps`
- `productivity/markdown-backlog-maintenance`
- `productivity/nano-pdf`
- `productivity/notion`
- `productivity/ocr-and-documents`
- `productivity/powerpoint`
- `productivity/teams-meeting-pipeline`
- `red-teaming/godmode`
- `research/arxiv`
- `research/blogwatcher`
- `research/current-procedure-research`
- `research/llm-wiki`
- `research/polymarket`
- `research/research-paper-writing`
- `smart-home/openhue`
- `social-media/xurl`
- `software-development/agent-landing-manager`
- `software-development/critical-context-checkpoint`
- `software-development/debugging-hermes-tui-commands`
- `software-development/hermes-agent-skill-authoring`
- `software-development/node-inspect-debugger`
- `software-development/plan`
- `software-development/python-debugpy`
- `software-development/requesting-code-review`
- `software-development/spike`
- `software-development/static-site-lead-capture`
- `software-development/subagent-driven-development`
- `software-development/systematic-debugging`
- `software-development/test-driven-development`
- `software-development/writing-plans`
- `whatsapp-group-etiquette`
- `yuanbao`

## Toolsets habilitados

- Configuración global: `hermes-cli`.
- Toolsets por plataforma `cli` y `whatsapp`: `browser`, `clarify`, `code_execution`, `computer_use`, `cronjob`, `delegation`, `file`, `image_gen`, `memory`, `messaging`, `session_search`, `skills`, `terminal`, `todo`, `tts`, `vision`, `web`.
- Plugin toolset conocido: `spotify` para `cli` y `whatsapp`.
- Job `Demeter Daily Backup`: override explícito `terminal`, `file`, `cronjob`.
- Jobs sin override explícito: heredan configuración del runtime.

## Cron jobs configurados

| ID | Nombre | Schedule UTC | Estado | Habilitado | Próxima ejecución UTC | Última ejecución UTC | Último estado | Ejecuciones | Toolsets explícitos |
|---|---|---:|---|---|---|---|---|---:|---|
| `8b29cf53ca6c` | `Demeter Daily Backup` | `0 9 * * *` | `scheduled` | `true` | `2026-05-31T09:00:00+00:00` | `2026-05-29T09:03:26.702570+00:00` | `ok` | `2` | `terminal`, `file`, `cronjob` |
| `f6254c8c4821` | `Growth Engine — Reporte Matutino 7:30 AM` | `30 11 * * *` | `scheduled` | `true` | `2026-05-30T11:30:00+00:00` | `2026-05-29T11:31:26.641624+00:00` | `ok` | `2` | heredado |
| `4ab827188183` | `Growth Engine — Reporte Vespertino 7:30 PM` | `30 23 * * *` | `scheduled` | `true` | `2026-05-30T23:30:00+00:00` | `2026-05-29T23:31:26.464459+00:00` | `ok` | `2` | heredado |
| `d1a0c5131f4b` | `Growth Engine — Auto Backlog Updater` | `0 */4 * * *` | `scheduled` | `true` | `2026-05-30T12:00:00+00:00` | `2026-05-30T08:01:50.086274+00:00` | `ok` | `14` | heredado |

Notas de seguridad: prompts completos, destinos de entrega, chats, nombres visibles, identificadores de conversación y datos de origen no se incluyen.

## Estado operativo relevante

### Gateway

- Estado gateway: `running`.
- PID técnico: `11`.
- Comando técnico: `/opt/hermes/.venv/bin/hermes gateway run`.
- Agentes activos reportados: `0`.
- Plataforma WhatsApp: estado `connected`, última actualización `2026-05-29T06:52:46.282444+00:00`.
- Modo voz por chat detectado en archivo de estado; identificadores excluidos.

### STT/TTS

- STT habilitado en configuración: proveedor local, modelo large.
- TTS configurado: proveedor edge, voz es-CL-CatalinaNeural.
- No se respaldan cachés de audio, grabaciones ni transcripciones.

### Memoria y estado

- Base de estado presente: `/opt/data/state.db` con WAL/SHM asociados.
- Memoria habilitada; contenido de memoria excluido por minimización y seguridad.
- Archivos de sesiones y dumps operativos excluidos.

### Backups y repositorios

- Repositorio destino: `ZeroSentinels/data_seed`.
- Rama de trabajo: `main`; HEAD previo al backup: `7ed0b3c`.
- Ruta temporal de trabajo: `/tmp/data_seed_backup`.
- Archivo regenerado: `backups/BACKUP.md`.
- Archivos de restauración referenciados y conservados: `backups/RESTORE_GUIDE.md`, `backups/restore.sh`.

### Procesos auxiliares observados

- Bridge WhatsApp activo como proceso Node administrado por el gateway.
- Bridge OAuth HubSpot local observado en ejecución; credenciales y parámetros sensibles excluidos.
- Túnel `cloudflared` local observado hacia `127.0.0.1:8787`; URL pública no incluida.

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
