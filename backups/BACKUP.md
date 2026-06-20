# Backup operativo no sensible — DataSeed / Demeter

- Generado UTC: 2026-06-20 09:00:41 UTC
- Generado America/Santiago: 2026-06-20 05:00:41 -04
- Alcance: estado operativo no sensible para recuperación crítica.
- Política: no se respaldan credenciales, tokens, secretos OAuth, contraseñas, sesiones de mensajería, bases de datos runtime, logs completos, caches ni adjuntos. Scripts/documentos adicionales requieren aprobación explícita; ante duda se omiten.
- Rama objetivo: `main` en `https://github.com/contacto101/data_seed.git`.

Los datos respaldados son semillas operativas: identidad, configuración resumida, cron jobs sanitizados, skills instalados, scripts seguros de restauración y ciclos grandes completados.

## Seguimiento de tareas y alcance del backup

- El `task-log.md` es volátil: se actualiza durante el día y se limpia a las 05:00 AM America/Santiago.
- El `daily-summary.md` conserva el resumen diario y debe consultarse para tareas diarias, pendientes y bloqueos.
- El backup diario de las 05:00 AM NO copia `task-log.md` ni `daily-summary.md`; solo deja esta referencia para consultarlos en el repo de tracking.
- Este backup sí copia `backups/COMPLETED_CYCLES.md`, que contiene únicamente ciclos grandes completados.
- Repo/branch de tracking: `/opt/data/data_seed_tasklog_worktree` / `feat/task-tracking-system`.
- Daily summary: `daily-summary.md` (27.4 KB, sha256 3e50a9ea37283b0d).
- Task log actual: `task-log.md` (213.0 B, sha256 1512ddaa0df19af1).
- Ciclos grandes completados fuente: `backups/COMPLETED_CYCLES.md` (594.0 B, sha256 6fd18874fbd0ad90).

Regla operativa: el log diario registra detalles; el resumen diario consolida tareas y pendientes; el backup de las 05:00 AM solo guarda ciclos grandes completados y una referencia hacia el resumen diario.

## Identidad operativa

- Agente operativo: Demeter.
- Proyecto: DataSeed.
- Runtime técnico: Hermes Agent.
- Perfil activo esperado: `default`.
- Directorio persistente esperado: `/opt/data`.

## Estado técnico

- Host: `Linux-6.8.0-124-generic-x86_64-with-glibc2.41`
- Python: `3.13.5`
- Hermes home: `/opt/data`
- Backup repo dir: `/opt/data/data_seed_daily_backup`
- Backup branch: `main`
- Hermes binary: `/opt/hermes/.venv/bin/hermes`
- Disk snapshot:
  `Filesystem      Size  Used Avail Use% Mounted on`
  `/dev/sda1        96G   12G   85G  13% /opt/data`

## Configuración Hermes sanitizada

- Config path: `/opt/data/config.yaml` (16.3 KB, sha256 f9c71fda9b2ce203)
- Model provider: `openai-codex`
- Model default: `gpt-5.5`
- Agent max_turns: `60`
- Agent reasoning_effort: `xhigh`
- Display personality: `concise`
- Display show_reasoning: `false`
- Terminal backend: `local`
- Terminal cwd: `.`
- Top-level toolsets: `hermes-cli`

## Cron jobs configurados y estado

Total jobs: 1. Sensitive fields excluded: prompt, deliver, delivery targets.

- `ea05ea193912` [active]
  - Nombre: Demeter Daily Operations (5:00 AM Chile)
  - Schedule: 0 9 * * *
  - Next run UTC: 2026-06-21T09:00:00+00:00
  - Last run UTC/status: 2026-06-19T09:00:40.776873+00:00 / ok
  - Mode: no-agent
  - Script: daily-operations-wrapper.sh

## Skills instalados

