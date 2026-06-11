# Backup operativo no sensible — DataSeed / Demeter

- Generado UTC: 2026-06-11 16:14:01 UTC
- Generado America/Santiago: 2026-06-11 12:14:01 -04
- Alcance: estado operativo no sensible para recuperación crítica.
- Política: no se respaldan credenciales, tokens, secretos OAuth, contraseñas, sesiones de mensajería, bases de datos runtime, logs completos, caches ni adjuntos.
- Rama objetivo: `main` en `https://github.com/contacto101/data_seed.git`.

Los datos respaldados son semillas operativas: identidad, configuración resumida, cron jobs sanitizados, skills instalados y scripts seguros de restauración.

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
- Backup repo dir: `/opt/data/data_seed`
- Backup branch: `main`
- Hermes binary: `/opt/hermes/.venv/bin/hermes`
- Disk snapshot:
  `Filesystem      Size  Used Avail Use% Mounted on`
  `/dev/sda1        96G   11G   86G  12% /opt/data`

## Configuración Hermes sanitizada

- Config path: `/opt/data/config.yaml` (14.3 KB, sha256 5bdbae3915003815)
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

No cron jobs file found.

## Skills instalados

- `apple-notes` (apple/apple-notes) — Manage Apple Notes via memo CLI: create, search, edit.
- `apple-reminders` (apple/apple-reminders) — Apple Reminders via remindctl: add, list, complete.
- `findmy` (apple/findmy) — Track Apple devices/AirTags via FindMy.app on macOS.
- `imessage` (apple/imessage) — Send and receive iMessages/SMS via the imsg CLI on macOS.
- `macos-computer-use` (apple/macos-computer-use) — |
- `claude-code` (autonomous-ai-agents/claude-code) — Delegate coding to Claude Code CLI (features, PRs).
- `codex` (autonomous-ai-agents/codex) — Delegate coding to OpenAI Codex CLI (features, PRs).
- `hermes-agent` (autonomous-ai-agents/hermes-agent) — Configure, extend, or contribute to Hermes Agent.
- `opencode` (autonomous-ai-agents/opencode) — Delegate coding to OpenCode CLI (features, PR review).
- `architecture-diagram` (creative/architecture-diagram) — Dark-themed SVG architecture/cloud/infra diagrams as HTML.
- `ascii-art` (creative/ascii-art) — ASCII art: pyfiglet, cowsay, boxes, image-to-ascii.
- `ascii-video` (creative/ascii-video) — ASCII video: convert video/audio to colored ASCII MP4/GIF.
- `baoyu-infographic` (creative/baoyu-infographic) — Infographics: 21 layouts x 21 styles (信息图, 可视化).
- `claude-design` (creative/claude-design) — Design one-off HTML artifacts (landing, deck, prototype).
- `comfyui` (creative/comfyui) — Generate images, video, and audio with ComfyUI — install, launch, manage nodes/models, run workflows with parameter injection. Uses the official comfy-cli for lifecycle and direct REST/WebSocket API for execution.
- `design-md` (creative/design-md) — Author/validate/export Google
- `excalidraw` (creative/excalidraw) — Hand-drawn Excalidraw JSON diagrams (arch, flow, seq).
- `humanizer` (creative/humanizer) — Humanize text: strip AI-isms and add real voice.
- `manim-video` (creative/manim-video) — Manim CE animations: 3Blue1Brown math/algo videos.
- `p5js` (creative/p5js) — p5.js sketches: gen art, shaders, interactive, 3D.
- `popular-web-designs` (creative/popular-web-designs) — 54 real design systems (Stripe, Linear, Vercel) as HTML/CSS.
- `pretext` (creative/pretext) — Use when building creative browser demos with @chenglou/pretext — DOM-free text layout for ASCII art, typographic flow around obstacles, text-as-geometry games, kinetic typography, and text-powered generative art. Produces single-file HTML demos by default.
- `sketch` (creative/sketch) — Throwaway HTML mockups: 2-3 design variants to compare.
- `songwriting-and-ai-music` (creative/songwriting-and-ai-music) — Songwriting craft and Suno AI music prompts.
- `touchdesigner-mcp` (creative/touchdesigner-mcp) — Control a running TouchDesigner instance via twozero MCP — create operators, set parameters, wire connections, execute Python, build real-time visuals. 36 native tools.
- `jupyter-live-kernel` (data-science/jupyter-live-kernel) — Iterative Python via live Jupyter kernel (hamelnb).
- `kanban-orchestrator` (devops/kanban-orchestrator) — Decomposition playbook + anti-temptation rules for an orchestrator profile routing work through Kanban. The
- `kanban-worker` (devops/kanban-worker) — Pitfalls, examples, and edge cases for Hermes Kanban workers. The lifecycle itself is auto-injected into every worker
- `whatsapp-gateway-config` (devops/whatsapp-gateway-config) — WhatsApp gateway configuration for Hermes Agent — require_mention, dm_policy, group_policy, allow_from, mention_patterns, group_sessions_per_user, and all platform-specific settings.
- `dogfood` (dogfood) — Exploratory QA of web apps: find bugs, evidence, reports.
- `himalaya` (email/himalaya) — Himalaya CLI: IMAP/SMTP email from terminal.
- `codebase-inspection` (github/codebase-inspection) — Inspect codebases w/ pygount: LOC, languages, ratios.
- `github-auth` (github/github-auth) — GitHub auth setup: HTTPS tokens, SSH keys, gh CLI login.
- `github-code-review` (github/github-code-review) — Review PRs: diffs, inline comments via gh or REST.
- `github-issues` (github/github-issues) — Create, triage, label, assign GitHub issues via gh or REST.
- `github-pr-workflow` (github/github-pr-workflow) — GitHub PR lifecycle: branch, commit, open, CI, merge.
- `github-repo-management` (github/github-repo-management) — Clone/create/fork repos; manage remotes, releases.
- `gif-search` (media/gif-search) — Search/download GIFs from Tenor via curl + jq.
- `heartmula` (media/heartmula) — HeartMuLa: Suno-like song generation from lyrics + tags.
- `songsee` (media/songsee) — Audio spectrograms/features (mel, chroma, MFCC) via CLI.
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
- `node-inspect-debugger` (software-development/node-inspect-debugger) — Debug Node.js via --inspect + Chrome DevTools Protocol CLI.
- `plan` (software-development/plan) — Plan mode: write an actionable markdown plan to .hermes/plans/, no execution. Bite-sized tasks, exact paths, complete code.
- `python-debugpy` (software-development/python-debugpy) — Debug Python: pdb REPL + debugpy remote (DAP).
- `requesting-code-review` (software-development/requesting-code-review) — Pre-commit review: security scan, quality gates, auto-fix.
- `simplify-code` (software-development/simplify-code) — Parallel 3-agent cleanup of recent code changes.
- `spike` (software-development/spike) — Throwaway experiments to validate an idea before build.
- `systematic-debugging` (software-development/systematic-debugging) — 4-phase root cause debugging: understand bugs before fixing.
- `test-driven-development` (software-development/test-driven-development) — TDD: enforce RED-GREEN-REFACTOR, tests before code.
- `yuanbao` (yuanbao) — Yuanbao (元宝) groups: @mention users, query info/members.

