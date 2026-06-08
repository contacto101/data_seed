# Backup operativo no sensible — DataSeed / Demeter

- Generado: 2026-06-08 05:02:54 -04
- Referencia UTC: 2026-06-08 09:02:54 UTC
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
- Repositorio de backup clonado para esta ejecución: `/tmp/data_seed_backup`.

## Estado operativo relevante

- Disco `/opt/data`: 96G total, 19G usado, 78G disponible (20% uso).
- Memoria: 7.8Gi total, 6.7Gi disponible.
- Gateway técnico: activo (PID 11, ejecución manual, no como servicio de sistema).
- STT: no se detectó proceso dedicado activo; capacidad dependiente de configuración runtime.
- TTS: no se detectó proceso dedicado activo; capacidad dependiente de configuración runtime.
- Memoria runtime: `/opt/data/state.db` presente (206.8 MB); contenidos no exportados.
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

Total: 8 jobs, todos activos. Última verificación: 2026-06-08 09:02 UTC.

```text
8b29cf53ca6c [active]
  Nombre: Demeter Daily Backup
  Schedule: 0 9 * * *
  Next run UTC: 2026-06-09T09:00:00+00:00
  Last run UTC: 2026-06-07T09:03:53.810411+00:00 / ok
  Mode: agent

f6254c8c4821 [active]
  Nombre: Growth Engine — Reporte Matutino 7:30 AM
  Schedule: 30 11 * * *
  Next run UTC: 2026-06-08T11:30:00+00:00
  Last run UTC: 2026-06-07T11:31:21.254535+00:00 / ok
  Mode: agent

4ab827188183 [active]
  Nombre: Growth Engine — Reporte Vespertino 7:30 PM
  Schedule: 30 23 * * *
  Next run UTC: 2026-06-08T23:30:00+00:00
  Last run UTC: 2026-06-07T23:31:47.546831+00:00 / ok
  Mode: agent

d1a0c5131f4b [active]
  Nombre: Growth Engine — Auto Backlog Updater
  Schedule: 0 */4 * * *
  Next run UTC: 2026-06-08T12:00:00+00:00
  Last run UTC: 2026-06-08T08:01:53.376875+00:00 / ok
  Mode: agent

83438a129f08 [active]
  Nombre: Demeter Watchdog Silencioso 24/7
  Schedule: every 5m
  Next run UTC: 2026-06-08T09:02:24.520615+00:00
  Last run UTC: 2026-06-08T08:57:24.520615+00:00 / ok
  Script: demeter_watchdog.py
  Mode: no-agent

564c07cb2978 [active]
  Nombre: Demeter Operadora 24/7 — Reporte cada 2 horas
  Schedule: every 120m
  Next run UTC: 2026-06-08T10:51:21.370370+00:00
  Last run UTC: 2026-06-08T08:51:21.370370+00:00 / ok
  Skills: markdown-backlog-maintenance
  Workdir: /opt/data
  Mode: agent

d5d651ec2a4d [active]
  Nombre: DataSeed Portal — Sincronizar reporte seguro Demeter
  Schedule: 45 23 * * *
  Next run UTC: 2026-06-08T23:45:00+00:00
  Last run UTC: 2026-06-07T23:45:53.630132+00:00 / ok
  Script: dataseed_daily_report_secure_sync.sh
  Mode: no-agent
  Workdir: /opt/data/data_seed

e7d1c6af71a4 [active]
  Nombre: Rotate Demeter API Key Daily
  Schedule: 18 18 * * *
  Next run UTC: 2026-06-08T18:18:00+00:00
  Last run UTC: 2026-06-07T18:18:42.219536+00:00 / ok
  Script: rotate_demeter_key.py
  Mode: no-agent
  Workdir: /opt/data
```

## Skills instalados

Total detectado: 67 skills habilitados (0 hub-installed, 45 builtin, 22 local).

### Skills locales (22)

- `agent-cost-optimization` (devops)
- `agent-landing-manager` (software-development)
- `apple-ecosystem-automation` (productivity)
- `ascii-media-generation` (creative)
- `autonomous-ai-worker-config` (autonomous-ai-agents)
- `baoyu-visual-storytelling` (creative)
- `business-strategy-delivery`
- `creative-visual-artifacts` (creative)
- `critical-context-checkpoint` (software-development)
- `current-procedure-research` (research)
- `dataseed-agent-factory-operations` (devops)
- `dataseed-google-meet-scheduler` (messaging)
- `dataseed-hubspot-control-plan` (productivity)
- `dataseed-ops`
- `github-operations` (github)
- `google-cloud-firebase-ops` (devops)
- `markdown-backlog-maintenance` (productivity)
- `music-and-audio-production` (media)
- `secret-safe-final-check` (software-development)
- `whatsapp-group-etiquette`
- `workspace-productivity-tools` (productivity)

### Skills builtin (45)

- `comfyui` (creative)
- `dogfood`
- `godmode` (red-teaming)
- `hermes-agent` (autonomous-ai-agents)
- `humanizer` (creative)
- `ideation` (creative)
- `kanban-orchestrator` (devops)
- `kanban-worker` (devops)
- `manim-video` (creative)
- `touchdesigner-mcp` (creative)
- `jupyter-live-kernel` (data-science)
- `webhook-subscriptions` (devops)
- `himalaya` (email)
- `minecraft-modpack-server` (gaming)
- `pokemon-player` (gaming)
- `native-mcp` (mcp)
- `gif-search` (media)
- `spotify` (media)
- `youtube-content` (media)
- `dspy` (mlops)
- `evaluating-llms-harness` (mlops)
- `huggingface-hub` (mlops)
- `llama-cpp` (mlops)
- `obliteratus` (mlops)
- `segment-anything-model` (mlops)
- `serving-llms-vllm` (mlops)
- `weights-and-biases` (mlops)
- `google-workspace` (productivity)
- `arxiv` (research)
- `blogwatcher` (research)
- `llm-wiki` (research)
- `polymarket` (research)
- `research-paper-writing` (research)
- `openhue` (smart-home)
- `xurl` (social-media)
- `node-inspect-debugger` (software-development)
- `plan` (software-development)
- `python-debugpy` (software-development)
- `requesting-code-review` (software-development)
- `spike` (software-development)
- `subagent-driven-development` (software-development)
- `systematic-debugging` (software-development)
- `test-driven-development` (software-development)
- `writing-plans` (software-development)
- `yuanbao`

## Repositorios y backups

- `/opt/data/data_seed` -> `https://github.com/ZeroSentinels/data_seed.git`
- `/tmp/data_seed_backup` -> clon temporal usado para esta ejecución de backup.
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