- `ai-coding-agent-orchestration` (autonomous-ai-agents/ai-coding-agent-orchestration) — Use when delegating software work to external AI coding CLIs such as Claude Code, Codex, or OpenCode, including one-shot, background, interactive, PR review, and parallel worktree workflows.
- `hermes-agent` (autonomous-ai-agents/hermes-agent) — Configure, extend, or contribute to Hermes Agent.
- `architecture-diagram` (creative/architecture-diagram) — Dark-themed SVG architecture/cloud/infra diagrams as HTML.
- `ascii-video` (creative/ascii-video) — ASCII video: convert video/audio to colored ASCII MP4/GIF.
- `baoyu-infographic` (creative/baoyu-infographic) — Infographics: 21 layouts x 21 styles (信息图, 可视化).
- `comfyui` (creative/comfyui) — Generate images, video, and audio with ComfyUI — install, launch, manage nodes/models, run workflows with parameter injection. Uses the official comfy-cli for lifecycle and direct REST/WebSocket API for execution.
- `design-md` (creative/design-md) — Author/validate/export Google
- `excalidraw` (creative/excalidraw) — Hand-drawn Excalidraw JSON diagrams (arch, flow, seq).
- `humanizer` (creative/humanizer) — Humanize text: strip AI-isms and add real voice.
- `impeccable` (creative/impeccable) — Safe Hermes adaptation of Impeccable: use with ui-ux-pro-max for production-grade frontend/UI design, critique, audit, polish, layout, typography, motion, accessibility, responsive behavior, UX copy, design systems, and anti-AI-slop review. Excludes upstream live-browser scripts, hooks, and auto-install commands that were blocked by Hermes security scan.
- `lightweight-creative-prototyping` (creative/lightweight-creative-prototyping) — Use when producing quick creative artifacts without a full specialized pipeline: throwaway HTML mockups, Claude-designed pages, and terminal ASCII art.
- `manim-video` (creative/manim-video) — Manim CE animations: 3Blue1Brown math/algo videos.
- `p5js` (creative/p5js) — p5.js sketches: gen art, shaders, interactive, 3D.
- `popular-web-designs` (creative/popular-web-designs) — 54 real design systems (Stripe, Linear, Vercel) as HTML/CSS.
- `pretext` (creative/pretext) — Use when building creative browser demos with @chenglou/pretext — DOM-free text layout for ASCII art, typographic flow around obstacles, text-as-geometry games, kinetic typography, and text-powered generative art. Produces single-file HTML demos by default.
- `touchdesigner-mcp` (creative/touchdesigner-mcp) — Control a running TouchDesigner instance via twozero MCP — create operators, set parameters, wire connections, execute Python, build real-time visuals. 36 native tools.
- `jupyter-live-kernel` (data-science/jupyter-live-kernel) — Iterative Python via live Jupyter kernel (hamelnb).
- `kanban-agent-workflows` (devops/kanban-agent-workflows) — Use when orchestrating Kanban-style multi-agent work: board setup, task decomposition, worker prompts, status transitions, and recovery.
- `operational-recovery-backups` (devops/operational-recovery-backups) — Build and maintain safe operational recovery backups for Hermes/DataSeed: cron job reconstruction, non-secret GitHub snapshots, rollback docs, script inclusion policies, graphify knowledge graph backup, and unified cleanup-then-backup daily operations.
- `whatsapp-gateway-config` (devops/whatsapp-gateway-config) — WhatsApp gateway configuration for Hermes Agent — require_mention, dm_policy, group_policy, allow_from, mention_patterns, group_sessions_per_user, and all platform-specific settings.
- `dogfood` (dogfood) — Exploratory QA of web apps: find bugs, evidence, reports.
- `himalaya` (email/himalaya) — Himalaya CLI: IMAP/SMTP email from terminal.
- `codebase-inspection` (github/codebase-inspection) — Inspect codebases w/ pygount: LOC, languages, ratios.
- `github-auth` (github/github-auth) — GitHub auth setup: HTTPS tokens, SSH keys, gh CLI login.
- `github-code-review` (github/github-code-review) — Review PRs: diffs, inline comments via gh or REST.
- `github-issues` (github/github-issues) — Create, triage, label, assign GitHub issues via gh or REST.
- `github-pr-workflow` (github/github-pr-workflow) — GitHub PR lifecycle: branch, commit, open, CI, merge.
- `github-repo-management` (github/github-repo-management) — Clone/create/fork repos; manage remotes, releases.
- `audio-music-media-workflows` (media/audio-music-media-workflows) — Use when creating, transforming, searching, or analyzing lightweight audio/music/media assets: songwriting prompts, local song generation, audio feature visualization, and GIF retrieval.
- `youtube-content` (media/youtube-content) — YouTube transcripts to summaries, threads, blogs.
- `evaluating-llms-harness` (mlops/evaluation/lm-evaluation-harness) — lm-eval-harness: benchmark LLMs (MMLU, GSM8K, etc.).
- `weights-and-biases` (mlops/evaluation/weights-and-biases) — W&B: log ML experiments, sweeps, model registry, dashboards.
- `huggingface-hub` (mlops/huggingface-hub) — HuggingFace hf CLI: search/download/upload models, datasets.
- `llama-cpp` (mlops/inference/llama-cpp) — llama.cpp local GGUF inference + HF Hub model discovery.
- `obliteratus` (mlops/inference/obliteratus) — OBLITERATUS: abliterate LLM refusals (diff-in-means).
- `serving-llms-vllm` (mlops/inference/vllm) — vLLM: high-throughput LLM serving, OpenAI API, quantization.
- `audiocraft-audio-generation` (mlops/models/audiocraft) — AudioCraft: MusicGen text-to-music, AudioGen text-to-sound.
- `segment-anything-model` (mlops/models/segment-anything) — SAM: zero-shot image segmentation via points, boxes, masks.
- `obsidian` (note-taking/obsidian) — Read, search, create, and edit notes in the Obsidian vault.
- `airtable` (productivity/airtable) — Airtable REST API via curl. Records CRUD, filters, upserts.
- `apple-platform-automation` (productivity/apple-platform-automation) — Use when automating Apple/macOS apps and services from Hermes: Notes, Reminders, Messages, Find My, and visual computer-use workflows.
- `google-workspace` (productivity/google-workspace) — Gmail, Calendar, Drive, Docs, Sheets via gws CLI or Python.
- `maps` (productivity/maps) — Geocode, POIs, routes, timezones via OpenStreetMap/OSRM.
- `nano-pdf` (productivity/nano-pdf) — Edit PDF text/typos/titles via nano-pdf CLI (NL prompts).
- `notion` (productivity/notion) — Notion API + ntn CLI: pages, databases, markdown, Workers.
- `ocr-and-documents` (productivity/ocr-and-documents) — Extract text from PDFs/scans (pymupdf, marker-pdf).
- `powerpoint` (productivity/powerpoint) — Create, read, edit .pptx decks, slides, notes, templates.
- `teams-meeting-pipeline` (productivity/teams-meeting-pipeline) — Operate the Teams meeting summary pipeline via Hermes CLI — summarize meetings, inspect pipeline status, replay jobs, manage Microsoft Graph subscriptions.
- `godmode` (red-teaming/godmode) — Jailbreak LLMs: Parseltongue, GODMODE, ULTRAPLINIAN.
- `arxiv` (research/arxiv) — Search arXiv papers by keyword, author, category, or ID.
- `blogwatcher` (research/blogwatcher) — Monitor blogs and RSS/Atom feeds via blogwatcher-cli tool.
- `llm-wiki` (research/llm-wiki) — Karpathy
- `polymarket` (research/polymarket) — Query Polymarket: markets, prices, orderbooks, history.
- `research-paper-writing` (research/research-paper-writing) — Write ML papers for NeurIPS/ICML/ICLR: design→submit.
- `openhue` (smart-home/openhue) — Control Philips Hue lights, scenes, rooms via OpenHue CLI.
- `xurl` (social-media/xurl) — X/Twitter via xurl CLI: post, search, DM, media, v2 API.
- `hermes-agent-skill-authoring` (software-development/hermes-agent-skill-authoring) — Author in-repo SKILL.md: frontmatter, validator, structure.
- `knowledge-graph-codebase-navigation` (software-development/knowledge-graph-codebase-navigation) — Build and use local knowledge graphs for codebase/navigation tasks, especially via Graphify, MCP, and agent skills.
- `plan` (software-development/plan) — Plan mode: write an actionable markdown plan to .hermes/plans/, no execution. Bite-sized tasks, exact paths, complete code.
- `software-debugging-and-quality` (software-development/software-debugging-and-quality) — Use when improving software correctness: root-cause debugging, TDD, debugger attachment, pre-commit review, simplification passes, and throwaway validation spikes.
- `ui-ux-pro-max` (ui-ux-pro-max) — UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient. Integrations: shadcn/ui MCP for component search and examples.
- `yuanbao` (yuanbao) — Yuanbao (元宝) groups: @mention users, query info/members.