## Archivos operativos clave observados

No se copia el contenido de estos archivos; solo tamaño y huella para validación.

- `config.yaml`: 14.3 KB, sha256 5bdbae3915003815
- `memories/MEMORY.md`: 2.0 KB, sha256 c829913b809f1b67
- `memories/USER.md`: 1.0 KB, sha256 fda09d591b3c4def
- `channel_directory.json`: 856.0 B, sha256 4183b01bafe17a96
- `gateway_state.json`: 505.0 B, sha256 2dc631c41718fc32
- `cron/jobs.json`: missing, sha256 missing

## Archivos actualizados por este backup

- `backups/BACKUP.md`
- `backups/RESTORE_GUIDE.md`
- `backups/restore.sh`
- `scripts/demeter_daily_backup.py`

## Exclusiones estrictas

No se exportan ni se copian:

- `.env`, `.git-credentials`, `auth.json`, `google_token.json`, `google_client_secret.json`, `creds.json`.
- Sesiones de WhatsApp, Telegram, Discord u otras plataformas.
- `state.db`, bases de datos runtime, WAL/SHM, caches, adjuntos, audios, imágenes o documentos de usuario.
- Prompts completos de cron, destinos de entrega, chat identifiers, nombres de contactos o datos personales.
- Logs completos o dumps de conversaciones.

## Restauración

1. Consultar `backups/RESTORE_GUIDE.md`.
2. Ejecutar `backups/restore.sh` solo para verificación segura; no restaura secretos.
3. Reconfigurar credenciales y OAuth manualmente desde fuentes autorizadas.
4. Reconstituir cron jobs desde esta sección y desde instrucciones humanas autorizadas para prompts/destinos excluidos.
