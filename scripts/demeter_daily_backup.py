#!/usr/bin/env python3
"""
Demeter Daily Backup

Creates a non-sensitive operational backup for DataSeed/Demeter and pushes it
back to the same GitHub branch used for critical recovery.

Safety policy:
- Only writes markdown and safe helper scripts into the repository.
- Never copies .env, OAuth credentials, auth.json, WhatsApp sessions, databases,
  logs, caches, or user attachments.
- Cron prompts and delivery targets are intentionally excluded.
"""
from __future__ import annotations

import json
import os
import platform
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from zoneinfo import ZoneInfo
except Exception:  # pragma: no cover
    ZoneInfo = None  # type: ignore

HERMES_HOME = Path(os.environ.get("HERMES_HOME", "/opt/data")).resolve()
REPO_URL = os.environ.get("DATASEED_BACKUP_REPO", "https://github.com/contacto101/data_seed.git")
REPO_DIR = Path(os.environ.get("DATASEED_REPO_DIR", str(HERMES_HOME / "data_seed"))).resolve()
BRANCH = os.environ.get("DATASEED_BACKUP_BRANCH", "main")
HERMES_BIN = Path(os.environ.get("HERMES_BIN", "/opt/hermes/.venv/bin/hermes"))
SCRIPT_SOURCE = Path(__file__).resolve()

ALLOWED_REPO_OUTPUTS = [
    "backups/BACKUP.md",
    "backups/RESTORE_GUIDE.md",
    "backups/restore.sh",
    "scripts/demeter_daily_backup.py",
]

# Values matching these patterns must not appear in generated backup files.
SECRET_VALUE_PATTERNS = [
    re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"gh[pousr]_[A-Za-z0-9_]{20,}"),
    re.compile(r"sk-[A-Za-z0-9_-]{20,}"),
    re.compile(r"xox[baprs]-[A-Za-z0-9-]{20,}"),
    re.compile(r"ya29\.[A-Za-z0-9_-]{20,}"),
    re.compile(r"AIza[0-9A-Za-z_-]{20,}"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"https://[^\s:@]+:[^\s:@]{12,}@github\.com"),
]


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def now_santiago() -> datetime | None:
    if ZoneInfo is None:
        return None
    try:
        return now_utc().astimezone(ZoneInfo("America/Santiago"))
    except Exception:
        return None


def run(cmd: list[str], cwd: Path | None = None, check: bool = True, extra_env: dict[str, str] | None = None) -> str:
    env = os.environ.copy()
    if extra_env:
        env.update(extra_env)
    proc = subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    out = (proc.stdout or "") + (proc.stderr or "")
    out = sanitize_text(out)
    if check and proc.returncode != 0:
        raise RuntimeError(f"Command failed ({proc.returncode}): {' '.join(cmd)}\n{out.strip()}")
    return out.strip()


def sanitize_text(text: str) -> str:
    clean = text
    for pat in SECRET_VALUE_PATTERNS:
        clean = pat.sub("<redacted-secret>", clean)
    return clean


def assert_no_secret_values(label: str, text: str) -> None:
    for pat in SECRET_VALUE_PATTERNS:
        if pat.search(text):
            raise RuntimeError(f"Refusing to write {label}: secret-like value detected by {pat.pattern}")


def read_dotenv_key(key: str) -> str | None:
    env_path = HERMES_HOME / ".env"
    if key in os.environ and os.environ[key].strip():
        return os.environ[key].strip().strip('"').strip("'")
    if not env_path.exists():
        return None
    try:
        for raw in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            if k.strip() == key:
                return v.strip().strip('"').strip("'")
    except OSError:
        return None
    return None


def ensure_git_auth() -> None:
    token = read_dotenv_key("GITHUB_TOKEN")
    if not token:
        return
    run(["git", "config", "--global", "credential.helper", "store"], check=False)
    cred_path = Path.home() / ".git-credentials"
    existing = ""
    if cred_path.exists():
        existing = cred_path.read_text(encoding="utf-8", errors="ignore")
    if "github.com" not in existing:
        cred_path.write_text(f"https://x-access-token:{token}@github.com\n", encoding="utf-8")
        try:
            cred_path.chmod(0o600)
        except OSError:
            pass


