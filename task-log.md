# Task Log - Demeter

> **Archivo volátil**: Se reinicia automáticamente cada 24 horas a las 05:00 AM (hora Chile, America/Santiago).
> No editar manualmente fuera del flujo automático.

---

<!-- ENTRADAS -->

## 2026-09-23 08:25 -03 (America/Santiago)
- **Solicitud:** Diagnosticar por qué la comunicación de WhatsApp dejó de funcionar.
- **Resultado:** Causa raíz identificada: la sesión de WhatsApp del bot quedó cerrada/desvinculada a nivel servidor el 18-09-2026 ~22:31 (hora Chile). Desde entonces el bridge no puede autenticarse ("Logged out. Delete session and restart to re-authenticate.") y el gateway reintenta sin éxito cada ~5 minutos (≈1.246 intentos fallidos acumulados). Canal caído de punta a punta: sin mensajes procesados desde el 18-09 22:31. Recuperación definida (re-vinculación por QR: backup de sesión → detener gateway → limpiar sesión → escanear QR nuevo → reactivar gateway), pendiente de autorización del usuario y del escaneo del QR con el teléfono del bot.
- **Estado:** a la espera de autorización.
- **Verificación:** bridge.log: último evento 2026-09-18 22:31:55 -03, luego bucle "Logged out" (1.246 ocurrencias); gateway.log: "Bridge process died (exit code 1)" en bucle desde 2026-09-19 01:31 UTC; `curl http://127.0.0.1:3000/health` → connection refused; gateway s6 "up (pid 158)"; api_server 8642 operativo (lo sirve el gateway; se pausa durante la reparación).
- **Pendientes:** (1) autorización para preparar la re-vinculación (backup + stop gateway + limpieza de sesión); (2) escaneo del QR con el teléfono del bot; (3) reactivar gateway y verificar bridge "connected" + mensaje de prueba; (4) registrar el resultado final.
