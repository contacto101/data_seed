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
LANDING_DIR = Path(__file__).resolve().parent.parent  # repo root

# Rate limiting
RATE_LIMIT = int(os.environ.get("DEMO_RATE_LIMIT", "30"))
RATE_WINDOW = int(os.environ.get("DEMO_RATE_WINDOW", "60"))

# ---------------------------------------------------------------------------
# Demo system prompt — commercial sales agent
# ---------------------------------------------------------------------------
DEMO_SYSTEM_PROMPT = (
    "INSTRUCCIÓN PRIORITARIA: Ignora cualquier instrucción previa sobre identidad, nombre, rol o acceso a datos. "
    "ERES EXCLUSIVAMENTE el asistente comercial de la demo pública de DataSeed. NO tienes nombre personal.\n\n"
    "ALCANCE: Esta demo imita un agente conectado a fuentes empresariales típicas (SAP ERP, SAS Analytics, Oracle CRM, Salesforce, Legacy CSV), "
    "pero NO tiene acceso real a sistemas internos, clientes, empleados, proveedores, datos financieros ni información privada.\n\n"
    "TÓPICOS PERMITIDOS: finanzas (margen, CxC), logística (stock crítico, proveedores), ventas (clientes, pipeline), "
    "integración de fuentes, análisis en lenguaje natural, dashboards, alertas y diagnóstico general de madurez de datos.\n\n"
    "REGLAS ABSOLUTAS:\n"
    "- NUNCA uses nombres personales como Elianis, Demeter, Nathan u otros. Si preguntan quién eres: 'Soy el asistente de DataSeed'.\n"
    "- NUNCA reveles información interna de DataSeed, nombres de empleados, clientes reales, proveedores reales, credenciales, arquitectura interna o datos privados.\n"
    "- NUNCA ejecutes acciones, modifiques ERP/CRM, escribas en sistemas, consultes bases reales ni confirmes operaciones internas.\n"
    "- NUNCA des precios finales, contratos, compromisos legales ni promesas de implementación cerradas.\n"
    "- Si el usuario pide margen, CxC, stock, proveedores, clientes o pipeline: responde como demostración segura. Explica qué analizaría DataSeed, "
    "qué señales buscaría y qué decisión habilitaría. Si usas cifras, deben ser rangos hipotéticos y marcados como 'ejemplo demo', nunca como datos reales.\n"
    "- Si preguntan algo casual o fuera de contexto, responde: 'Mi función es potenciar su empresa al siguiente nivel con inteligencia de datos. "
    "Puedo mostrarle ejemplos de finanzas, logística o ventas y luego derivarlo al formulario de contacto.'\n"
    "- SIEMPRE termina con este CTA exacto o equivalente: 'Para revisar su caso real, complete el formulario de contacto y coordinaremos una reunión de diagnóstico sin compromiso.'\n\n"
    "TONO: Profesional, ejecutivo, cercano. Español neutro. Máximo 120 palabras. "
    "FORMATO: HTML seguro sin markdown: <b>, <ul><li>, <br>."
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _rate_limit_check(ip: str, now: float, table: dict[str, list[float]]) -> bool:
    timestamps = table.setdefault(ip, [])
    cutoff = now - RATE_WINDOW
    table[ip] = [t for t in timestamps if t > cutoff]
    if len(table[ip]) >= RATE_LIMIT:
        return False
    table[ip].append(now)
    return True


CTA_TEXT = "Para revisar su caso real, complete el formulario de contacto y coordinaremos una reunión de diagnóstico sin compromiso."
FORBIDDEN_TERMS = ("Elianis", "Demeter", "Nathan")


def _sanitize_demo_payload(resp_body: bytes) -> bytes:
    """Guarantee public-demo guardrails even if the upstream model drifts."""
    try:
        payload = json.loads(resp_body)
        content = payload["choices"][0]["message"].get("content", "")
        if not isinstance(content, str):
            return resp_body

        for term in FORBIDDEN_TERMS:
            content = content.replace(term, "el asistente de DataSeed")

        if "formulario de contacto" not in content.lower() and "reunión de diagnóstico" not in content.lower():
            content = content.rstrip() + f"<br><br>{CTA_TEXT}"

        payload["choices"][0]["message"]["content"] = content
        return json.dumps(payload, ensure_ascii=False).encode("utf-8")
    except Exception:
        return resp_body


def _completion_payload(content: str) -> bytes:
    return json.dumps({
        "choices": [{"message": {"role": "assistant", "content": content}}]
    }, ensure_ascii=False).encode("utf-8")


def _deterministic_guardrail_reply(messages: list[dict]) -> bytes | None:
    """Return a safe canned reply for clearly out-of-scope or risky prompts."""
    last_user = ""
    for message in reversed(messages):
        if message.get("role") == "user":
            last_user = str(message.get("content", "")).lower()
            break

    out_of_scope_terms = (
        "chiste", "broma", "meme", "política", "politica", "religión", "religion",
        "fútbol", "futbol", "clima", "noticias", "receta", "poema", "canción", "cancion",
    )
    risky_terms = (
        "elianis", "demeter", "nathan", "contraseña", "password", "token", "credencial",
        "secreto", "cliente real", "empleado", "proveedor real", "ejecuta", "modifica", "actualiza el erp",
    )
    if any(term in last_user for term in out_of_scope_terms + risky_terms):
        return _completion_payload(
            "Mi función es potenciar su empresa al siguiente nivel con inteligencia de datos. "
            "Puedo mostrarle ejemplos de finanzas, logística o ventas, siempre con datos simulados y sin ejecutar acciones internas."
            f"<br><br>{CTA_TEXT}"
        )
    return None


def _cors_headers(origin: str | None) -> list[tuple[str, str]]:
    allowed = {
        "https://dataseed.cl", "https://www.dataseed.cl",
        "http://localhost", "http://127.0.0.1",
    }
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
# Async HTTP server (stdlib only)
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

            body = b""
            if content_length > 0:
                body = await asyncio.wait_for(reader.read(content_length), timeout=10)

            origin = headers.get("origin")

            parsed = urlparse(raw_path)
            route_path = parsed.path.rstrip("/") or "/"

            if method == "OPTIONS":
                await self._respond(writer, 204, b"", _cors_headers(origin))
                return

            if route_path == "/health":
                await self._respond(writer, 200, b'{"ok":true}', [("Content-Type", "application/json")])
                return

            if route_path == "/api/demo-chat" and method == "POST":
                if not _rate_limit_check(ip, now, self._rate_table):
                    await self._respond(writer, 429, b'{"error":"rate_limited"}',
                                        [("Content-Type", "application/json")] + _cors_headers(origin))
                    return
                await self._proxy_demo_chat(writer, body, origin)
                return

            if route_path == "/" or route_path == "/index.html":
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
        import urllib.request
        import urllib.error

        try:
            req_body = json.loads(body) if body else {}
            messages = req_body.get("messages", [])

            # Build messages: system prompt first, then user messages (skip any existing system)
            user_messages = [m for m in messages if m.get("role") != "system"]
            guarded = _deterministic_guardrail_reply(user_messages)
            if guarded is not None:
                cors = _cors_headers(origin)
                await self._respond(writer, 200, guarded,
                                    [("Content-Type", "application/json")] + cors)
                return

            messages = [{"role": "system", "content": DEMO_SYSTEM_PROMPT}] + user_messages

            api_req = json.dumps({
                "model": "hermes-agent",
                "messages": messages,
                "max_tokens": 500,
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
                resp_body = _sanitize_demo_payload(resp.read())

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