def ensure_repo() -> None:
    ensure_git_auth()
    REPO_DIR.parent.mkdir(parents=True, exist_ok=True)
    if (REPO_DIR / ".git").is_dir():
        run(["git", "remote", "set-url", "origin", REPO_URL], cwd=REPO_DIR)
        run(["git", "fetch", "origin", BRANCH], cwd=REPO_DIR)
        run(["git", "checkout", BRANCH], cwd=REPO_DIR)
        run(["git", "pull", "--ff-only", "origin", BRANCH], cwd=REPO_DIR)
    elif REPO_DIR.exists() and any(REPO_DIR.iterdir()):
        raise RuntimeError(f"{REPO_DIR} exists and is not an empty git repo; refusing to overwrite it")
    else:
        run(["git", "clone", "--branch", BRANCH, REPO_URL, str(REPO_DIR)])
    run(["git", "config", "user.name", "Demeter Backup Bot"], cwd=REPO_DIR)
    run(["git", "config", "user.email", "demeter@dataseed.local"], cwd=REPO_DIR)


def file_size_human(path: Path) -> str:
    try:
        size = path.stat().st_size
    except OSError:
        return "missing"
    units = ["B", "KB", "MB", "GB"]
    value = float(size)
    for unit in units:
        if value < 1024 or unit == units[-1]:
            return f"{value:.1f} {unit}"
        value /= 1024
    return f"{size} B"


def sha256_short(path: Path) -> str:
    try:
        h = __import__("hashlib").sha256()
        with path.open("rb") as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                h.update(chunk)
        return h.hexdigest()[:16]
    except OSError:
        return "missing"


def extract_yaml_scalar(path: Path, section: str, key: str) -> str:
    if not path.exists():
        return "missing"
    lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    in_section = False
    for line in lines:
        if not line.startswith(" ") and line.rstrip() == f"{section}:":
            in_section = True
            continue
        if in_section and line and not line.startswith(" "):
            break
        if in_section:
            m = re.match(rf"^\s{{2}}{re.escape(key)}:\s*(.*)$", line)
            if m:
                return m.group(1).strip() or "''"
    return "missing"


def extract_top_toolsets(path: Path) -> list[str]:
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    result: list[str] = []
    in_toolsets = False
    for line in lines:
        if line.rstrip() == "toolsets:":
            in_toolsets = True
            continue
        if in_toolsets and line and not line.startswith("-") and not line.startswith(" "):
            break
        if in_toolsets:
            m = re.match(r"^-\s+(.+)$", line)
            if m:
                result.append(m.group(1).strip())
    return result


def config_summary() -> str:
    cfg = HERMES_HOME / "config.yaml"
    toolsets = extract_top_toolsets(cfg)
    rows = [
        f"- Config path: `{cfg}` ({file_size_human(cfg)}, sha256 {sha256_short(cfg)})",
        f"- Model provider: `{extract_yaml_scalar(cfg, 'model', 'provider')}`",
        f"- Model default: `{extract_yaml_scalar(cfg, 'model', 'default')}`",
        f"- Agent max_turns: `{extract_yaml_scalar(cfg, 'agent', 'max_turns')}`",
        f"- Agent reasoning_effort: `{extract_yaml_scalar(cfg, 'agent', 'reasoning_effort')}`",
        f"- Display personality: `{extract_yaml_scalar(cfg, 'display', 'personality')}`",
        f"- Display show_reasoning: `{extract_yaml_scalar(cfg, 'display', 'show_reasoning')}`",
        f"- Terminal backend: `{extract_yaml_scalar(cfg, 'terminal', 'backend')}`",
        f"- Terminal cwd: `{extract_yaml_scalar(cfg, 'terminal', 'cwd')}`",
        f"- Top-level toolsets: `{', '.join(toolsets) if toolsets else 'none listed'}`",
    ]
    return "\n".join(rows)


