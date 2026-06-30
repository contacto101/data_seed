#!/usr/bin/env python3
"""Commit selected files to GitHub via Agent Vault-brokered GitHub API.

Security invariant for DataSeed cron:
- Do not read GITHUB_TOKEN, GH_TOKEN, GITHUB_PAT, or ~/.git-credentials.
- Do not send an Authorization header from the agent process.
- Require Agent Vault proxy environment and let Agent Vault inject GitHub auth.

This helper exists because Git smart-HTTP push to github.com may not be
brokered by the same Agent Vault service that brokers api.github.com.
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import urllib.parse
import tempfile
from pathlib import Path
from typing import Any

API_ROOT = "https://api.github.com"
SENSITIVE_PATTERNS = [
    re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"gh[pousr]_[A-Za-z0-9_]{20,}"),
    re.compile(r"av_agt_[A-Za-z0-9_\-]{12,}"),
    re.compile(r"https?://[^\s/@:]+:[^\s/@]{8,}@"),
]


def sanitize(text: str) -> str:
    out = text
    for pat in SENSITIVE_PATTERNS:
        out = pat.sub("<redacted-secret>", out)
    out = re.sub(r"//([^/@:]+)(?::([^/@]*))?@", "//<userinfo>@", out)
    return out


def fail(message: str, code: int = 1) -> None:
    print(f"github_api_commit ERROR: {sanitize(message)}", file=sys.stderr)
    raise SystemExit(code)


def run_git(repo_dir: Path, args: list[str], check: bool = True) -> str:
    env = os.environ.copy()
    for key in ("GITHUB_TOKEN", "GH_TOKEN", "GITHUB_PAT"):
        env.pop(key, None)
    env["GIT_TERMINAL_PROMPT"] = "0"
    if Path("/bin/false").exists():
        env["GIT_ASKPASS"] = "/bin/false"
        env["SSH_ASKPASS"] = "/bin/false"
    # Disable direct credential helpers so this helper cannot silently fall back
    # to ~/.git-credentials.
    env["GIT_CONFIG_KEY_0"] = "credential.helper"
    env["GIT_CONFIG_VALUE_0"] = ""
    env["GIT_CONFIG_COUNT"] = "1"
    proc = subprocess.run(
        ["git", *args],
        cwd=str(repo_dir),
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    out = (proc.stdout or "") + (proc.stderr or "")
    if check and proc.returncode != 0:
        fail(f"git {' '.join(args)} failed ({proc.returncode}): {out.strip()}")
    return out.strip()


def parse_repo(repo_dir: Path, override: str | None) -> tuple[str, str]:
    if override:
        if "/" not in override:
            fail("--repo must be owner/name")
        owner, repo = override.split("/", 1)
        return owner, repo
    remote = run_git(repo_dir, ["remote", "get-url", "origin"])
    remote = remote.strip()
    patterns = [
        r"github\.com[:/](?P<owner>[^/]+)/(?P<repo>[^/.]+)(?:\.git)?$",
        r"https?://(?:[^/@]+@)?github\.com/(?P<owner>[^/]+)/(?P<repo>[^/.]+)(?:\.git)?$",
    ]
    for pat in patterns:
        match = re.search(pat, remote)
        if match:
            return match.group("owner"), match.group("repo")
    fail(f"Could not derive GitHub owner/repo from origin URL: {remote}")


def normalize_proxy(proxy: str) -> str:
    if not proxy:
        return proxy
    parsed = urllib.parse.urlsplit(proxy)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return proxy
    if "@" not in parsed.netloc:
        return proxy
    userinfo, hostpart = parsed.netloc.rsplit("@", 1)
    if ":" not in userinfo:
        userinfo = userinfo + ":"
    return urllib.parse.urlunsplit((parsed.scheme, f"{userinfo}@{hostpart}", parsed.path, parsed.query, parsed.fragment))


def require_agent_vault_proxy() -> dict[str, str]:
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy") or os.environ.get("HTTP_PROXY") or os.environ.get("http_proxy")
    token = os.environ.get("AGENT_VAULT_TOKEN", "")
    if not proxy:
        fail("Agent Vault proxy env is missing (HTTPS_PROXY/HTTP_PROXY)")
    if not token.startswith("av_agt_"):
        fail("AGENT_VAULT_TOKEN is missing or does not look like an Agent Vault agent token")
    env = os.environ.copy()
    proxy = normalize_proxy(proxy)
    env["HTTPS_PROXY"] = proxy
    env["HTTP_PROXY"] = proxy
    env["https_proxy"] = proxy
    env["http_proxy"] = proxy
    for key in ("GITHUB_TOKEN", "GH_TOKEN", "GITHUB_PAT"):
        env.pop(key, None)
    return env


def api(env: dict[str, str], method: str, path: str, payload: dict[str, Any] | None = None) -> Any:
    cmd = [
        "curl",
        "-sS",
        "--max-time",
        "60",
        "-X",
        method,
        "-H",
        "Accept: application/vnd.github+json",
        "-H",
        "Content-Type: application/json",
        "-H",
        "User-Agent: demeter-agent-vault-cron",
        "-H",
        "X-GitHub-Api-Version: 2022-11-28",
        "-w",
        "\n__HTTP_STATUS__:%{http_code}",
    ]
    ca = env.get("GIT_SSL_CAINFO") or env.get("SSL_CERT_FILE") or env.get("REQUESTS_CA_BUNDLE")
    if ca and Path(ca).exists():
        cmd.extend(["--cacert", ca])
    if payload is not None:
        cmd.extend(["--data-binary", "@-"])
        stdin = json.dumps(payload).encode("utf-8")
    else:
        stdin = None
    cmd.append(API_ROOT + path)
    # Intentionally no Authorization header: Agent Vault must inject it.
    proc = subprocess.run(cmd, input=stdin, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    text = proc.stdout.decode("utf-8", errors="replace")
    stderr = proc.stderr.decode("utf-8", errors="replace")
    marker = "\n__HTTP_STATUS__:"
    if marker not in text:
        fail(f"GitHub API {method} {path} failed before HTTP status rc={proc.returncode}: {stderr.strip()} {text[:500]}")
    body, status_text = text.rsplit(marker, 1)
    try:
        status = int(status_text.strip()[:3])
    except ValueError:
        fail(f"GitHub API {method} {path} returned unparsable status: {status_text!r}")
    if proc.returncode != 0 or status >= 400:
        fail(f"GitHub API {method} {path} failed HTTP {status} rc={proc.returncode}: {stderr.strip()} {body[:2000]}")
    if not body.strip():
        return {}
    try:
        return json.loads(body)
    except json.JSONDecodeError as exc:
        fail(f"GitHub API {method} {path} returned non-JSON body: {exc}: {body[:1000]}")


def github_path(path: str) -> str:
    return urllib.parse.quote(path, safe="/")


def get_head(env: dict[str, str], owner: str, repo: str, branch: str) -> tuple[str, str]:
    ref = api(env, "GET", f"/repos/{owner}/{repo}/git/ref/heads/{github_path(branch)}")
    commit_sha = ref.get("object", {}).get("sha")
    if not commit_sha:
        fail(f"Could not read branch head for {branch}")
    commit = api(env, "GET", f"/repos/{owner}/{repo}/git/commits/{commit_sha}")
    tree_sha = commit.get("tree", {}).get("sha")
    if not tree_sha:
        fail(f"Could not read tree for {commit_sha}")
    return commit_sha, tree_sha


def create_blob(env: dict[str, str], owner: str, repo: str, path: Path) -> str:
    raw = path.read_bytes()
    body = {"content": base64.b64encode(raw).decode("ascii"), "encoding": "base64"}
    blob = api(env, "POST", f"/repos/{owner}/{repo}/git/blobs", body)
    sha = blob.get("sha")
    if not sha:
        fail(f"No blob sha returned for {path}")
    return sha


def commit_files(repo_dir: Path, branch: str, message: str, paths: list[str], repo_override: str | None, dry_check: bool = False) -> str:
    owner, repo = parse_repo(repo_dir, repo_override)
    env = require_agent_vault_proxy()
    head_sha, base_tree = get_head(env, owner, repo, branch)
    if dry_check:
        return f"github_api_commit CHECK OK: repo={owner}/{repo} branch={branch} head={head_sha[:7]}"
    tree_entries: list[dict[str, str]] = []
    normalized_paths: list[str] = []
    for rel in paths:
        rel = rel.strip().lstrip("/")
        if not rel or rel.startswith("../") or "/../" in rel:
            fail(f"Unsafe repo path: {rel!r}")
        full = (repo_dir / rel).resolve()
        try:
            full.relative_to(repo_dir.resolve())
        except ValueError:
            fail(f"Path escapes repo dir: {rel}")
        if not full.exists() or not full.is_file():
            fail(f"Path does not exist or is not a file: {rel}")
        blob_sha = create_blob(env, owner, repo, full)
        mode = "100755" if os.access(full, os.X_OK) else "100644"
        tree_entries.append({"path": rel, "mode": mode, "type": "blob", "sha": blob_sha})
        normalized_paths.append(rel)
    if not tree_entries:
        return f"github_api_commit OK: no files requested; branch {branch} unchanged at {head_sha[:7]}"
    tree = api(env, "POST", f"/repos/{owner}/{repo}/git/trees", {"base_tree": base_tree, "tree": tree_entries})
    tree_sha = tree.get("sha")
    if not tree_sha:
        fail("No tree sha returned")
    if tree_sha == base_tree:
        return f"github_api_commit OK: sin cambios remotos; branch {branch} HEAD {head_sha[:7]}"
    commit = api(
        env,
        "POST",
        f"/repos/{owner}/{repo}/git/commits",
        {"message": message, "tree": tree_sha, "parents": [head_sha]},
    )
    new_sha = commit.get("sha")
    if not new_sha:
        fail("No commit sha returned")
    api(env, "PATCH", f"/repos/{owner}/{repo}/git/refs/heads/{github_path(branch)}", {"sha": new_sha, "force": False})
    return f"github_api_commit OK: commit {new_sha[:7]} enviado a {branch}; archivos: {', '.join(normalized_paths)}"


def main() -> int:
    parser = argparse.ArgumentParser(description="Commit files via Agent Vault-brokered GitHub API")
    parser.add_argument("--repo-dir", default=".")
    parser.add_argument("--repo", default=None, help="owner/name override")
    parser.add_argument("--branch", required=True)
    parser.add_argument("--message", default="chore: update files via Agent Vault GitHub API")
    parser.add_argument("--check", action="store_true", help="read-only check only")
    parser.add_argument("paths", nargs="*")
    args = parser.parse_args()
    repo_dir = Path(args.repo_dir).resolve()
    if not (repo_dir / ".git").exists():
        fail(f"Not a git repo: {repo_dir}")
    try:
        print(commit_files(repo_dir, args.branch, args.message, args.paths, args.repo, dry_check=args.check))
        return 0
    except SystemExit:
        raise
    except Exception as exc:
        fail(f"Unhandled error: {type(exc).__name__}: {exc}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
