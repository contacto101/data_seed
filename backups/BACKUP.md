# Backup operativo no sensible — DataSeed / Demeter

- Generado UTC: 2026-06-11 16:33:27 UTC
- Generado America/Santiago: 2026-06-11 12:33:27 -04
- Alcance: estado operativo no sensible para recuperación crítica.
- Política: no se respaldan credenciales, tokens, secretos OAuth, contraseñas, sesiones de mensajería, bases de datos runtime, logs completos, caches ni adjuntos. Scripts/documentos adicionales requieren aprobación explícita; ante duda se omiten.
- Rama objetivo: `main` en `https://github.com/contacto101/data_seed.git`.

## Archivos actualizados por este backup

- `backups/BACKUP.md`
- `backups/RESTORE_GUIDE.md`
- `backups/restore.sh`
- `scripts/demeter_daily_backup.py`

## Archivos operativos clave observados

No se copia el contenido de estos archivos; solo tamaño y huella para validación.

- `config.yaml`: 14.3 KB, sha256 5bdbae3915003815
- `memories/MEMORY.md`: 1.8 KB, sha256 52659377451beaea
- `memories/USER.md`: 1.0 KB, sha256 fda09d591b3c4def
- `channel_directory.json`: 856.0 B, sha256 496b5ad9e9888b64
- `gateway_state.json`: 505.0 B, sha256 2dc631c41718fc32
- `cron/jobs.json`: 1.4 KB, sha256 bb1a74fdb4607987

## Exclusiones estrictas

No se exportan ni se copian:

- `.env`, `.git-credentials`, `auth.json`, `google_token.json`, `google_client_secret.json`, `creds.json`.
- Sesiones de WhatsApp, Telegram, Discord u otras plataformas.
- `state.db`, bases de datos runtime, WAL/SHM, caches, adjuntos, audios, imágenes o documentos de usuario.
- Prompts completos de cron, destinos de entrega, chat identifiers, nombres de contactos o datos personales.
- Logs completos o dumps de conversaciones.

Para restauración completa, ver `backups/RESTORE_GUIDE.md`.