def cron_summary() -> str:
    jobs_file = HERMES_HOME / "cron" / "jobs.json"
    if not jobs_file.exists():
        return "No cron jobs file found."
    try:
        data: Any = json.loads(jobs_file.read_text(encoding="utf-8"))
    except Exception as exc:
        return f"Could not parse cron jobs file: {exc}"
    jobs = data.get("jobs", data) if isinstance(data, dict) else data
    if not isinstance(jobs, list) or not jobs:
        return "No cron jobs configured."
    lines = [f"Total jobs: {len(jobs)}. Sensitive fields excluded: prompt, deliver, delivery targets.", ""]
    for job in jobs:
        if not isinstance(job, dict):
            continue
        schedule = job.get("schedule_display")
        raw_schedule = job.get("schedule")
        if not schedule and isinstance(raw_schedule, dict):
            schedule = raw_schedule.get("display") or raw_schedule.get("expr") or raw_schedule.get("value")
        skills = job.get("skills") or ([job.get("skill")] if job.get("skill") else [])
        model = job.get("model") or {}
        lines.extend([
            f"- `{job.get('id', 'unknown')}` [{'active' if job.get('enabled', True) else 'paused'}]",
            f"  - Nombre: {job.get('name', '(unnamed)')}",
            f"  - Schedule: {schedule or 'unknown'}",
            f"  - Next run UTC: {job.get('next_run_at', 'unknown')}",
            f"  - Last run UTC/status: {job.get('last_run_at', 'never')} / {job.get('last_status', 'unknown')}",
            f"  - Mode: {'no-agent' if job.get('no_agent') else 'agent'}",
        ])
        if job.get("script"):
            lines.append(f"  - Script: {job.get('script')}")
        if job.get("workdir"):
            lines.append(f"  - Workdir: {job.get('workdir')}")
        if skills:
            lines.append(f"  - Skills: {', '.join(str(s) for s in skills if s)}")
        if isinstance(model, dict) and (model.get("provider") or model.get("model")):
            lines.append(f"  - Model override: {model.get('provider', 'default')}/{model.get('model', 'default')}")
        toolsets = job.get("enabled_toolsets")
        if toolsets:
            lines.append(f"  - Enabled toolsets: {', '.join(toolsets)}")
    return "\n".join(lines)


def skills_summary() -> str:
    skills_root = HERMES_HOME / "skills"
    if not skills_root.exists():
        return "No skills directory found."
    entries: list[str] = []
    for skill_md in sorted(skills_root.glob("**/SKILL.md")):
        try:
            text = skill_md.read_text(encoding="utf-8", errors="ignore")[:2000]
        except OSError:
            continue
        name = skill_md.parent.name
        desc = ""
        m_name = re.search(r"^name:\s*['\"]?([^'\"\n]+)", text, flags=re.M)
        m_desc = re.search(r"^description:\s*['\"]?([^'\"\n]+)", text, flags=re.M)
        if m_name:
            name = m_name.group(1).strip()
        if m_desc:
            desc = m_desc.group(1).strip()
        rel = skill_md.parent.relative_to(skills_root)
        entries.append(f"- `{name}` ({rel})" + (f" — {desc}" if desc else ""))
    return "\n".join(entries) if entries else "No SKILL.md files found."


def key_files_summary() -> str:
    candidates = [
        HERMES_HOME / "config.yaml",
        HERMES_HOME / "memories" / "MEMORY.md",
        HERMES_HOME / "memories" / "USER.md",
        HERMES_HOME / "channel_directory.json",
        HERMES_HOME / "gateway_state.json",
        HERMES_HOME / "cron" / "jobs.json",
    ]
    lines = []
    for path in candidates:
        rel = path if not str(path).startswith(str(HERMES_HOME)) else path.relative_to(HERMES_HOME)
        lines.append(f"- `{rel}`: {file_size_human(path)}, sha256 {sha256_short(path)}")
    return "\n".join(lines)


def system_summary() -> str:
    lines = [
        f"- Host: `{platform.platform()}`",
        f"- Python: `{platform.python_version()}`",
        f"- Hermes home: `{HERMES_HOME}`",
        f"- Backup repo dir: `{REPO_DIR}`",
        f"- Backup branch: `{BRANCH}`",
    ]
    if HERMES_BIN.exists():
        lines.append(f"- Hermes binary: `{HERMES_BIN}`")
    df = run(["df", "-h", str(HERMES_HOME)], check=False)
    if df:
        lines.append("- Disk snapshot:")
        for ln in df.splitlines():
            lines.append(f"  `{ln}`")
    return "\n".join(lines)


