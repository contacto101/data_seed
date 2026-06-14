#!/usr/bin/env python3
"""Generate a safe multi-branch Graphify graph for the DataSeed repo.

The normal `graphify update .` command only sees the currently checked-out
working tree. This script builds a temporary corpus from all remote branches via
`git archive`, runs Graphify there, then replaces the repo's `graphify-out/`
with the generated multi-branch graph.

Safety defaults:
- Does not checkout or mutate branches.
- Does not delete source repo files.
- Excludes runtime/generated folders and sensitive file patterns.
- Deletes only its own unique temp corpus after a successful run.
"""
from __future__ import annotations

import argparse
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
from pathlib import Path, PurePosixPath
from typing import Iterable

DEFAULT_REPO = Path(os.environ.get("DATASEED_TASK_TRACKING_REPO_DIR", "/opt/data/data_seed"))
DEFAULT_REMOTE = "origin"
GRAPHIFY_CANDIDATES = [
    "/opt/data/home/.local/share/uv/tools/graphifyy/bin/graphify",
    "/opt/data/home/.local/bin/graphify",
    "graphify",
]

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

RUNTIME_DIRS = {
    ".git",
    "graphify-out",
    "node_modules",
    "__pycache__",
    ".cache",
    "cache",
    ".venv",
    "venv",
    "dist",
    "build",
}
SENSITIVE_FILENAMES = {
    "credentials.json",
    "token.json",
    "secrets.json",
    "secret.json",
    "service-account.json",
    "service_account.json",
}
SENSITIVE_SUFFIXES = (".pem", ".key", ".p12", ".pfx", ".sqlite", ".sqlite3", ".db", ".dump")


def run_text(cmd: list[str], cwd: Path, *, check: bool = True, timeout: int = 300) -> subprocess.CompletedProcess[str]:
    proc = subprocess.run(cmd, cwd=str(cwd), text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout)
    if check and proc.returncode != 0:
        raise RuntimeError(f"Command failed ({proc.returncode}): {' '.join(cmd)}\n{proc.stdout}{proc.stderr}")
    return proc


def run_bytes(cmd: list[str], cwd: Path, *, check: bool = True, timeout: int = 300) -> subprocess.CompletedProcess[bytes]:
    proc = subprocess.run(cmd, cwd=str(cwd), stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout)
    if check and proc.returncode != 0:
        out = proc.stdout.decode(errors="replace") + proc.stderr.decode(errors="replace")
        raise RuntimeError(f"Command failed ({proc.returncode}): {' '.join(cmd)}\n{out}")
    return proc


def resolve_graphify(explicit: str | None) -> str:
    candidates = [explicit] if explicit else [os.environ.get("GRAPHIFY_BIN"), *GRAPHIFY_CANDIDATES]
    for candidate in candidates:
        if not candidate:
            continue
        path = shutil.which(candidate) if "/" not in candidate else candidate
        if path and Path(path).exists():
            return path
    raise RuntimeError("Graphify binary not found. Set GRAPHIFY_BIN or install graphifyy.")


def is_excluded(path: str) -> bool:
    posix = path.replace("\\", "/")
    parts = posix.split("/")
    base = parts[-1]
    lower = posix.lower()
    if any(part in RUNTIME_DIRS for part in parts):
        return True
    if base == ".env":
        return True
    if base.startswith(".env.") and not base.endswith((".example", ".sample", ".template")):
        return True
    if base.lower() in SENSITIVE_FILENAMES:
        return True
    if lower.endswith(SENSITIVE_SUFFIXES):
        return True
    return False


def assert_safe_member(name: str) -> PurePosixPath | None:
    pure = PurePosixPath(name)
    if name.startswith("/") or ".." in pure.parts:
        return None
    return pure


def remote_branches(repo: Path, remote: str) -> list[str]:
    prefix = f"refs/remotes/{remote}/"
    refs = run_text(["git", "for-each-ref", f"refs/remotes/{remote}", "--format=%(refname)"], cwd=repo).stdout.splitlines()
    branches: list[str] = []
    for ref in refs:
        if not ref.startswith(prefix):
            continue
        branch = ref[len(prefix):]
        if branch and branch != "HEAD":
            branches.append(branch)
    return sorted(set(branches))


