# Demeter - Backup de Configuración

**Generado:** 2026-05-28 09:00 UTC / 2026-05-28 05:00 AM Chile (UTC-4)
**Host:** cb522682de09
**Sistema:** Linux 6.8.0-111-generic x86_64
**Uptime:** 4 días, 2:03
**Modelo actual:** proveedor OpenRouter (ID exacto omitido para evitar confusión con identidad del agente)
**Config version:** 23

---

## 1. Skills Instalados (28 directorios en /opt/data/skills/)

### apple
- apple-notes, apple-reminders, findmy, imessage, macos-computer-use

### autonomous-ai-agents
- claude-code, codex, hermes-agent, opencode

### business-strategy-delivery
- Skill personalizado para estrategia de negocio y delivery

### creative
- architecture-diagram, ascii-art, ascii-video, baoyu-comic, baoyu-infographic, claude-design, comfyui, creative-ideation, design-md, excalidraw, humanizer, manim-video, p5js, pixel-art, popular-web-designs, pretext, sketch, songwriting-and-ai-music, touchdesigner-mcp

### data-science
- jupyter-live-kernel

### devops
- kanban-orchestrator, kanban-worker, webhook-subscriptions

### diagramming
- (skill de diagramación)

### dogfood
- (skill de testing interno)

### domain
- (skill de dominios)

### email
- himalaya

### gaming
- minecraft-modpack-server, pokemon-player

### gifs
- gif-search

### github
- codebase-inspection, github-auth, github-code-review, github-issues, github-pr-workflow, github-repo-management

### inference-sh
- (skill de inferencia shell)

### mcp
- native-mcp

### media
- gif-search, heartmula, songsee, spotify, youtube-content

### mlops
- evaluation, huggingface-hub, inference, models, research, training, vector-databases

### note-taking
- obsidian

### productivity
- airtable, google-workspace, linear, maps, nano-pdf, notion, ocr-and-documents, powerpoint, teams-meeting-pipeline

### red-teaming
- (skill de seguridad/red team)

### research
- arxiv, blogwatcher, llm-wiki, polymarket, research-paper-writing

### smart-home
- openhue, homeassistant

### social-media
- xurl

### software-development
- agent-landing-manager, debugging-hermes-tui-commands, hermes-agent-skill-authoring, node-inspect-debugger, plan, python-debugpy, requesting-code-review, spike, subagent-driven-development, systematic-debugging, test-driven-development, writing-plans

### whatsapp-group-etiquette
- Skill personalizado para manejo de grupos de WhatsApp

### yuanbao
- Skill para Yuanbao

---

## 2. Cron Jobs Configurados (4 jobs activos)

| ID | Nombre | Schedule (UTC) | Schedule (Chile UTC-4) | Estado | Última ejecución | Detalles |
|----|--------|---------------|----------------------|--------|-----------------|----------|
| 8b29cf53ca6c | Demeter Daily Backup | 0 9 * * * | 05:00 AM | ✅ scheduled | N/A | Backup de configuración a repo. Próximo: 2026-05-29 09:00 UTC. Toolsets: terminal, file, cronjob |
| f6254c8c4821 | Growth Engine — Reporte Matutino | 30 11 * * * | 07:30 AM | ✅ scheduled | N/A | Reporte matutino con funnel, métricas, backlog. Próximo: 2026-05-28 11:30 UTC |
| 4ab827188183 | Growth Engine — Reporte Vespertino | 30 23 * * * | 19:30 PM | ✅ scheduled | N/A | Reporte vespertino con productividad del día y plan siguiente. Próximo: 2026-05-28 23:30 UTC |
| d1a0c5131f4b | Growth Engine — Auto Backlog Updater | 0 */4 * * * | Cada 4 horas | ✅ scheduled — último OK | 2026-05-28 08:08 UTC | Actualiza TASK_BACKLOG.md marcando tareas completadas. 2 ejecuciones previas. Próximo: 2026-05-28 12:00 UTC |

**Jobs deshabilitados:** Ninguno. Todos los 4 jobs están activos.

### Toolsets por job:
- **Backup (8b29cf53ca6c):** terminal, file, cronjob
- **Reportes Growth (f6254c8c4821, 4ab827188183):** heredados del agente (completos)
- **Backlog Updater (d1a0c5131f4b):** heredados del agente (completos)

---

## 3. Toolsets Habilitados (config.yaml)

### Toolset principal activo:
- `hermes-cli` (toolset por defecto del agente)

### Platform toolsets (CLI):
browser, clarify, code_execution, computer_use, cronjob, delegation, file, image_gen, memory, messaging, session_search, skills, terminal, todo, tts, vision, web

### Platform toolsets (WhatsApp):
browser, clarify, code_execution, computer_use, cronjob, delegation, file, image_gen, memory, messaging, session_search, skills, terminal, todo, tts, vision, web

### Known plugin toolsets:
- cli: spotify
- whatsapp: spotify