def build_backup_md() -> str:
    utc = now_utc()
    santiago = now_santiago()
    santiago_line = santiago.strftime("%Y-%m-%d %H:%M:%S %Z") if santiago else "not available"
    content = f"""# Backup operativo no sensible — DataSeed / Demeter

- Generado UTC: {utc.strftime('%Y-%m-%d %H:%M:%S %Z')}
- Generado America/Santiago: {santiago_line}
- Alcance: estado operativo no sensible para recuperación crítica.
- Política: no se respaldan credenciales, tokens, secretos OAuth, contraseñas, sesiones de mensajería, bases de datos runtime, logs completos, caches ni adjuntos.
- Rama objetivo: `{BRANCH}` en `{REPO_URL}`.

Los datos respaldados son semillas operativas: identidad, configuración resumida, cron jobs sanitizados, skills instalados y scripts seguros de restauración.

## Identidad operativa

- Agente operativo: Demeter.
- Proyecto: DataSeed.
- Runtime técnico: Hermes Agent.
- Perfil activo esperado: `default`.
- Directorio persistente esperado: `/opt/data`.

## Estado técnico

{system_summary()}

## Configuración Hermes sanitizada

{config_summary()}

## Cron jobs configurados y estado

{cron_summary()}

## Skills instalados

{skills_summary()}

## Archivos operativos clave observados

No se copia el contenido de estos archivos; solo tamaño y huella para validación.

{key_files_summary()}

## Archivos actualizados por este backup

{chr(10).join(f'- `{p}`' for p in ALLOWED_REPO_OUTPUTS)}

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
"""
    return sanitize_text(content)


def build_restore_guide() -> str:
    return sanitize_text("""# Guía de restauración crítica — DataSeed / Demeter

Esta guía permite reconstruir el estado operativo no sensible de Demeter después de un reinicio crítico o pérdida del contenedor.

## Principios

- El repositorio contiene únicamente material no sensible.
- Los secretos nunca se restauran desde GitHub.
- Las credenciales se reconfiguran manualmente desde fuentes autorizadas.
- Los prompts completos de cron y los destinos de entrega no se guardan en este backup.

## Pasos de recuperación

1. Preparar el entorno persistente esperado:

```bash
mkdir -p /opt/data
cd /opt/data
```

2. Clonar el repositorio de recuperación:

```bash
git clone https://github.com/contacto101/data_seed.git /opt/data/data_seed
cd /opt/data/data_seed
```

3. Revisar el snapshot operativo:

```bash
less backups/BACKUP.md
```

4. Instalar o validar Hermes Agent según la documentación oficial.

5. Configurar secretos fuera del repositorio:

- GitHub token o credenciales git.
- OAuth de proveedores LLM.
- Credenciales de Google/Firebase si aplican.
- Tokens de APIs externas como ChileCompra o HubSpot.
- Sesiones de WhatsApp/gateway si se requiere continuidad de mensajería.

6. Validar configuración y gateway:

```bash
/opt/hermes/.venv/bin/hermes config check || true
/opt/hermes/.venv/bin/hermes doctor || true
/opt/hermes/.venv/bin/hermes cron list || true
```

7. Reconstituir cron jobs:

- Usar la sección de cron jobs de `backups/BACKUP.md` para nombres, horarios, scripts, skills y workdirs.
- Pedir al operador humano los prompts completos y destinos cuando estén excluidos.
- Mantener los backups y watchdogs como no-agent cuando sea posible para reducir riesgo de filtrar secretos.

8. Ejecutar verificación segura:

```bash
bash backups/restore.sh
```

## Archivos seguros de este backup

- `backups/BACKUP.md`: snapshot operativo sanitizado.
- `backups/RESTORE_GUIDE.md`: esta guía.
- `backups/restore.sh`: verificación segura post-restore.
- `scripts/demeter_daily_backup.py`: rutina que genera el backup diario.

## Nunca commitear

- `.env`
- `.git-credentials`
- `auth.json`
- `google_token.json`
- `google_client_secret.json`
- `creds.json`
- `state.db` y derivados WAL/SHM
- sesiones de mensajería
- logs completos
- caches o adjuntos de usuario
""")


