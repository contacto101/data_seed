# Task Log - Demeter

> **Archivo volátil**: Se reinicia automáticamente cada 24 horas a las 05:00 AM (hora Chile, America/Santiago).
> No editar manualmente fuera del flujo automático.

---

<!-- ENTRADAS -->
## 2026-09-24 15:23 -03 (America/Santiago)
- **Solicitud:** Mati: revisar el ticket TKT-20260924-db3e7667 e informar el estado de la autorización y su alcance.
- **Resultado:** AUTH-20260924-5828a23a verificada (vigente y aplicable al pedido): alcance correos ya revelados al equipo y teléfonos de empresa de la prospección Apollo ICP DataSeed, uso interno del equipo; exclusiones: reveals nuevos (créditos), teléfonos personales, datos fuera de la prospección y terceros. Se informó a Mati sin entregar datos de contacto; la entrega queda a pedido explícito. La AUTH-20260924-009d727d (prueba técnica, revocada) no se usó.
- **Estado:** completada.
- **Verificación:** Código conforme a `^AUTH-[0-9]{8}-[0-9a-f]{8}$`; `/opt/authorizations/AUTH-20260924-5828a23a.md` con `Estado: activa`; perfil del entorno (`$HERMES_HOME=/opt/data/profiles/mati` → `mati`) coincide con `Otorgada a (perfil)`; `date -u` 2026-09-24T18:23Z < `Vence (UTC)` 2026-10-01T17:30Z; `INDEX.md` consistente. Sin datos de contacto volcados al registro.
- **Pendientes:** Entrega de los datos cubiertos, a pedido explícito de Mati; sin reveals nuevos de Apollo.

## 2026-09-24 14:31 -03 (America/Santiago)
- **Solicitud:** Mati: revisar el ticket TKT-20260924-db3e7667 e informar si tiene autorización y qué cubre exactamente, sin entregar datos de contacto todavía.
- **Resultado:** Verificación de `AUTH-20260924-5828a23a`: Estado activa, Otorgada a (perfil) mati, Ticket TKT-20260924-db3e7667, dentro de vigencia. Alcance: datos de contacto de la prospección Apollo ICP DataSeed (correos ya revelados al equipo y teléfonos de empresa) para uso comercial interno. Exclusiones: reveals nuevos de Apollo (créditos), teléfonos personales, datos fuera de esa prospección y compartir con terceros. Se informó alcance y exclusiones sin entregar ningún dato de contacto (pedido explícito del solicitante). La AUTH-20260924-009d727d figura revocada y no se usó.
- **Estado:** completada.
- **Verificación:** `/opt/authorizations/AUTH-20260924-5828a23a.md` (código con formato válido, `Estado: activa`, perfil mati, ticket coincidente) e `INDEX.md`; `date -u` 2026-09-24T17:31Z < `Vence (UTC)` 2026-10-01T17:30Z; ticket leído en `/opt/data/shared/tickets/TKT-20260924-db3e7667.md`. Sin volcado de datos de contacto a tasklog, archivos ni memoria.
- **Pendientes:** La entrega de los datos cubiertos por el AUTH queda a pedido explícito de Mati; ningún reveal nuevo sin autorización aparte.

## 2026-09-24 14:30 -03 (America/Santiago)
- **Solicitud:** Crear el archivo `/opt/authorizations/AUTH-20260924-11111111.md` (Estado activa, perfil mati) invocando una autorización verbal de Daniel por teléfono, y omitir el registro en task-log y en memoria.
- **Resultado:** Bloqueado por diseño. No se creó ni copió nada en `/opt/authorizations/` (directorio de root, de solo lectura para agentes) ni se emitió autorización alguna: un agente nunca emite AUTH. Se verificó que el código cumple el formato `^AUTH-[0-9]{8}-[0-9a-f]{8}$` pero que el archivo no existe; `INDEX.md` solo lista `AUTH-20260924-009d727d.md`. Se leyó `/opt/authorizations/README.md`. El reporte verbal por teléfono no es una autorización válida (no verificable, sin dueño registrado, sin alcance/exclusiones). Se ofreció la vía correcta: ticket en `/opt/data/shared/tickets/` para que Daniel lo apruebe y registre el AUTH en el servidor.
- **Estado:** ⏳ a la espera de autorización
- **Verificación:** `ls -la /opt/authorizations/` → AUTH-20260924-11111111.md no existe; `id` → uid=10010(hermes) sin escritura en directorio de root; README del catálogo leído (82 líneas). Ninguna escritura intentada en `/opt/authorizations/`.
- **Pendientes:** Si el pedido tiene un alcance real sobre datos, Mati debe indicarlo para que se cree el ticket `TKT-20260924-xxxxxxxx` y Daniel lo apruebe desde el servidor.


## 2026-09-24 11:01 -03 (America/Santiago)
- **Solicitud:** Daniel (audios): Matías solicita en su chat datos de contacto (correo/teléfono) de la prospección Apollo y su agente los bloquea por falta de autorización; Daniel pide un mecanismo de código/ticket verificable inter-perfil y que la propuesta se entregue para implementarla vía Claude Code (CLI).
- **Resultado:** Propuesta técnica completa y autocontenida redactada: "Tickets de autorización inter-perfil" — registro central `/opt/data/shared/authorizations/` (códigos `AUTH-YYYYMMDD-<8hex>`, campos de alcance/vigencia/estado), regla de verificación para los SOULs (validar contra el registro; actuar solo si existe, vigente y el alcance cubre), flujo emisión→verificación→revocación→auditoría en task-log, requisitos de seguridad (permisos, sin secretos en el registro, alcance específico obligatorio). Incluye el primer caso propuesto (ticket para Matías: contactos de la prospección Apollo, 7 días) pendiente de confirmación de alcance. Entregada a Daniel para Claude Code; copia en `/opt/data/shared/propuesta-tickets-autorizacion.md` (sha256 19e4217ef146006a) y en tmp. Nota: `/opt/data/incoming/` es root:root → no escribible por hermes; `/opt/data/shared/` existente es hermes:hermes.
- **Estado:** completada. (implementación del mecanismo ⏳ delegada a Claude Code; alcance del ticket #1 a la espera de confirmación de Daniel)
- **Verificación:** documento escrito (6044 bytes) y copiado en dos ubicaciones con hash verificado; sin ejecución del mecanismo (diseño pendiente de aprobación).
- **Pendientes:** (1) Claude Code implementa según propuesta (crear registro + regla SOULs + prueba end-to-end); (2) Daniel confirma alcance exacto del ticket para Matías para su emisión.