## Archivos operativos clave observados

No se copia el contenido de estos archivos; solo tamaño y huella para validación.

- `config.yaml`: 16.3 KB, sha256 f9c71fda9b2ce203
- `memories/MEMORY.md`: 2.1 KB, sha256 6bbd81ed230f9c62
- `memories/USER.md`: 1.3 KB, sha256 fb6d397bf7499bf7
- `channel_directory.json`: 1.0 KB, sha256 9ffc4ff4c747ca6c
- `gateway_state.json`: 544.0 B, sha256 2c656bd03277d9fd
- `cron/jobs.json`: 1.6 KB, sha256 fbeda3bcced5bc52

## Grafo de conocimiento del proyecto (Graphify)

El grafo de Graphify mapea las relaciones entre archivos, funciones y conceptos del proyecto.
Se genera con `scripts/generate-multibranch-graph.py`, que crea un snapshot temporal de todos los branches remotos, deduplica archivos idénticos bajo `_shared/` y copia al repo solo los artefactos livianos versionables.

- Directorio del grafo: `graphify-out/`
- Archivos incluidos en este backup: `GRAPH_REPORT.md`, `manifest.json`, `.graphify_labels.json`
- Archivos grandes NO incluidos (regenerables): `graph.html`, `graph.json`, `cache/`, snapshots multibranch temporales
- Para regenerar: `cd /opt/data/data_seed && python3 scripts/generate-multibranch-graph.py`
- Reporte del grafo: `graphify-out/GRAPH_REPORT.md` (incluido en este backup)