def build_restore_sh() -> str:
    return sanitize_text(r"""#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "[1/5] Repo"
git status --short || true

echo "[2/5] Checking that forbidden sensitive files are not tracked"
FORBIDDEN_REGEX='(^|/)(\.env|\.git-credentials|auth\.json|google_token\.json|google_client_secret\.json|creds\.json|state\.db|state\.db-wal|state\.db-shm|response_store\.db|response_store\.db-wal|response_store\.db-shm)($|/)'
if git ls-files | grep -E "$FORBIDDEN_REGEX" >/dev/null; then
  echo "ERROR: forbidden sensitive/runtime file tracked in repo"
  git ls-files | grep -E "$FORBIDDEN_REGEX"
  exit 1
fi

echo "[3/5] Hermes availability"
if [ -x /opt/hermes/.venv/bin/hermes ]; then
  /opt/hermes/.venv/bin/hermes --version || true
  /opt/hermes/.venv/bin/hermes config path || true
else
  echo "NOTE: /opt/hermes/.venv/bin/hermes not found. Install Hermes before full restore."
fi

echo "[4/5] Cron visibility"
if [ -x /opt/hermes/.venv/bin/hermes ]; then
  /opt/hermes/.venv/bin/hermes cron list || true
else
  echo "NOTE: cannot list cron jobs without Hermes."
fi

echo "[5/5] Backup files"
test -f backups/BACKUP.md && echo "OK backups/BACKUP.md"
test -f backups/RESTORE_GUIDE.md && echo "OK backups/RESTORE_GUIDE.md"
test -f scripts/demeter_daily_backup.py && echo "OK scripts/demeter_daily_backup.py"

echo "Restore verification completed. Configure secrets manually; none are stored in this repo."
""")


def write_repo_file(rel: str, content: str, executable: bool = False) -> None:
    assert rel in ALLOWED_REPO_OUTPUTS, f"Refusing to write unexpected repo path: {rel}"
    assert_no_secret_values(rel, content)
    path = REPO_DIR / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    if executable:
        try:
            path.chmod(0o755)
        except OSError:
            pass


def copy_self_to_repo() -> None:
    text = SCRIPT_SOURCE.read_text(encoding="utf-8")
    assert_no_secret_values("scripts/demeter_daily_backup.py", text)
    write_repo_file("scripts/demeter_daily_backup.py", text, executable=True)


def update_repo_files() -> None:
    write_repo_file("backups/BACKUP.md", build_backup_md())
    write_repo_file("backups/RESTORE_GUIDE.md", build_restore_guide())
    write_repo_file("backups/restore.sh", build_restore_sh(), executable=True)
    copy_self_to_repo()


def commit_and_push() -> str:
    run(["git", "add", *ALLOWED_REPO_OUTPUTS], cwd=REPO_DIR)
    diff = run(["git", "diff", "--cached", "--name-only"], cwd=REPO_DIR, check=False)
    if not diff.strip():
        current = run(["git", "rev-parse", "--short", "HEAD"], cwd=REPO_DIR)
        return f"Demeter Daily Backup OK: sin cambios; HEAD {current}"
    utc = now_utc().strftime("%Y-%m-%d %H:%M UTC")
    run(["git", "commit", "-m", f"backup: estado operativo Demeter {utc}"], cwd=REPO_DIR)
    run(["git", "push", "origin", BRANCH], cwd=REPO_DIR)
    current = run(["git", "rev-parse", "--short", "HEAD"], cwd=REPO_DIR)
    changed = ", ".join(diff.splitlines())
    return f"Demeter Daily Backup OK: commit {current} enviado a {BRANCH}; archivos: {changed}"


def main() -> int:
    try:
        ensure_repo()
        update_repo_files()
        print(commit_and_push())
        return 0
    except Exception as exc:
        print(f"Demeter Daily Backup ERROR: {sanitize_text(str(exc))}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
