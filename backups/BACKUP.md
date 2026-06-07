# Backup operativo no sensible — DataSeed / Demeter

- Generado: 2026-06-07 05:03:22 -04
- Referencia UTC: 2026-06-07 09:03:22 UTC
- Alcance: configuración operativa no sensible del perfil activo y estado técnico relevante.
- Política: credenciales, tokens, secretos OAuth, contraseñas, archivos `.env`, `google_token.json`, `google_client_secret.json`, `auth.json`, sesiones de mensajería y equivalentes quedan excluidos.
- Restauración: consultar `backups/RESTORE_GUIDE.md` y ejecutar/validar `backups/restore.sh` según el entorno destino.

Los datos respaldados son semillas operativas: al ordenarse técnicamente sostienen análisis, automatización y decisiones útiles.

## Identidad operativa

- Agente operativo: Demeter.
- Runtime/software base: Hermes Agent, usado solo como plataforma CLI, skills y gateway técnico.
- Perfil activo observado: `default`.
- Directorio persistente observado: `/opt/data`.

## Configuración general no sensible

- Runtime técnico: Hermes Agent sobre `/opt/hermes`.
- Modelo de sesión cron observado: provider `openai-codex`, model `gpt-5.5`.
- Host observado: Linux 6.8.0-111-generic x86_64 GNU/Linux.
- Python observado: 3.13.5.
- Workdir de ejecución cron observado: `/opt/data`.
- Directorio persistente principal: `/opt/data`.
- Redacción de secretos: obligatoria; configuración detallada sensible no se exporta.
- Repositorio de backup clonado para esta ejecución: `/tmp/data_seed_backup` solicitado; clon operativo usado: `/tmp/data_seed_backup_public` por falta de token en entorno.

## Estado operativo relevante

- Disco `/opt/data`: 96G total, 18G usado, 79G disponible.
- Memoria: 7.8Gi total, 5.2Gi disponible.
- Gateway técnico: activo.
- Bridge WhatsApp: activo; sesión local excluida.
- Servicio API Demeter: activo.
- Proxy/demo DataSeed: activo.
- Consola web runtime: activa; credenciales y argumentos sensibles excluidos.
- STT: no se detectó proceso dedicado activo; capacidad dependiente de configuración runtime.
- TTS: no se detectó proceso dedicado activo; capacidad dependiente de configuración runtime.
- Memoria runtime: `/opt/data/state.db` presente; contenidos no exportados.
- Cachés de audio, imagen y documentos: contenidos excluidos.
- Backups técnicos: `backups/BACKUP.md`, `backups/RESTORE_GUIDE.md` y `backups/restore.sh` presentes en repositorio.

## Toolsets habilitados

Detectados por configuración de cron y sesión activa, sin incluir credenciales ni parámetros de entrega:

- `terminal`
- `file`
- `cronjob`
- `web`

Toolsets base conocidos del runtime técnico, sujetos a disponibilidad efectiva por sesión: terminal, file, cronjob, web, skills, memory, messaging, vision, browser, tts, image_gen, delegation, todo, session_search, code_execution, computer_use, clarify.

## Cron jobs configurados y estado

Fuente: `/opt/data/cron/jobs.json`, leído el 2026-06-07 09:03 UTC. Se omiten prompts completos, destinos de entrega, chat identifiers y datos de sesión.

