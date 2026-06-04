# Backup operativo no sensible — DataSeed / Demeter

- Generado: 2026-06-04 05:02:10 -04 -0400
- Referencia UTC: 2026-06-04 09:02:10 UTC
- Alcance: configuración operativa no sensible del perfil activo y estado técnico relevante.
- Política: credenciales, tokens, secretos OAuth, contraseñas, archivos `.env`, `google_token.json`, `google_client_secret.json`, `auth.json` y equivalentes quedan excluidos.
- Restauración: consultar `backups/RESTORE_GUIDE.md` y ejecutar/validar `backups/restore.sh` según el entorno destino.

Los datos respaldados son semillas operativas: al ordenarse técnicamente sostienen análisis, automatización y decisiones útiles.

## Identidad operativa

- Agente operativo: Demeter.
- Runtime/software base: Hermes Agent, usado solo como plataforma CLI, skills y gateway técnico.
- Perfil activo observado: `default`.
- Directorio persistente observado: `/opt/data`.

## Configuración general no sensible

- Runtime técnico: Hermes Agent v0.15.1, proyecto base `/opt/hermes`.
- Modelo principal observado en sesión cron: provider `openai-codex`, model `gpt-5.5`.
- Host observado: Linux 6.8.0-111-generic x86_64 GNU/Linux.
- Python: 3.13.5.
- uv: 0.11.6.
- Workdir de ejecución cron observado: `/opt/data`.
- Runtime home observado por shell: `/opt/data/home`.
- Redacción de secretos: obligatoria; configuración detallada sensible no se exporta.
- Aprobaciones de comandos: modo operativo con salvaguardas de ejecución.

## Estado STT/TTS y voz

- STT: no se detectó proceso dedicado activo; capacidad dependiente de configuración runtime.
- TTS: no se detectó proceso dedicado activo; capacidad dependiente de configuración runtime.
- Voz: sin grabación activa observada durante el backup.

## Memoria y contexto

- Base de estado runtime: `/opt/data/state.db` presente.
- Tablas de estado observadas: sesiones y mensajes persistentes; contenidos no exportados.
- Sesiones locales: existen registros históricos de cron y sesiones; nombres y contenidos excluidos.
- Cachés de audio, imagen y documentos: presentes; contenidos excluidos.
- Reportes privados locales: 1 archivo detectado; contenido excluido.

## Gateway, plataformas y toolsets habilitados

- Gateway técnico: proceso `hermes gateway run` activo.
- Bridge WhatsApp: proceso Node activo con sesión local excluida del backup.
- Consola web runtime: proceso `ttyd` activo; credenciales y argumentos sensibles excluidos.
- Servicio API Demeter: proceso Python activo.
- Proxy/demo DataSeed: proceso Python activo.
- Toolsets detectados por configuración de cron: terminal, file, cronjob, web.
- Toolsets base disponibles por runtime técnico: terminal, file, cronjob, web, skills, memory, messaging, vision, browser, tts, image_gen, delegation, todo, session_search, code_execution, computer_use, clarify.

## Cron jobs configurados y estado

Registro obtenido mediante `hermes cron list` el 2026-06-04 09:02 UTC. Se omiten prompts completos, destinos de entrega y datos de sesión.

