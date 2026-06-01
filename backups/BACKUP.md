# Backup operativo no sensible — DataSeed

**Identidad operativa:** Demeter  
**Timestamp Chile:** 2026-06-01 05:02:48 -04 (-0400)  
**Alcance:** configuración técnica no sensible para recuperación operativa.  
**Política:** secretos, credenciales, tokens, API keys, client secrets, contraseñas, archivos `.env`, `auth.json`, `google_token.json`, `google_client_secret.json`, sesiones OAuth, cookies, llaves privadas, prompts completos y destinos personales quedan excluidos.

Los datos se conservan como semillas técnicas: orden, trazabilidad y restauración verificable para análisis, automatización y decisiones útiles.

## Referencias de restauración

- Guía principal: `backups/RESTORE_GUIDE.md`.
- Script operativo: `backups/restore.sh`.
- Este backup actualiza solo `backups/BACKUP.md`; la guía y el script de restauración se conservan sin sobrescritura.

## Runtime y configuración general no sensible

- Runtime/software base: Hermes Agent v0.15.1, proyecto `/opt/hermes`, Python `3.13.5`.
- Estado de actualización reportado por CLI: 1 commit detrás de la imagen `nousresearch/hermes-agent:latest`.
- Modelo por defecto configurado: `gpt-5.5`.
- Proveedor por defecto configurado: `openai-codex`.
- URL base técnica configurada: `https://chatgpt.com/backend-api/codex`.
- Toolset global declarado: `hermes-cli`.
- Backend terminal: `local`; shell persistente habilitada; timeout terminal `180` segundos.
- Backend web configurado: `firecrawl`; gateway web deshabilitado.
- Checkpoints: deshabilitados; retención configurada 7 días; máximo 20 snapshots si se habilitan.
- Compresión de contexto: habilitada; threshold 80%; target ratio 20%; protección de últimos 20 mensajes y primeros 3 mensajes no sistema.
- Prompt caching: TTL `5m`.
- Límites de salida de herramienta: `50000` bytes, `2000` líneas, longitud de línea `2000`.
- Seguridad: URLs privadas no permitidas; Tirith habilitado; redacción de secretos configurada; instalaciones diferidas permitidas.
- Aprobaciones: modo manual; modo cron `deny`; confirmaciones destructivas habilitadas.
- LSP: habilitado con estrategia de instalación automática.

## Estado STT/TTS

- STT: habilitado, proveedor `local`, modelo `large`.
- TTS: proveedor `edge`, voz `es-CL-CatalinaNeural`.
- Voz interactiva: `auto_tts=false`, beep habilitado, máximo de grabación `120` segundos.
- No se respaldan cachés de audio, grabaciones ni transcripciones.

## Memoria y estado

- Memoria integrada: activa.
- Proveedor externo de memoria: ninguno configurado; operación con memoria integrada.
- Configuración: `memory_enabled=true`, `user_profile_enabled=true`, límites `2200/1375` caracteres.
- Plugins de memoria disponibles no configurados: `byterover`, `hindsight`, `holographic`, `honcho`, `mem0`, `openviking`, `retaindb`, `supermemory`.
- Bases de datos detectadas: `/opt/data/state.db` y `/opt/data/kanban.db`; no se incluyen contenidos.
- Contenido de memoria, sesiones, request dumps, logs y perfiles con datos operativos quedan excluidos.

## Gateway, mensajería y procesos técnicos

- Gateway: activo, PID técnico `11`, ejecutado manualmente como `/opt/hermes/.venv/bin/hermes gateway run`.
- Cron por gateway: activo; 4 jobs activos; próxima ejecución reportada `2026-06-01T11:30:00+00:00`.
- Bridge WhatsApp: activo como proceso Node en puerto interno `3000`, sesión en `/opt/data/whatsapp/session`, modo `bot`.
- Telegram, Discord, Slack, Mattermost y Matrix: configuración general presente sin canales permitidos explícitos en `config.yaml`.
- MCP: sin servidores MCP configurados.
- No se respaldan identificadores de chats, sesiones, URLs públicas, credenciales de gateway ni archivos de sesión.

## Toolsets habilitados

### Built-in toolsets CLI

- Habilitados: `web`, `browser`, `terminal`, `file`, `code_execution`, `vision`, `image_gen`, `tts`, `skills`, `todo`, `memory`, `session_search`, `clarify`, `delegation`, `cronjob`, `messaging`, `computer_use`.
- Deshabilitados: `video`, `video_gen`, `x_search`, `moa`, `context_engine`, `homeassistant`, `spotify`, `yuanbao`.

### Plugin toolsets CLI

- Habilitado: `google_meet`.

## Plugins

