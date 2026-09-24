# Task Log - Demeter

> **Archivo volátil**: Se reinicia automáticamente cada 24 horas a las 05:00 AM (hora Chile, America/Santiago).
> No editar manualmente fuera del flujo automático.

---

<!-- ENTRADAS -->

## 2026-09-24 02:05 -03 (America/Santiago)
- **Solicitud:** Daniel: confirmar qué datos trae el enriquecimiento de PERSONA en Apollo (¿correo y teléfono?).
- **Resultado:** Prueba ejecutada (`people/match`, 1 persona de la lista): devuelve perfil completo — nombre sin ofuscar, headline, LinkedIn/Twitter/foto, historial laboral (8 cargos), seniority, timezone — y **el `email` cuando ya está revelado para el equipo** (`revealed_for_current_team: true`, sin costo nuevo de revelado). Teléfono de persona sigue fuera de alcance (requiere webhook). Aprendizaje documentado en la skill `apollo-prospecting` (punto 6) y propagado a los 10 perfiles (hash 95d5de472cc24592). Sin volcado de correos a archivos (excluidos del JSON de trabajo por regla de PII).
- **Estado:** completada.
- **Verificación:** respuesta real de /people/match (match_confidence=high; email presente 24 chars; bandera revealed_for_current_team); sha256 idéntico del skill en origen + 10 ubicaciones.
- **Pendientes:** definir con Daniel el siguiente paso: export de prospectos con correos disponibles/ya revelados, estimación de créditos para revelar más, o enriquecimiento de empresas (1 crédito c/u).

## 2026-09-24 00:55 -03 (America/Santiago)
- **Solicitud:** Daniel: búsqueda por EMPRESA para saber cuántas se ajustan al ICP completo (Apollo).
- **Resultado:** Embudo de empresas ejecutado (2 requests, 2 créditos): A) Chile + 51-500 empleados → **5.883** empresas; B) + industrias ICP (distribución, importación, logística, transporte, retail, e-commerce, manufactura, mayorista) → **2.699** empresas (108 páginas de 25). Export de trabajo: `ICP_DataSeed_Apollo_empresas_p1.csv` (página 1). Nota: la respuesta de búsqueda de empresas llega en modo parcial (campos industry/employees vacíos por plan; el filtro sí aplica — los totales cambian).
- **Estado:** completada.
- **Verificación:** pagination.total_entries = 5883 (A) y 2699 (B) vía /mixed_companies/search; CSV con 8 filas (página 1); JSON en tmp.
- **Pendientes:** opciones abiertas (con costo, requieren OK): desglose por segmento ICP (~1 crédito por segmento), exportar más páginas de las 2.699 (1 crédito/página), enriquecer empresas (1 crédito c/u, estimar antes). Sin gastos adicionales sin autorización.

## 2026-09-24 00:35 -03 (America/Santiago)
- **Solicitud:** Daniel envía el documento "ICP Ideal Dataseed" (PDF) para prospección con Apollo.
- **Resultado:** ICP traducido a filtros Apollo y primera búsqueda ejecutada: 10 títulos compradores (GG, Finanzas, Operaciones, CIO/CTO, TI, BI, Control de Gestión) + Chile → 35.441 personas; añadiendo tamaño ICP (51-500 empleados) → 8.150 personas. Nombres ofuscados por Apollo (sin PII en claro), flags has_email incluidos. Export de trabajo: `ICP_DataSeed_Apollo_p1.csv` (25 filas, página 1). Costo: 0 créditos (mixed_people/api_search).
- **Estado:** completada. (siguientes fases de pago ⏳ a la espera de elección de Daniel)
- **Verificación:** HTTP 200 con total_entries 35441 y 8150; CSV generado con 25 filas; conexión Apollo ya verificada (health + búsquedas).
- **Pendientes:** definir siguiente paso: búsqueda de empresas (1 crédito/página) o enriquecimiento (1 crédito/empresa, estimar antes); refinamiento por segmentos ICP (distribución/logística/retail/manufactura/servicios B2B) disponible gratis; emails/teléfonos requieren reveal (créditos, solo con pedido explícito de Daniel).

## 2026-09-23 08:25 -03 (America/Santiago)
- **Solicitud:** Diagnosticar por qué la comunicación de WhatsApp dejó de funcionar.
- **Resultado:** Causa raíz identificada: la sesión de WhatsApp del bot quedó cerrada/desvinculada a nivel servidor el 18-09-2026 ~22:31 (hora Chile). Desde entonces el bridge no puede autenticarse ("Logged out. Delete session and restart to re-authenticate.") y el gateway reintenta sin éxito cada ~5 minutos (≈1.246 intentos fallidos acumulados). Canal caído de punta a punta: sin mensajes procesados desde el 18-09 22:31. Recuperación definida (re-vinculación por QR: backup de sesión → detener gateway → limpiar sesión → escanear QR nuevo → reactivar gateway), pendiente de autorización del usuario y del escaneo del QR con el teléfono del bot.
- **Estado:** a la espera de autorización.
- **Verificación:** bridge.log: último evento 2026-09-18 22:31:55 -03, luego bucle "Logged out" (1.246 ocurrencias); gateway.log: "Bridge process died (exit code 1)" en bucle desde 2026-09-19 01:31 UTC; `curl http://127.0.0.1:3000/health` → connection refused; gateway s6 "up (pid 158)"; api_server 8642 operativo (lo sirve el gateway; se pausa durante la reparación).
- **Pendientes:** (1) autorización para preparar la re-vinculación (backup + stop gateway + limpieza de sesión); (2) escaneo del QR con el teléfono del bot; (3) reactivar gateway y verificar bridge "connected" + mensaje de prueba; (4) registrar el resultado final.

## 2026-09-23 08:40 -03 (America/Santiago)
- **Solicitud:** Verificar la conexión de WhatsApp tras la re-vinculación del dispositivo, porque el bot aún no respondía.
- **Resultado:** Re-vinculación exitosa y canal operativo. La sesión nueva quedó escrita a las 08:31 (hora Chile) y el gateway reconectó el bridge en su ciclo de reintento a las 08:34:45. Mensaje entrante de Daniel ("Hola", 08:34:51) procesado y respondido: respuesta de 271 caracteres enviada a las 08:35:05. Nota operativa: tras escanear el QR el bridge no se levanta de inmediato; el gateway reintenta cada ~5 minutos (hoy la conexión llegó en el reintento siguiente). Pendientes previos (1)-(3) cubiertos por la re-vinculación.
- **Estado:** completada.
- **Verificación:** `/health` del bridge → `{"status":"connected"}`; gateway.log: `✓ whatsapp reconnected successfully` (attempt 1247, 11:34:45 UTC) + `inbound message ... msg='Hola'` + `Sending response (271 chars) to 104544402972808@lid`; `session/creds.json` renovado 11:31:09 UTC; sin errores en gateway.log posteriores a la reconexión.
- **Pendientes:** Ninguno. Se sugiere confirmar la recepción de la respuesta del lado de WhatsApp.