def export_branch(repo: Path, remote: str, branch: str, dest: Path) -> dict[str, object]:
    commit = run_text(["git", "rev-parse", "--short", f"{remote}/{branch}"], cwd=repo).stdout.strip()
    tracked_files = run_text(["git", "ls-tree", "-r", "--name-only", f"{remote}/{branch}"], cwd=repo).stdout.splitlines()
    archive = run_bytes(["git", "archive", "--format=tar", f"{remote}/{branch}"], cwd=repo, timeout=180)

    included: list[str] = []
    excluded: list[tuple[str, str]] = []
    dest.mkdir(parents=True, exist_ok=True)
    with tarfile.open(fileobj=io.BytesIO(archive.stdout), mode="r:") as tf:
        for member in tf.getmembers():
            pure = assert_safe_member(member.name)
            if pure is None:
                excluded.append((member.name, "unsafe_path"))
                continue
            if is_excluded(member.name):
                excluded.append((member.name, "sensitive_or_runtime"))
                continue
            target = dest / Path(*pure.parts)
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
            elif member.isfile():
                target.parent.mkdir(parents=True, exist_ok=True)
                src = tf.extractfile(member)
                target.write_bytes(src.read() if src else b"")
                included.append(member.name)
            else:
                excluded.append((member.name, "non_regular_file"))

    branch_md = [
        f"# Branch: {branch}",
        "",
        f"Remote ref: {remote}/{branch}",
        f"Commit: {commit}",
        "",
        "Generated only for the temporary multi-branch Graphify corpus. This file makes the branch visible as a graph node.",
        "",
        "Included tracked files:",
        *[f"- {name}" for name in sorted(included)],
    ]
    if excluded:
        branch_md.extend(["", "Excluded by safety filter:", *[f"- {name} ({reason})" for name, reason in excluded]])
    (dest / "BRANCH.md").write_text("\n".join(branch_md) + "\n", encoding="utf-8")

    return {
        "commit": commit,
        "files_total": len(tracked_files),
        "files_included": len(included),
        "excluded": excluded,
    }


def assert_no_secrets_in_outputs(paths: Iterable[Path]) -> None:
    for path in paths:
        if not path.exists() or not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for pattern in SECRET_VALUE_PATTERNS:
            if pattern.search(text):
                raise RuntimeError(f"Refusing to copy {path.name}: secret-like value detected by {pattern.pattern}")


def safe_replace_graphify_out(repo: Path, source_graph_dir: Path) -> None:
    repo = repo.resolve()
    graph_dir = (repo / "graphify-out").resolve()
    if graph_dir.name != "graphify-out" or graph_dir.parent != repo:
        raise RuntimeError(f"Unsafe graph output path: {graph_dir}")
    if graph_dir.exists():
        shutil.rmtree(graph_dir)
    shutil.copytree(source_graph_dir, graph_dir)


