# Backup operativo no sensible — DataSeed / Demeter

- Generado: 2026-06-03 05:03:32 -04 -0400
- Referencia UTC: 2026-06-03 09:03:32 UTC
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

- Modelo principal observado en sesión cron: provider `openai-codex`, model `gpt-5.5`.
- Runtime home: `/opt/data`.
- Workdir de ejecución: `/opt/hermes`.
- Redacción de secretos: habilitada por política operativa y exclusión explícita de archivos sensibles.
- Aprobaciones de comandos: modo operativo con salvaguardas de ejecución.
- Configuración detallada sensible no se exporta; solo se registran indicadores operativos.

## Estado STT/TTS y voz

- STT: no se detectó proceso dedicado activo; capacidad dependiente de configuración runtime.
- TTS: no se detectó proceso dedicado activo; capacidad dependiente de configuración runtime.
- Voz: sin grabación activa observada durante el backup.

## Memoria y contexto

- Base de estado runtime: `state.db` presente=`True`.
- Sesiones locales registradas: 209 archivos JSON en carpeta de sesiones; nombres excluidos.
- Memoria/conversación: persistencia local activa por base de estado; contenidos no exportados.
- Cachés y reportes privados: conteos solamente; contenidos excluidos.

## Gateway, plataformas y toolsets habilitados

- Gateway state file presente=`True`.
- Gateway técnico: proceso `hermes gateway run` observado si figura en procesos relevantes.
- Bridge WhatsApp: proceso operativo observado si figura en procesos relevantes; sesión y credenciales excluidas.
- Toolsets detectados en cron jobs:
  - cronjob, file, terminal, web
- Toolsets base disponibles en runtime técnico: terminal, file, cronjob, web, skills, memory, messaging, vision, browser, tts, image_gen, delegation, todo, session_search, code_execution, computer_use, clarify.

## Cron jobs configurados y estado

- Registro cron actualizado UTC: `2026-06-03T09:00:43.964280+00:00`.

```text
  8b29cf53ca6c [active]
    Nombre: Demeter Daily Backup
    Schedule: 0 9 * * *
    Next run UTC: 2026-06-04T09:00:00+00:00
    Last run UTC: 2026-06-02T09:04:19.011982+00:00 / ok
    Script: no
    Skills: ninguno
    Toolsets: terminal, file, cronjob
    Workdir: no declarado
  f6254c8c4821 [active]
    Nombre: Growth Engine — Reporte Matutino 7:30 AM
    Schedule: 30 11 * * *
    Next run UTC: 2026-06-03T11:30:00+00:00
    Last run UTC: 2026-06-02T11:31:14.454890+00:00 / ok
    Script: no
    Skills: ninguno
    Toolsets: terminal, file, cronjob
    Workdir: no declarado
  4ab827188183 [active]
    Nombre: Growth Engine — Reporte Vespertino 7:30 PM
    Schedule: 30 23 * * *
    Next run UTC: 2026-06-03T23:30:00+00:00
    Last run UTC: 2026-06-02T23:32:02.989037+00:00 / ok
    Script: no
    Skills: ninguno
    Toolsets: terminal, file, cronjob
    Workdir: no declarado
  d1a0c5131f4b [active]
    Nombre: Growth Engine — Auto Backlog Updater
    Schedule: 0 */4 * * *
    Next run UTC: 2026-06-03T12:00:00+00:00
    Last run UTC: 2026-06-03T08:00:26.657962+00:00 / ok
    Script: no
    Skills: ninguno
    Toolsets: terminal, file
    Workdir: no declarado
  83438a129f08 [active]
    Nombre: Demeter Watchdog Silencioso 24/7
    Schedule: every 5m
    Next run UTC: 2026-06-03T09:01:43.949907+00:00
    Last run UTC: 2026-06-03T08:56:43.949907+00:00 / ok
    Script: demeter_watchdog.py
    Skills: ninguno
    Toolsets: terminal
    Workdir: no declarado
  564c07cb2978 [active]
    Nombre: Demeter Operadora 24/7 — Ciclo cada 30 min
    Schedule: every 120m
    Next run UTC: 2026-06-03T09:45:00.898312+00:00
    Last run UTC: 2026-06-03T07:45:00.898312+00:00 / ok
    Script: no
    Skills: markdown-backlog-maintenance
    Toolsets: terminal, file, web
    Workdir: /opt/data
  d5d651ec2a4d [active]
    Nombre: DataSeed Portal — Sincronizar reporte seguro Demeter
    Schedule: 45 23 * * *
    Next run UTC: 2026-06-03T23:45:00+00:00
    Last run UTC: 2026-06-02T23:45:16.311748+00:00 / error
    Script: dataseed_daily_report_secure_sync.sh
    Skills: ninguno
    Toolsets: terminal
    Workdir: no declarado
    Último error: Script exited with code 2
  e7d1c6af71a4 [active]
    Nombre: Rotate Demeter API Key Daily
    Schedule: 18 18 * * *
    Next run UTC: 2026-06-03T18:18:00+00:00
    Last run UTC: sin ejecución / sin estado
    Script: rotate_demeter_key.py
    Skills: ninguno
    Toolsets: por defecto/no declarado
    Workdir: /opt/data
```

## Skills instalados

Total detectado: 105

- `.archive/business-growth-strategy`
- `.archive/static-site-lead-capture`
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

## Estado operativo relevante

- Backups: repositorio `ZeroSentinels/data_seed`, carpeta `/backups/`, archivo principal `backups/BACKUP.md`.
- Guía de restauración: `backups/RESTORE_GUIDE.md`.
- Script de restauración: `backups/restore.sh`.
- Cron output histórico: 503 archivos de salida; contenidos excluidos.
- Reportes privados locales: 1 archivos; contenidos excluidos.
- Procesos relevantes detectados:
  - ttyd console presente (argumentos sensibles redactados)
  - Procesos runtime defunct observados (requiere seguimiento operativo si crecen)
  - Servicio API Demeter: proceso Python activo
  - Hermes runtime: gateway activo
  - Gateway WhatsApp: bridge activo con sesión local excluida del backup

## Repositorios observados

- `/opt/data/data_seed`: branch `feat/publica-platform`, HEAD `4820c25`, cambios locales no versionados=`sí`.
- `/tmp/data_seed_backup`: branch `main`, HEAD `86683b6`, cambios locales no versionados=`sí`.
- Remoto objetivo: `ZeroSentinels/data_seed`.

## Exclusiones de seguridad aplicadas

- No se copiaron ni listaron contenidos de tokens, API keys, contraseñas, OAuth secrets, archivos `.env`, `google_token.json`, `google_client_secret.json`, `auth.json` ni documentos equivalentes.
- No se listaron nombres de archivos de sesiones, credenciales, cachés o identificadores de mensajería.
- No se exportaron prompts completos de cron jobs ni destinos de entrega para evitar datos personales o sensibles.
- Las líneas de procesos fueron agregadas por clase operativa y no por argumentos completos.