```text
8b29cf53ca6c [active]
  Nombre: Demeter Daily Backup
  Schedule: 0 9 * * *
  Next run UTC: 2026-06-05T09:00:00+00:00
  Last run UTC: 2026-06-03T09:04:10.882555+00:00 / ok
  Script: no
  Skills: ninguno
  Toolsets: terminal, file, cronjob
  Workdir: no declarado

f6254c8c4821 [active]
  Nombre: Growth Engine — Reporte Matutino 7:30 AM
  Schedule: 30 11 * * *
  Next run UTC: 2026-06-04T11:30:00+00:00
  Last run UTC: 2026-06-03T11:31:36.417866+00:00 / ok
  Script: no
  Skills: ninguno
  Toolsets: terminal, file, cronjob
  Workdir: no declarado

4ab827188183 [active]
  Nombre: Growth Engine — Reporte Vespertino 7:30 PM
  Schedule: 30 23 * * *
  Next run UTC: 2026-06-04T23:30:00+00:00
  Last run UTC: 2026-06-03T23:32:15.378689+00:00 / ok
  Script: no
  Skills: ninguno
  Toolsets: terminal, file, cronjob
  Workdir: no declarado

d1a0c5131f4b [active]
  Nombre: Growth Engine — Auto Backlog Updater
  Schedule: 0 */4 * * *
  Next run UTC: 2026-06-04T12:00:00+00:00
  Last run UTC: 2026-06-04T08:01:23.779137+00:00 / ok
  Script: no
  Skills: ninguno
  Toolsets: terminal, file
  Workdir: no declarado

83438a129f08 [active]
  Nombre: Demeter Watchdog Silencioso 24/7
  Schedule: every 5m
  Next run UTC: 2026-06-04T09:04:09.999245+00:00
  Last run UTC: 2026-06-04T08:59:09.999245+00:00 / ok
  Script: demeter_watchdog.py
  Mode: no-agent
  Skills: ninguno
  Toolsets: terminal
  Workdir: no declarado

564c07cb2978 [active]
  Nombre: Demeter Operadora 24/7 — Ciclo cada 30 min
  Schedule: every 120m
  Next run UTC: 2026-06-04T10:17:56.188948+00:00
  Last run UTC: 2026-06-04T08:17:56.188948+00:00 / ok
  Script: no
  Skills: markdown-backlog-maintenance
  Toolsets: terminal, file, web
  Workdir: /opt/data

d5d651ec2a4d [active]
  Nombre: DataSeed Portal — Sincronizar reporte seguro Demeter
  Schedule: 45 23 * * *
  Next run UTC: 2026-06-04T23:45:00+00:00
  Last run UTC: 2026-06-03T23:45:19.376507+00:00 / error
  Script: dataseed_daily_report_secure_sync.sh
  Mode: no-agent
  Skills: ninguno
  Toolsets: terminal
  Workdir: /opt/data/data_seed
  Último error sanitizado: script esperado no encontrado en repositorio local operativo.

e7d1c6af71a4 [active]
  Nombre: Rotate Demeter API Key Daily
  Schedule: 18 18 * * *
  Next run UTC: 2026-06-04T18:18:00+00:00
  Last run UTC: 2026-06-03T18:18:14.310789+00:00 / ok
  Script: rotate_demeter_key.py
  Mode: no-agent
  Skills: ninguno
  Toolsets: por defecto/no declarado
  Workdir: /opt/data
```

## Skills instalados

Total detectado por directorio `/opt/data/skills`: 104. Estado CLI: 99 enabled, 0 disabled; diferencia atribuible a resolución interna de aliases/nombres del runtime. Lista por ruta relativa:

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
- `autonomous-ai-agents/subscription-cli-ai-workers`
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
- `dataseed-ops`
- `devops/agent-cost-optimization`
- `devops/dataseed-agent-factory-operations`
- `devops/google-cloud-firebase-ops`
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

Skills locales adicionales observados en `/opt/data/.hermes/skills`: 2 (`demo-objetivo-limitado`, `confidencialidad-productos-agente`). Contenidos no exportados.

## Estado operativo relevante

- Backups: repositorio `ZeroSentinels/data_seed`, carpeta `/backups/`, archivo principal `backups/BACKUP.md`.
- Guía de restauración: `backups/RESTORE_GUIDE.md` conservada; no fue sobrescrita.
- Script de restauración: `backups/restore.sh` conservado; no fue sobrescrito.
- Repositorio operativo local `/opt/data/data_seed`: branch `supabase-auth-staging`, HEAD `7936a82`.
- Repositorio temporal de backup `/tmp/data_seed_backup`: branch `main`, HEAD base `0f081f0` antes de commit diario.
- Gateway runtime: activo.
- Servicio WhatsApp bridge: activo; sesión y credenciales excluidas.
- Servicio API Demeter: activo.
- Servicio DataSeed demo proxy: activo.
- Portal/reporte seguro: cron configurado; último intento falló por archivo de script no encontrado en repositorio operativo local.
- Memoria runtime: persistente mediante `/opt/data/state.db`; contenidos excluidos.

## Repositorios observados

- `/opt/data/data_seed`: branch `supabase-auth-staging`, HEAD `7936a82`.
- `/tmp/data_seed_backup`: branch `main`, HEAD `0f081f0` antes de aplicar este backup.
- Remoto objetivo: `ZeroSentinels/data_seed`.

## Exclusiones de seguridad aplicadas

- No se copiaron ni listaron contenidos de tokens, API keys, contraseñas, OAuth secrets, archivos `.env`, `google_token.json`, `google_client_secret.json`, `auth.json` ni documentos equivalentes.
- No se listaron rutas con nombres de archivos sensibles en cachés ni documentos con credenciales.
- No se exportaron prompts completos de cron jobs ni destinos de entrega para evitar datos personales o sensibles.
- Las líneas de procesos fueron agregadas por clase operativa; credenciales de consola, argumentos de sesión y URLs autenticadas fueron excluidos.
- `RESTORE_GUIDE.md` y `restore.sh` se mantienen como referencias de restauración sin ser reemplazados.