```text
8b29cf53ca6c [scheduled/enabled]
  Nombre: Demeter Daily Backup
  Schedule: 0 9 * * *
  Next run UTC: 2026-06-08T09:00:00+00:00
  Last run UTC: 2026-06-06T09:03:07.184906+00:00 / ok
  Script: no
  Mode: agent
  Skills: ninguno
  Toolsets: por defecto/no declarado
  Workdir: no declarado

f6254c8c4821 [scheduled/enabled]
  Nombre: Growth Engine — Reporte Matutino 7:30 AM
  Schedule: 30 11 * * *
  Next run UTC: 2026-06-07T11:30:00+00:00
  Last run UTC: 2026-06-06T11:31:24.903883+00:00 / ok
  Script: no
  Mode: agent
  Skills: ninguno
  Toolsets: por defecto/no declarado
  Workdir: no declarado

4ab827188183 [scheduled/enabled]
  Nombre: Growth Engine — Reporte Vespertino 7:30 PM
  Schedule: 30 23 * * *
  Next run UTC: 2026-06-07T23:30:00+00:00
  Last run UTC: 2026-06-06T23:31:58.251396+00:00 / ok
  Script: no
  Mode: agent
  Skills: ninguno
  Toolsets: por defecto/no declarado
  Workdir: no declarado

d1a0c5131f4b [scheduled/enabled]
  Nombre: Growth Engine — Auto Backlog Updater
  Schedule: 0 */4 * * *
  Next run UTC: 2026-06-07T12:00:00+00:00
  Last run UTC: 2026-06-07T08:01:17.665342+00:00 / ok
  Script: no
  Mode: agent
  Skills: ninguno
  Toolsets: por defecto/no declarado
  Workdir: no declarado

83438a129f08 [scheduled/enabled]
  Nombre: Demeter Watchdog Silencioso 24/7
  Schedule: every 5m
  Next run UTC: 2026-06-07T09:05:35.800567+00:00
  Last run UTC: 2026-06-07T09:00:35.800567+00:00 / ok
  Script: demeter_watchdog.py
  Mode: no-agent
  Skills: ninguno
  Toolsets: por defecto/no declarado
  Workdir: no declarado

564c07cb2978 [scheduled/enabled]
  Nombre: Demeter Operadora 24/7 — Reporte cada 2 horas
  Schedule: every 120m
  Next run UTC: 2026-06-07T10:28:24.854384+00:00
  Last run UTC: 2026-06-07T08:28:24.854384+00:00 / ok
  Script: no
  Mode: agent
  Skills: markdown-backlog-maintenance
  Toolsets: por defecto/no declarado
  Workdir: /opt/data

d5d651ec2a4d [scheduled/enabled]
  Nombre: DataSeed Portal — Sincronizar reporte seguro Demeter
  Schedule: 45 23 * * *
  Next run UTC: 2026-06-07T23:45:00+00:00
  Last run UTC: 2026-06-06T23:45:02.732329+00:00 / ok
  Script: dataseed_daily_report_secure_sync.sh
  Mode: no-agent
  Skills: ninguno
  Toolsets: por defecto/no declarado
  Workdir: /opt/data/data_seed

e7d1c6af71a4 [scheduled/enabled]
  Nombre: Rotate Demeter API Key Daily
  Schedule: 18 18 * * *
  Next run UTC: 2026-06-07T18:18:00+00:00
  Last run UTC: 2026-06-06T18:18:55.283579+00:00 / ok
  Script: rotate_demeter_key.py
  Mode: no-agent
  Skills: ninguno
  Toolsets: por defecto/no declarado
  Workdir: /opt/data

```

## Skills instalados

Total detectado por directorios con `SKILL.md`: 109.

### `/opt/data/skills` — 107

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
- `software-development/secret-safe-final-check`
- `software-development/spike`
- `software-development/subagent-driven-development`
- `software-development/systematic-debugging`
- `software-development/test-driven-development`
- `software-development/writing-plans`
- `whatsapp-group-etiquette`
- `yuanbao`

### `/opt/data/.hermes/skills` — 2

- `confidencialidad-productos-agente`
- `demo-objetivo-limitado`

## Repositorios y backups

- `/opt/data/data_seed` -> `https://github.com/ZeroSentinels/data_seed.git`
- `/tmp/data_seed_backup` -> clon temporal requerido por el procedimiento; en esta ejecución se usó clon equivalente sin token por ausencia de variable de entorno.
- Archivo actualizado en esta ejecución: `backups/BACKUP.md`.
- Archivos de restauración referenciados, sin sobrescritura en esta ejecución:
  - `backups/RESTORE_GUIDE.md`
  - `backups/restore.sh`

## Exclusiones estrictas

No se exportan ni se copian:

- Tokens, API keys, client secrets, contraseñas, credenciales OAuth o material equivalente.
- `.env`, `google_token.json`, `google_client_secret.json`, `auth.json`, `creds.json`, sesiones de mensajería o caches con contenido de usuario.
- Prompts completos de cron, destinos de entrega, chat identifiers, nombres de contactos o datos personales.
- Logs completos, bases de datos completas, memoria textual completa o documentos adjuntos.

## Restauración

1. Revisar `backups/RESTORE_GUIDE.md`.
2. Ejecutar `backups/restore.sh` solo en entorno controlado.
3. Reinstalar o validar skills por lista anterior, sin importar secretos desde este documento.
4. Reconfigurar cron jobs con prompts y destinos desde fuentes autorizadas internas, no desde este backup.
5. Validar gateway, memoria, toolsets, repositorios y backups antes de habilitar automatizaciones recurrentes.
