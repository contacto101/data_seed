# Hermes Agent - Backup de Configuración

**Generado:** 2026-05-27 21:57:46 UTC
**Host:** cb522682de09
**Sistema:** Linux 6.8.0-111-generic x86_64

---

## 1. Skills Instalados

### autonomous-ai-agents
- claude-code, codex, hermes-agent, opencode

### creative
- architecture-diagram, ascii-art, ascii-video, baoyu-comic, baoyu-infographic, claude-design, comfyui, creative-ideation, design-md, excalidraw, humanizer, manim-video, p5js, pixel-art, popular-web-designs, pretext, sketch, songwriting-and-ai-music, touchdesigner-mcp

### data-science
- jupyter-live-kernel

### devops
- kanban-orchestrator, kanban-worker, webhook-subscriptions

### email
- himalaya

### gaming
- minecraft-modpack-server, pokemon-player

### github
- codebase-inspection, github-auth, github-code-review, github-issues, github-pr-workflow, github-repo-management

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

### research
- arxiv, blogwatcher, llm-wiki, polymarket, research-paper-writing

### smart-home
- openhue

### social-media
- xurl

### software-development
- agent-landing-manager, debugging-hermes-tui-commands, hermes-agent-skill-authoring, node-inspect-debugger, plan, python-debugpy, requesting-code-review, spike, subagent-driven-development, systematic-debugging, test-driven-development, writing-plans

### whatsapp-group-etiquette
- Skill personalizado para manejo de grupos de WhatsApp

### yuanbao
- Skill para Yuanbao

---

## 2. Cron Jobs Activos

| ID | Nombre | Schedule | Next Run |
|----|--------|----------|----------|
| 8b29cf53ca6c | Hermes Daily Backup | 0 5 * * * (diario 5AM UTC) | 2026-05-28 05:00 UTC |

---

## 3. Configuración de Google Workspace

- **Skill:** google-workspace (productivity/google-workspace)
- **Token:** `/opt/data/google_token.json` (auto-refresh)
- **Client Secret:** `/opt/data/google_client_secret.json`
- **APIs habilitadas:** Gmail, Calendar, Drive, Sheets, Docs, Contacts
- **Correo configurado:** demeter@dataseed.cl
- **Estado:** AUTHENTICATED ✅

---

## 4. Repositorios Configurados

| Repo | Uso |
|------|-----|
| ZeroSentinels/data_seed | Landing page + backups |

---

## 5. Variables de Entorno Relevantes

- `HERMES_TOKEN` — Token de GitHub (operaciones git, API, PRs)
- `GOOGLE_OAUTH_CLIENT_SECRET_PATH` — Ruta al client_secret.json de Google

---

## 6. Instrucciones de Restauración

Para una reconstrucción completa paso a paso, ver el archivo compañero:

**→ `RESTORE_GUIDE.md`** — Guía detallada de reconstrucción con instrucciones para "yo con amnesia", incluyendo los pasos donde el usuario debe intervenir. No contiene información sensible.

### Resumen rápido:

---

## 7. Notas de Seguridad

- **NUNCA** incluir tokens, API keys, client secrets o contraseñas en los backups
- El token de Google (`google_token.json`) contiene credenciales OAuth — no respaldar
- El `client_secret.json` de Google es sensible — no respaldar
- `HERMES_TOKEN` es sensible — no respaldar
- Este archivo solo contiene metadata y estructura, no credenciales

---

*Backup automático generado por Hermes Agent - Diario a las 5:00 AM UTC*