### Features activos:
- **Memory:** habilitado (memory_enabled: true, user_profile_enabled: true)
- **STT (Speech-to-Text):** habilitado, provider: local, model: base
- **TTS:** provider: gemini
- **LSP:** habilitado (wait_mode: document, install_strategy: auto)
- **Curator:** habilitado (interval: 168h, stale_after: 30 días, archive_after: 90 días, backup: true, keep: 5)
- **Compression:** habilitado (threshold: 0.6, target_ratio: 0.2)
- **Security:** redact_secrets: true, tirith_enabled: true
- **Checkpoints:** deshabilitado
- **Kanban:** dispatch_in_gateway: true, dispatch_interval: 60s

---

## 4. Sistema de Archivos

### Directorios clave:
| Ruta | Uso |
|------|-----|
| /opt/hermes/ | Código fuente del agente Hermes |
| /opt/data/ | Home del usuario, config, skills, datos |
| /opt/data/skills/ | Skills instalados (28 carpetas) |
| /opt/hermes/skills/ | Skills base del sistema (26 carpetas) |
| /opt/data/cron/ | Configuración de cron jobs (jobs.json) |
| /opt/data/cron/output/ | Output de ejecuciones cron |
| /opt/data/.hermes/ | Cache interno del agente |
| /opt/data/.skills_prompt_snapshot.json | Snapshot del manifest de skills |
| /opt/data/config.yaml | Configuración principal del agente |
| /opt/data/TASK_BACKLOG.md | Backlog de tareas DataSeed.cl |
| /opt/data/SOUL.md | Instrucciones/identidad del agente |

### Recursos del sistema:
- **Disco:** 96G total, 14G usado (14%), 83G disponible
- **RAM:** 7.8G total, 1.0G usado, 6.7G disponible
- **Load:** 0.00 (idle)

---

## 5. Backups Anteriores

Este es el **backup #2** para la carpeta `/backups/` en el repositorio.

| Backup | Fecha (UTC) | Archivo |
|--------|-------------|---------|
| #1 | 2026-05-27 21:57 | BACKUP.md (anterior, sobreescrito) + RESTORE_GUIDE.md + restore.sh |

Los backups anteriores no se eliminan — `RESTORE_GUIDE.md` y `restore.sh` del backup #1 siguen intactos.

---

## 6. Repositorios Configurados

| Repo | Uso | Rama local |
|------|-----|------------|
| ZeroSentinels/data_seed | Landing page + backups | clonado en /tmp/data_seed_backup |
| ZeroSentinels/data_seed | (copia local de trabajo) | /opt/data/ZeroSentinels/data_seed/ |

---

## 7. Instrucciones de Restauración

Para una reconstrucción completa paso a paso, ver el archivo compañero:

**→ `RESTORE_GUIDE.md`** — Guía detallada de reconstrucción con instrucciones para "yo con amnesia", incluyendo los pasos donde el usuario debe intervenir. No contiene información sensible.

---

## 8. Notas de Seguridad

- **NUNCA** incluir tokens, API keys, client secrets o contraseñas en los backups
- El token de Google (`google_token.json`) contiene credenciales OAuth — no respaldar
- El `client_secret.json` de Google es sensible — no respaldar
- `HERMES_TOKEN` es sensible — no respaldar
- `.env` en `/opt/data/.env` contiene secrets — no respaldar
- `auth.json` contiene tokens de autenticación — no respaldar
- Este archivo solo contiene metadata y estructura, no credenciales

---

## 9. Cambios desde Backup #1 (2026-05-27)

### Nuevos cron jobs:
- **Growth Engine — Reporte Matutino 7:30 AM** (`f6254c8c4821`, schedule: `30 11 * * *` UTC) — Nuevo
- **Growth Engine — Reporte Vespertino 7:30 PM** (`4ab827188183`, schedule: `30 23 * * *` UTC) — Nuevo
- **Growth Engine — Auto Backlog Updater** (`d1a0c13f4b`, schedule: `0 */4 * * *` UTC) — Nueva

### Skills nuevos:
- `business-strategy-delivery` — Instalado después del backup #1
- `whatsapp-group-etiquette` — Presente en backup #1 (mencionado)

### Cambios en config:
- Personalidad: `kawaii` (display.personality)
- STT habilitado (stt.enabled: true)
- LSP habilitado (lsp.enabled: true)

### Cambios en jobs existentes:
- **Demeter Daily Backup (8b29cf53ca6c):** Schedule cambiado de `0 5 * * *` a `0 9 * * *` (de 5AM UTC a 9AM UTC = 5AM Chile)

### Tarea completada:
- C-001: Framework Growth Marketing & ventas v1 — Completado 2026-05-28

---

*Backup automático generado por Demeter - Diario a las 09:00 UTC (05:00 AM Chile, UTC-4)*
*Backup #2 — 2026-05-28*
