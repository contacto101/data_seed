# Task Log - Demeter

> **Archivo volátil**: Se reinicia automáticamente cada 24 horas a las 05:00 AM (hora Chile, America/Santiago).
> No editar manualmente fuera del flujo automático.

---

<!-- ENTRADAS -->

### 2026-06-17 | Daniel Caignet
**Tarea:** Registrar regla operativa: no usar Caddy en DataSeed; el VPS usa Traefik externo.
**Acción:** Guardé la regla en memoria persistente y verifiqué que la planificación de demo debe excluir Caddy por completo. Cualquier rastro real de Caddy dentro del contenedor debe revertirse solo como limpieza, sin reemplazar Traefik.
**Estado:** ✅ Regla activa

## 2026-06-17

| Hora | Usuario | Tarea | Acción | Estado |
|---|---|---|---|---|
| 14:00 | Daniel | Verificar repo, crear checkpoint, borrar ramas duplicadas | Verificadas 3 ramas ya borradas con checkpoint. Creados tags checkpoint/demo-production-24x7 y checkpoint/post-demo-deploy. Mergeada demo 24/7 a main. Actualizado branch-inventory.md. Las 6 ramas restantes tienen contenido único (no son duplicados). | ✅ Completo |
| 14:10 | Daniel | Demo 24/7 hardeneada | Caddy reverse proxy en :8080, demo proxy en :8766 con uri strip_prefix /api. Timeout 120s. Health checks OK. API key NO hardcodeada (lee de /opt/data/run/demeter_api_key). | ✅ Completo |
| 19:41 | Daniel | Portal auth Supabase v2 producción | Creado login.html + dashboard.html con Supabase Auth. RLS optimizado con (select auth.uid()). Rate limiting client-side. CSP headers. Audit log. Auto-onboarding. Guía configuración Supabase. Botón "Acceder" en landing nav. Rama: feat/supabase-auth-production. | ✅ Completo |
| 17:28 | Daniel | Corregir referencia de repositorio canónico | Confirmado que el repo actual es https://github.com/contacto101/data_seed. Eliminado el clon temporal equivocado y verificado 0 referencias a ZeroSentinels en /opt/data/data_seed. | ✅ Completo |

## 2026-06-18

| Hora | Usuario | Tarea | Acción | Estado |
|---|---|---|---|---|
| 00:02 | Daniel | Revisar logs de reinicio del gateway WhatsApp | Analizados logs compartidos: el gateway recibió mensaje grupal, creó turno con plataforma whatsapp y envió respuesta en 15.6s con 3 llamadas API. Se respeta instrucción de no modificar configuración ni requerimiento porque el tag de WhatsApp funcionaba. | ✅ Informado |
| 00:04 | Daniel | Aclarar cómo hacer funcionar el chat en grupo WhatsApp | Verificada configuración actual: whatsapp.require_mention=true, group_policy=open y group_sessions_per_user=false. Respuesta operacional: usar mención nativa del bot en el grupo; no modificar configuración si el tag nativo ya funcionaba. | ✅ Informado |
| 00:26 | Daniel | Recordar diagnóstico del aviso Codex incomplete en grupo WhatsApp | Recuperado diagnóstico histórico con session_search y verificado código activo: el problema original fue que la mención nativa podía pasar por mentionedIds pero el texto entregado al modelo quedaba sin @Demeter/@bot, provocando respuesta vacía/incompleta en Codex. No se modificó configuración. | ✅ Informado |
| 00:30 | Daniel | Solicitar respuesta automática a todos los mensajes recibidos en grupo WhatsApp | Se cargó la guía de WhatsApp y se mantuvo la regla operativa vigente: en grupos la respuesta debe estar condicionada a mención explícita/gateway; no se modificó configuración. | ✅ Informado |
| 00:31 | Daniel | Corregir causa raíz del aviso Codex incomplete | Daniel aclaró que era un problema del system prompt. Actualicé memoria persistente y skill whatsapp-gateway-config para priorizar diagnóstico del prompt antes de asumir cambio de configuración/QR/bridge. | ✅ Registrado |
| 00:33 | Daniel | Actualizar regla operativa WhatsApp según system prompt | Actualicé memoria persistente: el gateway/filtro previo decide cuándo hablarle a Demeter; si un mensaje del grupo llega al agente se interpreta como autorizado para responder sin re-filtrar por texto visible, respetando instrucciones superiores. | ✅ Registrado |
| 00:42 | Daniel | Verificar reinicio de gateway y aplicar ajuste real al system prompt | Verificado gateway reiniciado y WhatsApp conectado. Los logs mostraron que los mensajes de grupo aún generaban respuestas vacías/67 chars; se corrigió /opt/data/SOUL.md para que el modelo no haga una segunda verificación por @ visible cuando el gateway ya filtró la mención. Pendiente reinicio adicional para cargar el nuevo SOUL.md. | ⚠️ Pendiente reinicio |
