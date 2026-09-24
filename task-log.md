# Task Log - Demeter

> **Archivo volátil**: Se reinicia automáticamente cada 24 horas a las 05:00 AM (hora Chile, America/Santiago).
> No editar manualmente fuera del flujo automático.

---

<!-- ENTRADAS -->

## 2026-09-24 11:01 -03 (America/Santiago)
- **Solicitud:** Daniel (audios): Matías solicita en su chat datos de contacto (correo/teléfono) de la prospección Apollo y su agente los bloquea por falta de autorización; Daniel pide un mecanismo de código/ticket verificable inter-perfil y que la propuesta se entregue para implementarla vía Claude Code (CLI).
- **Resultado:** Propuesta técnica completa y autocontenida redactada: "Tickets de autorización inter-perfil" — registro central `/opt/data/shared/authorizations/` (códigos `AUTH-YYYYMMDD-<8hex>`, campos de alcance/vigencia/estado), regla de verificación para los SOULs (validar contra el registro; actuar solo si existe, vigente y el alcance cubre), flujo emisión→verificación→revocación→auditoría en task-log, requisitos de seguridad (permisos, sin secretos en el registro, alcance específico obligatorio). Incluye el primer caso propuesto (ticket para Matías: contactos de la prospección Apollo, 7 días) pendiente de confirmación de alcance. Entregada a Daniel para Claude Code; copia en `/opt/data/shared/propuesta-tickets-autorizacion.md` (sha256 19e4217ef146006a) y en tmp. Nota: `/opt/data/incoming/` es root:root → no escribible por hermes; `/opt/data/shared/` existente es hermes:hermes.
- **Estado:** completada. (implementación del mecanismo ⏳ delegada a Claude Code; alcance del ticket #1 a la espera de confirmación de Daniel)
- **Verificación:** documento escrito (6044 bytes) y copiado en dos ubicaciones con hash verificado; sin ejecución del mecanismo (diseño pendiente de aprobación).
- **Pendientes:** (1) Claude Code implementa según propuesta (crear registro + regla SOULs + prueba end-to-end); (2) Daniel confirma alcance exacto del ticket para Matías para su emisión.
