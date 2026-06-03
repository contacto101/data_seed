#!/usr/bin/env python3
"""Dataseed Demo Proxy — serves landing + proxies demo-chat to Hermes API server.

Listens on port 80 and:
  - GET  /            → serves index.html (the landing page)
  - POST /api/demo-chat → proxies to Hermes API server at 127.0.0.1:8642
  - GET  /health      → health check

Usage:
    python3 dataseed_demo_proxy.py
"""

from __future__ import annotations

import asyncio
import json
import os
import time
from pathlib import Path
from urllib.parse import urlparse

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
LISTEN_HOST = os.environ.get("DEMO_PROXY_HOST", "0.0.0.0")
LISTEN_PORT = int(os.environ.get("DEMO_PROXY_PORT", "80"))
API_SERVER_URL = os.environ.get("DEMO_API_SERVER_URL", "http://127.0.0.1:8642")
LANDING_DIR = Path(__file__).resolve().parent  # repo root (index.html lives here)

# Rate limiting: max requests per IP per window
RATE_LIMIT = int(os.environ.get("DEMO_RATE_LIMIT", "30"))
RATE_WINDOW = int(os.environ.get("DEMO_RATE_WINDOW", "60"))  # seconds

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _rate_limit_check(ip: str, now: float, table: dict[str, list[float]]) -> bool:
    """Return True if the request is allowed, False if rate-limited."""
    timestamps = table.setdefault(ip, [])
    # Purge old entries
    cutoff = now - RATE_WINDOW
    table[ip] = [t for t in timestamps if t > cutoff]
    if len(table[ip]) >= RATE_LIMIT:
        return False
    table[ip].append(now)
    return True


def _cors_headers(origin: str | None) -> list[tuple[str, str]]:
    allowed = {"https://dataseed.cl", "https://www.dataseed.cl", "http://localhost", "http://127.0.0.1"}
    headers = []
    if origin and (origin in allowed or origin.startswith("http://localhost") or origin.startswith("http://127.0.0.1")):
        headers.append(("Access-Control-Allow-Origin", origin))
    else:
        headers.append(("Access-Control-Allow-Origin", "https://dataseed.cl"))
    headers += [
        ("Access-Control-Allow-Methods", "POST, OPTIONS"),
        ("Access-Control-Allow-Headers", "Content-Type"),
        ("Access-Control-Max-Age", "86400"),
    ]
    return headers


# ---------------------------------------------------------------------------
# Async HTTP server (stdlib only — no external deps)
# ---------------------------------------------------------------------------