def write_metadata(root: Path, repo: Path, remote: str, branch_info: dict[str, object]) -> None:
    readme = f"""# DataSeed multi-branch Graphify snapshot

Generated: {time.strftime('%Y-%m-%d %H:%M:%S %z')}
Source repo: {repo}
Remote: {remote}

This corpus was generated from all remote branches under `{remote}/*`.
Each branch is under `branches/<branch-name>/` and includes a generated `BRANCH.md` metadata file so branch names appear in Graphify.

Safety: no source files were deleted. Extraction used `git archive` into a unique temporary folder. Runtime/generated folders and sensitive file patterns such as real `.env` files, private keys, token files, credentials files, sqlite/db files, `node_modules`, `graphify-out` and caches were skipped.
"""
    (root / "README.md").write_text(readme, encoding="utf-8")
    (root / "snapshot_manifest.json").write_text(
        json.dumps({"repo": str(repo), "remote": remote, "branches": branch_info}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Update DataSeed Graphify graph as a safe multi-branch graph.")
    parser.add_argument("--repo", default=str(DEFAULT_REPO), help="Repo path (default: parent of this script)")
    parser.add_argument("--remote", default=DEFAULT_REMOTE, help="Remote name to scan (default: origin)")
    parser.add_argument("--graphify", default=None, help="Path to graphify binary")
    parser.add_argument("--skip-fetch", action="store_true", help="Do not fetch the remote before scanning refs")
    parser.add_argument("--keep-temp", action="store_true", help="Keep temporary corpus for debugging")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if not (repo / ".git").is_dir():
        raise RuntimeError(f"Not a git repo: {repo}")
    graphify = resolve_graphify(args.graphify)

    if not args.skip_fetch:
        run_text(["git", "fetch", args.remote], cwd=repo, timeout=180)

    branches = remote_branches(repo, args.remote)
    if not branches:
        raise RuntimeError(f"No remote branches found under {args.remote}/*")

    temp_root = Path(tempfile.mkdtemp(prefix="dataseed-multibranch-snapshot-", dir="/tmp"))
    try:
        branches_root = temp_root / "branches"
        branches_root.mkdir(parents=True, exist_ok=True)
        branch_info: dict[str, object] = {}
        for branch in branches:
            branch_info[branch] = export_branch(repo, args.remote, branch, branches_root / branch)
        write_metadata(temp_root, repo, args.remote, branch_info)

        graphify_proc = run_text([graphify, "update", ".", "--force"], cwd=temp_root, check=False, timeout=600)
        if graphify_proc.returncode != 0:
            raise RuntimeError(f"Graphify failed ({graphify_proc.returncode})\n{graphify_proc.stdout}{graphify_proc.stderr}")

        graph_dir = temp_root / "graphify-out"
        graph_json = graph_dir / "graph.json"
        graph_html = graph_dir / "graph.html"
        graph_report = graph_dir / "GRAPH_REPORT.md"
        graph_manifest = graph_dir / "manifest.json"
        required = [graph_json, graph_html, graph_report, graph_manifest]
        missing = [str(path) for path in required if not path.exists()]
        if missing:
            raise RuntimeError("Graphify did not produce required files: " + ", ".join(missing))

        graph_text = graph_json.read_text(encoding="utf-8", errors="ignore")
        missing_branches = [branch for branch in branches if branch not in graph_text]
        if missing_branches:
            raise RuntimeError("Generated graph is missing branch names: " + ", ".join(missing_branches))

        assert_no_secrets_in_outputs([graph_json, graph_html, graph_report, graph_manifest])
        graph_data = json.loads(graph_text)

        # Preserve generation metadata inside graphify-out for humans and backups.
        multibranch_manifest = graph_dir / "multibranch_manifest.json"
        multibranch_manifest.write_text(
            json.dumps(
                {
                    "generated_at": time.strftime("%Y-%m-%d %H:%M:%S %z"),
                    "repo": str(repo),
                    "remote": args.remote,
                    "branches": branches,
                    "branch_info": branch_info,
                    "nodes": len(graph_data.get("nodes", [])),
                    "links": len(graph_data.get("links", [])),
                    "communities": len({n.get("community") for n in graph_data.get("nodes", []) if "community" in n}),
                    "safety_filter": {
                        "runtime_dirs": sorted(RUNTIME_DIRS),
                        "sensitive_filenames": sorted(SENSITIVE_FILENAMES),
                        "sensitive_suffixes": list(SENSITIVE_SUFFIXES),
                    },
                },
                indent=2,
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        (graph_dir / "MULTIBRANCH_README.md").write_text((temp_root / "README.md").read_text(encoding="utf-8"), encoding="utf-8")
        assert_no_secrets_in_outputs([multibranch_manifest, graph_dir / "MULTIBRANCH_README.md"])

        safe_replace_graphify_out(repo, graph_dir)

        summary = {
            "status": "ok",
            "repo_graphify_out": str(repo / "graphify-out"),
            "branches": branches,
            "nodes": len(graph_data.get("nodes", [])),
            "links": len(graph_data.get("links", [])),
            "communities": len({n.get("community") for n in graph_data.get("nodes", []) if "community" in n}),
            "temp_dir": str(temp_root),
            "temp_deleted": not args.keep_temp,
            "graphify_stdout_tail": graphify_proc.stdout[-1200:],
        }
        print(json.dumps(summary, indent=2, ensure_ascii=False))
        return 0
    finally:
        if not args.keep_temp and temp_root.exists():
            shutil.rmtree(temp_root)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"update-multibranch-graph ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
