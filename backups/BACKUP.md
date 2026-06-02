# Backup operativo no sensible — DataSeed / Demeter

- Generado: 2026-06-02 05:03:40 -04 -0400
- Referencia UTC: 2026-06-02 09:03:40 UTC
- Alcance: configuración operativa no sensible del perfil activo y estado técnico relevante.
- Política: credenciales, tokens, secretos OAuth, archivos `.env`, `google_token.json`, `google_client_secret.json`, `auth.json` y equivalentes quedan excluidos.
- Restauración: consultar `backups/RESTORE_GUIDE.md` y ejecutar/validar `backups/restore.sh` según el entorno destino.

Los datos respaldados son semillas operativas: al ordenarse técnicamente sostienen análisis, automatización y decisiones útiles.

## Identidad operativa

- Agente operativo: Demeter.
- Runtime/software base: Hermes Agent, usado solo como plataforma CLI y gateway técnico.
- Perfil activo observado: `default`.
- Directorio de trabajo observado: `/opt/data`.

## Configuración general no sensible

- Modelo principal: provider `openai-codex`, model `gpt-5.5`.
- Toolset declarado: `hermes-cli`.
- Límite de turnos del agente: `200`.
- Timeout de gateway: `1800s`.
- Backend terminal: `local`; shell persistente: `True`.
- Backend web: `firecrawl`; gateway web: `False`.
- Checkpoints: `False`.
- Seguridad: redact_secrets=`True`, tirith_enabled=`True`, allow_private_urls=`False`.
- Aprobaciones: mode=`manual`, cron_mode=`deny`.
- Plugins habilitados: `google_meet`.

## Estado STT/TTS y voz

- STT: enabled=`True`, provider=`local`, local_model=`large`.
- TTS: provider=`edge`, edge_voice=`es-CL-CatalinaNeural`.
- Voz: auto_tts=`False`, max_recording_seconds=`120`.

## Memoria y contexto

- Memoria: enabled=`True`, user_profile_enabled=`True`.
- Límites: memory_char_limit=`2200`, user_char_limit=`1375`.
- Motor de contexto: `compressor`.
- Compresión: enabled=`True`, threshold=`0.8`.

## Gateway, plataformas y toolsets habilitados

- Gateway strict: `False`; trust_recent_files=`True`.
- `cli`: browser, clarify, code_execution, computer_use, cronjob, delegation, file, image_gen, memory, messaging, session_search, skills, terminal, todo, tts, vision, web
- `whatsapp`: browser, clarify, code_execution, computer_use, cronjob, delegation, file, image_gen, memory, messaging, session_search, skills, terminal, todo, tts, vision, web
- Toolsets de plugins conocidos:
  - `cli`: spotify
  - `whatsapp`: spotify

## Cron jobs configurados y estado

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         Scheduled Jobs                                  │
└─────────────────────────────────────────────────────────────────────────┘

  8b29cf53ca6c [active]
    Name:      Demeter Daily Backup
    Schedule:  0 9 * * *
    Repeat:    ∞
    Next run:  2026-06-03T09:00:00+00:00
    Deliver:   origin
    Last run:  2026-06-01T09:04:22.152976+00:00  ok

  f6254c8c4821 [active]
    Name:      Growth Engine — Reporte Matutino 7:30 AM
    Schedule:  30 11 * * *
    Repeat:    ∞
    Next run:  2026-06-02T11:30:00+00:00
    Deliver:   origin
    Last run:  2026-06-01T11:31:31.022224+00:00  ok

  4ab827188183 [active]
    Name:      Growth Engine — Reporte Vespertino 7:30 PM
    Schedule:  30 23 * * *
    Repeat:    ∞
    Next run:  2026-06-02T23:30:00+00:00
    Deliver:   origin
    Last run:  2026-06-01T23:31:07.719331+00:00  ok

  d1a0c5131f4b [active]
    Name:      Growth Engine — Auto Backlog Updater
    Schedule:  0 */4 * * *
    Repeat:    ∞
    Next run:  2026-06-02T12:00:00+00:00
    Deliver:   origin
    Last run:  2026-06-02T08:00:40.199263+00:00  ok

  83438a129f08 [active]
    Name:      Demeter Watchdog Silencioso 24/7
    Schedule:  every 5m
    Repeat:    ∞
    Next run:  2026-06-02T09:04:56.982500+00:00
    Deliver:   origin
    Script:    demeter_watchdog.py
    Mode:      no-agent (script stdout delivered directly)
    Last run:  2026-06-02T08:59:56.982500+00:00  ok

  564c07cb2978 [active]
    Name:      Demeter Operadora 24/7 — Ciclo cada 30 min
    Schedule:  every 120m
    Repeat:    ∞
    Next run:  2026-06-02T09:21:54.934878+00:00
    Deliver:   origin
    Skills:    markdown-backlog-maintenance
    Workdir:   /opt/data
    Last run:  2026-06-02T07:21:54.934878+00:00  ok
```

## Skills instalados

Total detectado: 102

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
- `devops/agent-cost-optimization`
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
- Curator backup: enabled=`True`, keep=`5`.
- Cachés locales: audio_cache=17, image_cache=6, document_cache=2 (solo conteos; nombres excluidos por seguridad).
- Sesiones locales registradas: 226 archivos.
- Procesos relevantes detectados:
  - `1 ttyd --port 4860 -c hermesdataseed:8bCQnIwZG0TGPBnj8bp6qOOxBBqwb3nR -W -t titleFixed Hermes Agent -t disableResizeOverlay true /hermes.sh`
  - `11 /opt/hermes/.venv/bin/python3 /opt/hermes/.venv/bin/hermes gateway run`
  - `27 node /opt/hermes/scripts/whatsapp-bridge/bridge.js --port 3000 --session /opt/data/whatsapp/session --mode bot`
  - `45 [hermes] <defunct>`
  - `5390 [hermes] <defunct>`
  - `5391 [hermes] <defunct>`
  - `5392 [hermes] <defunct>`

## Repositorios observados

- No se detectaron repositorios Git operativos fuera del clon temporal.

## Exclusiones de seguridad aplicadas

- No se copiaron ni listaron contenidos de tokens, API keys, contraseñas, OAuth secrets, archivos `.env`, `google_token.json`, `google_client_secret.json`, `auth.json` ni documentos equivalentes.
- No se incorporaron nombres de archivos de caché que puedan revelar identificadores sensibles.
- La configuración se resumió por claves operativas y valores no secretos.