## Archivos actualizados por este backup

- `backups/BACKUP.md`
- `backups/COMPLETED_CYCLES.md`
- `backups/RESTORE_GUIDE.md`
- `backups/restore.sh`
- `scripts/demeter_daily_backup.py`
- `scripts/daily-operations.sh`
- `scripts/daily-operations-wrapper.sh`
- `scripts/ops/demeter_daily_backup.py`
- `scripts/ops/daily-operations.sh`
- `scripts/ops/daily-operations-wrapper.sh`
- `scripts/ops/daily-task-log-cleanup.sh`
- `scripts/generate-multibranch-graph.py`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/manifest.json`
- `graphify-out/.graphify_labels.json`

## Scripts de cron seguros incluidos

- No hay scripts adicionales copiados como copia dura.

## Scripts/documentos pendientes de aprobación humana

- `daily-operations-wrapper.sh`: pendiente; existe pero NO se copia como copia dura sin aprobación explícita en `/opt/data/backup_hardcopy_allowlist.txt`.

## Exclusiones estrictas

No se exportan ni se copian:

- `.env`, `.git-credentials`, `auth.json`, `google_token.json`, `google_client_secret.json`, `creds.json`.
- Sesiones de WhatsApp, Telegram, Discord u otras plataformas.
- `state.db`, bases de datos runtime, WAL/SHM, caches, adjuntos, audios, imágenes o documentos de usuario.
- Prompts completos de cron, destinos de entrega, chat identifiers, nombres de contactos o datos personales.
- Logs completos o dumps de conversaciones.
- `task-log.md` y `daily-summary.md`: no se copian al backup; se consultan en el branch de tracking (`feat/task-tracking-system`).

## Restauración

1. Consultar `backups/RESTORE_GUIDE.md`.
2. Ejecutar `backups/restore.sh` solo para verificación segura; no restaura secretos.
3. Reconfigurar credenciales y OAuth manualmente desde fuentes autorizadas.
4. Reconstituir cron jobs desde esta sección y desde instrucciones humanas autorizadas para prompts/destinos excluidos.
