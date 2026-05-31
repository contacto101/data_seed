Checkpoint de contexto crítico

Estado actual:
- Objetivo: Consolidar el trabajo de conexión HubSpot/DataSeed antes de iniciar una sesión nueva con `/new`.
- Usuario pidió: “ok consolida y ejecuta comando para /new”.

Decisiones tomadas:
- HubSpot se trata como dos capas: MCP oficial para compatibilidad futura + adaptador propio DataSeed para control fino.
- Guardrails por fases: fase 1 lectura; fase 2 crear notas/tareas/contactos; fase 3 actualizar deals; fase 4 workflows/automatizaciones; fase 5 control amplio con logs/aprobaciones.
- Responder a Daniel en WhatsApp muy corto, directo y sin omitir lo relevante.

Archivos tocados/leídos:
- `/opt/data/scripts/hubspot_oauth_bridge.py`: bridge OAuth temporal usado para callback.
- `/opt/data/hubspot-oauth/tokens.json`: tokens OAuth HubSpot guardados seguro; NO imprimir contenido.
- `/opt/data/hubspot-oauth/pkce.json`: PKCE usado para OAuth; NO imprimir contenido.
- `/opt/data/hubspot-oauth/last_callback.json`: callback OAuth recibido; contiene code histórico, no imprimir.
- `/opt/data/scripts/dataseed_hubspot_adapter.py`: adaptador propio DataSeed implementado.
- `/opt/data/hubspot-oauth/dataseed_adapter_audit.jsonl`: auditoría local del adaptador.
- `/opt/data/skills/productivity/dataseed-hubspot-control-plan/SKILL.md`: actualizado con estado implementado del adaptador.

Comandos ejecutados y resultados:
- OAuth HubSpot con PKCE completado correctamente.
- Token exchange OK; refresh token guardado.
- Verificación API HubSpot OK contra Hub ID `40198216`.
- Lectura verificada: contacts OK, companies OK, deals OK, tickets OK, tasks OK, notes OK.
- Escritura verificada: task “Demeter task - prueba de conexión”, ID `110403389750`, estado `NOT_STARTED`.
- Adaptador propio creado y compilado: `/opt/hermes/.venv/bin/python -m py_compile /opt/data/scripts/dataseed_hubspot_adapter.py` OK.
- Adaptador `health` OK: `{"ok": true, "hub_id": 40198216, "scopes_count": 43}`.
- Adaptador `summary` OK para contacts/companies/deals/tickets/tasks/notes.
- Adaptador creó task “Demeter task - adaptador DataSeed inicializado”, ID `110399701896`, estado `NOT_STARTED`, prioridad `LOW`.

Configuración o valores relevantes:
- HubSpot Client ID conocido: `14c3fe0e-79d4-4c5f-b9d5-c416011364ca`.
- La credencial privada de HubSpot existe en env seguro; no imprimir ni pedir por WhatsApp.
- Tokens/credenciales deben permanecer en `/opt/data/hubspot-oauth/` o env seguro.
- El quick tunnel Cloudflare era temporal; no usarlo para producción.
- Callback productivo futuro recomendado: `https://demeter.dataseed.cl/oauth/hubspot/callback`.

Errores/bloqueos pendientes:
- HubSpot exigió PKCE; el primer authorize URL falló por `code challenge parameter is missing`. Ya resuelto generando los valores PKCE S256 y `state`.
- Producción aún pendiente: DNS/reverse proxy/callback HTTPS estable para `demeter.dataseed.cl`.
- Adaptador propio todavía no está expuesto como MCP propio ni API HTTP; existe como script CLI seguro.
- No se ha implementado todavía: propiedades custom, workflows/reporting avanzado, operaciones masivas con aprobaciones.

Próximos pasos:
- Si se continúa HubSpot: convertir el script CLI en servicio/API o MCP propio DataSeed.
- Añadir comandos controlados para notes/contactos y luego updates de deals con aprobación.
- Implementar logs más estructurados y política de approvals para fase 3+.
- Preparar callback productivo estable en `demeter.dataseed.cl`.

No olvidar:
- No exponer secretos, access tokens, refresh tokens, client secret ni callback code.
- Daniel prefiere respuestas cortas.
- Distinguir docs/roadmap de software realmente implementado.
- HubSpot debe mapear trabajo real de Demeter a tasks, notes, deals, tickets, contactos/empresas y workflows.

Ya resuelto / no repetir:
- No repetir OAuth desde cero salvo que los tokens fallen.
- No volver a usar authorize URL sin PKCE.
- No depender del quick tunnel como producción.
- Adaptador CLI inicial ya existe y fue probado contra HubSpot real.