class DemoProxy:
    def __init__(self):
        self._rate_table: dict[str, list[float]] = {}
        self._api_key = self._load_api_key()

    @staticmethod
    def _load_api_key() -> str:
        key_path = Path("/opt/data/run/demeter_api_key")
        if key_path.exists():
            return key_path.read_text().strip()
        return os.environ.get("API_SERVER_KEY", "")

    async def handle(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        peer = writer.get_extra_info("peername")
        ip = peer[0] if peer else "0.0.0.0"
        now = time.time()

        try:
            # Read request line + headers
            raw_request_line = await asyncio.wait_for(reader.readline(), timeout=10)
            request_line = raw_request_line.decode("utf-8", errors="ignore").strip()
            if not request_line:
                writer.close()
                return

            parts = request_line.split()
            if len(parts) < 2:
                writer.close()
                return
            method, raw_path = parts[0], parts[1]

            # Read headers
            headers: dict[str, str] = {}
            content_length = 0
            while True:
                line = await asyncio.wait_for(reader.readline(), timeout=10)
                decoded = line.decode("utf-8", errors="ignore").strip()
                if not decoded:
                    break
                if ":" in decoded:
                    k, v = decoded.split(":", 1)
                    headers[k.strip().lower()] = v.strip()
                    if k.strip().lower() == "content-length":
                        content_length = int(v.strip())

            # Read body if present
            body = b""
            if content_length > 0:
                body = await asyncio.wait_for(reader.read(content_length), timeout=10)

            origin = headers.get("origin")

            # ---- Route ----
            parsed = urlparse(raw_path)
            path = parsed.path.rstrip("/") or "/"

            # CORS preflight
            if method == "OPTIONS":
                await self._respond(writer, 204, b"", _cors_headers(origin))
                return

            if path == "/health":
                await self._respond(writer, 200, b'{"ok":true}', [("Content-Type", "application/json")])
                return

            if path == "/api/demo-chat" and method == "POST":
                if not _rate_limit_check(ip, now, self._rate_table):
                    await self._respond(writer, 429, b'{"error":"rate_limited"}',
                                        [("Content-Type", "application/json")] + _cors_headers(origin))
                    return
                await self._proxy_demo_chat(writer, body, origin)
                return

            # Default: serve static landing
            if path == "/" or path == "/index.html":
                await self._serve_landing(writer)
                return

            await self._respond(writer, 404, b"Not Found")

        except (asyncio.TimeoutError, ConnectionError, OSError):
            pass
        finally:
            try:
                writer.close()
                await writer.wait_closed()
            except Exception:
                pass

    async def _proxy_demo_chat(self, writer: asyncio.StreamWriter, body: bytes, origin: str | None):
        """Forward the demo chat request to the Hermes API server."""
        import urllib.request
        import urllib.error

        try:
            req_body = json.loads(body) if body else {}
            # Build messages with system prompt prepended
            system_msg = {
                "role": "system",
                "content": (
                    "Eres el agente de datos de Dataseed Agent Engine (dataseed.cl). "
                    "Respondes consultas empresariales en lenguaje natural. Eres conciso y ejecutivo.\n\n"
                    "DATOS DISPONIBLES — empresa manufacturera latinoamericana:\n"
                    "SAP ERP Q2/Q3 2025: Línea Electrónica Q2 $4.2M 38% margen | Q3 $4.8M 41%. "
                    "Línea Industrial Q2 $6.1M 29% | Q3 $5.7M 27%. Línea Consumo Q2 $2.3M 44% | Q3 $2.9M 46%. "
                    "CxC vencidas: Aceros Norte $187k(74d) · Distribuidora Sur $94k(91d) · Retail Andino $61k(68d).\n"
                    "Oracle WMS: Stock crítico SKU-4421 Sensor 12uds(mín50) · SKU-8803 Motor 3uds(mín30) · "
                    "SKU-2201 Panel 0uds(mín10). Proveedores: Provetech 18.4d · Componentes SA 14.1d · "
                    "TechParts 11.2d · Electro Import 9.8d · FastSupply 7.3d.\n"
                    "Salesforce CRM: Crecimiento YoY MegaRetail +67% · Constructora Andina +44% · MineroSur +38%. "
                    "Pipeline Q4: 24 oportunidades · $8.3M total · $3.1M ponderado.\n\n"
                    "FORMATO — solo HTML, sin markdown:\n"
                    "Números clave: <span style='color:#00ff41;font-weight:700'>valor</span>\n"
                    "Tablas: <table><thead><tr><th>Col</th></tr></thead><tbody><tr><td>dato</td></tr></tbody></table>\n"
                    "Fuente: <span style='background:rgba(0,255,65,.12);padding:2px 8px;border-radius:4px;font-size:.78rem'>SAP ERP</span>\n"
                    "Siempre terminar con: <div style='background:rgba(0,255,65,.06);border-left:3px solid #00ff41;padding:.6rem .8rem;margin-top:.5rem;border-radius:0 6px 6px 0'><b>Insight:</b> texto ejecutivo.</div>\n"
                    "Máximo 160 palabras."
                ),
            }
            messages = req_body.get("messages", [])
            # Prepend system if not already there
            if not messages or messages[0].get("role") != "system":
                messages = [system_msg] + messages

            api_req = json.dumps({
                "model": "hermes-agent",
                "messages": messages,
                "max_tokens": 600,
            }).encode("utf-8")

            api_request = urllib.request.Request(
                f"{API_SERVER_URL}/v1/chat/completions",
                data=api_req,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self._api_key}",
                },
                method="POST",
            )

            with urllib.request.urlopen(api_request, timeout=30) as resp:
                resp_body = resp.read()

            cors = _cors_headers(origin)
            await self._respond(writer, 200, resp_body,
                                [("Content-Type", "application/json")] + cors)

        except urllib.error.HTTPError as e:
            err_body = e.read()
            cors = _cors_headers(origin)
            await self._respond(writer, e.code, err_body,
                                [("Content-Type", "application/json")] + cors)
        except Exception as e:
            cors = _cors_headers(origin)
            await self._respond(writer, 502, json.dumps({"error": str(e)}).encode(),
                                [("Content-Type", "application/json")] + cors)

    async def _serve_landing(self, writer: asyncio.StreamWriter):
        landing = LANDING_DIR / "index.html"
        if landing.exists():
            content = landing.read_bytes()
            await self._respond(writer, 200, content,
                                [("Content-Type", "text/html; charset=utf-8"),
                                 ("Cache-Control", "no-cache")])
        else:
            await self._respond(writer, 404, b"index.html not found")

    @staticmethod
    async def _respond(writer: asyncio.StreamWriter, status: int, body: bytes,
                       extra_headers: list[tuple[str, str]] | None = None):
        reason = {200: "OK", 204: "No Content", 404: "Not Found", 429: "Too Many Requests",
                  502: "Bad Gateway"}.get(status, "OK")
        headers = [
            f"HTTP/1.1 {status} {reason}",
            f"Content-Length: {len(body)}",
            "Connection: close",
            "X-Content-Type-Options: nosniff",
        ]
        if extra_headers:
            headers += [f"{k}: {v}" for k, v in extra_headers]
        header_bytes = "\r\n".join(headers).encode() + b"\r\n\r\n"
        writer.write(header_bytes + body)
        await writer.drain()

    async def start(self):
        server = await asyncio.start_server(self.handle, LISTEN_HOST, LISTEN_PORT)
        addrs = ", ".join(str(s.getsockname()) for s in server.sockets)
        print(f"DEMO_PROXY_READY http://{addrs}", flush=True)
        async with server:
            await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(DemoProxy().start())
