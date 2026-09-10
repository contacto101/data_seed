# Task Log - Demeter

> **Archivo volátil**: Se reinicia automáticamente cada 24 horas a las 05:00 AM (hora Chile, America/Santiago).
> No editar manualmente fuera del flujo automático.

---

<!-- ENTRADAS -->

## 2026-09-10 16:19 -03 (America/Santiago)
- **Solicitud:** Daniel: "revisá tu conexión reciente a Apollo".
- **Resultado:** Conexión Apollo verificada end-to-end: `/auth/health` → `{"healthy":true,"is_logged_in":true}` (HTTP 200, key del Vault inyectada OK); prueba de lectura real `POST /mixed_people/api_search` (0 créditos) → 3 resultados CFO Chile, 1267 totales. Actividad reciente en logs: pruebas de visibilidad de skills vía api_server (2026-09-10 18:45-18:47 UTC; sesiones api-*, modelo gpt-5.6-terra, sin tool calls a Apollo). Hallazgo: la skill `apollo-prospecting` vive en `/opt/data/skills/` (perfil default/api_server) y NO es visible desde el perfil WhatsApp `daniel` (skills_list solo muestra b2b-sales-outreach y saas-product-packaging-chile).
- **Estado:** completada.
- **Verificación:** HTTP 200 reales contra api.apollo.io desde este entorno; skills_list del perfil daniel; grep de agent.log/gateway.log (sin llamadas previas a Apollo desde WhatsApp).
- **Pendientes:** si Daniel quiere usar Apollo-prospecting desde WhatsApp, sincronizar la skill a `profiles/daniel/skills/` (y demás perfiles con OK). Reportado.