- `google_meet`: enabled, versión `0.2.0`, bundled.
- Plugins bundled detectados no habilitados incluyen backends de browser, dashboard auth, disk cleanup, image generation y model providers. No se listan configuraciones sensibles ni variables de entorno.

## Skills instalados

- Resumen CLI: `0` hub-installed, `85` builtin, `9` local; `94` enabled, `0` disabled.
- Directorio primario: `/opt/data/skills`.
- `SKILL.md` detectados en directorio primario sin contar archivo de `.archive`: `99`.
- Directorios archivados o curator backups no se consideran estado activo.

### Lista técnica detectada por filesystem

- `apple/apple-notes`
- `apple/apple-reminders`
- `apple/findmy`
- `apple/imessage`
- `apple/macos-computer-use`
- `autonomous-ai-agents/claude-code`
- `autonomous-ai-agents/codex`
- `autonomous-ai-agents/hermes-agent`
- `autonomous-ai-agents/kanban-codex-lane`
- `autonomous-ai-agents/opencode`
- `business-strategy-delivery`
- `creative/architecture-diagram`
- `creative/ascii-art`
- `creative/ascii-video`
- `creative/baoyu-article-illustrator`
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
- `mlops/cloud-ml-training-orchestration`
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
- `productivity/dataseed-hubspot-control-plan`
- `productivity/google-workspace`
- `productivity/linear`
- `productivity/maps`
- `productivity/markdown-backlog-maintenance`
- `productivity/meeting-assistant-automation`
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
- `software-development/hermes-s6-container-supervision`
- `software-development/node-inspect-debugger`
- `software-development/plan`
- `software-development/python-debugpy`
- `software-development/requesting-code-review`
- `software-development/spike`
- `software-development/subagent-driven-development`
- `software-development/systematic-debugging`
- `software-development/test-driven-development`
- `software-development/writing-plans`
- `whatsapp-group-etiquette`
- `yuanbao`

## Cron jobs configurados

| ID | Nombre | Schedule UTC | Estado | Próxima ejecución UTC | Última ejecución UTC | Último estado | Entrega |
|---|---|---:|---|---|---|---|---|
| `8b29cf53ca6c` | `Demeter Daily Backup` | `0 9 * * *` | active | `2026-06-02T09:00:00+00:00` | `2026-05-31T09:03:14.024864+00:00` | ok | origin |
| `f6254c8c4821` | `Growth Engine — Reporte Matutino 7:30 AM` | `30 11 * * *` | active | `2026-06-01T11:30:00+00:00` | `2026-05-31T11:31:27.950246+00:00` | ok | origin |
| `4ab827188183` | `Growth Engine — Reporte Vespertino 7:30 PM` | `30 23 * * *` | active | `2026-06-01T23:30:00+00:00` | `2026-05-31T23:31:48.884574+00:00` | ok | origin |
| `d1a0c5131f4b` | `Growth Engine — Auto Backlog Updater` | `0 */4 * * *` | active | `2026-06-01T12:00:00+00:00` | `2026-06-01T08:01:34.936749+00:00` | ok | origin |

Notas de seguridad: prompts completos, destinos de entrega, chats, nombres visibles externos, identificadores de conversación y datos de origen no se incluyen.

## Backups y repositorios

- Repositorio destino: `ZeroSentinels/data_seed`.
- Rama de trabajo temporal: `main`.
- Ruta temporal de trabajo: `/tmp/data_seed_backup`.
- Archivo regenerado: `backups/BACKUP.md`.
- Archivos de restauración referenciados y conservados: `backups/RESTORE_GUIDE.md`, `backups/restore.sh`.
- Clonación realizada por HTTPS público porque `HERMES_TOKEN` no estaba definido en el entorno del job; el push se intenta con credenciales Git disponibles del entorno.

## Exclusiones obligatorias aplicadas

- Archivos `.env`, `auth.json`, `google_token.json`, `google_client_secret.json` y credenciales OAuth no se incluyen.
- Tokens, API keys, contraseñas, client secrets, cookies, sesiones, llaves privadas y credenciales Git no se incluyen.
- Prompts completos de jobs, destinos personales, nombres visibles externos y datos de entrega no se incluyen.
- Cachés de audio, imagen, documentos y archivos con nombres sensibles no se incluyen.
- Configuraciones históricas `config.yaml.bak*` no se incluyen por posible presencia de valores obsoletos sensibles.

## Verificación local previa a commit

- `backups/RESTORE_GUIDE.md`: conservado sin sobrescritura.
- `backups/restore.sh`: conservado sin sobrescritura.
- `backups/BACKUP.md`: regenerado con configuración no sensible y estado operativo actual.
- Política de identidad: documento emitido por Demeter; menciones a Hermes limitadas a runtime/software base, CLI, rutas técnicas o nombres técnicos de skills.
