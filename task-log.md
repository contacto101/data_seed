# Task Log - Demeter

> **Archivo volátil**: Se reinicia automáticamente cada 24 horas a las 05:00 AM (hora Chile, America/Santiago).
> No editar manualmente fuera del flujo automático.

---

<!-- ENTRADAS -->

## 2026-09-09 11:47 -03 (America/Santiago)
- **Solicitud:** Daniel: aplicar como configuración global (todas las sesiones) dos reglas: (1) proceso diagnóstico → propuesta → ejecución con OK explícito para cambios en producción/ramas compartidas; (2) límite duro de máximo 2 intentos por vía ante fallo técnico, luego reportar y preguntar.
- **Resultado:** Sección "Reglas globales de operación (2026-09-07, Daniel)" agregada al final de los 10 SOUL.md de perfiles (daniel, mati, wa5352437119, wa56955123259, wa56976406976, wa56992354255, g120363406765196561, g120363410342471725, g120363426338264382, dataseed-demo), conservando el contenido previo. El canónico raíz `/opt/data/SOUL.md` (perfil default, root:root, archivo de instrucciones protegido) NO pudo actualizarse: write bloqueado por protección + aprobación expirada; no se reintentó (regla 2).
- **Estado:** ⏳ a la espera de autorización (10/11 archivos aplicados; raíz pendiente).
- **Verificación:** 9 perfiles operativos con sha256 idéntico 68d2728ffb73ee11; demo con 43d1b2708bd8a533 (SOUL propio + sección nueva); raíz sigue en a0ec2e2fc124c69a (sin la sección).
- **Pendientes:** aprobar actualización de /opt/data/SOUL.md (o ejecutar como root: `cp /opt/data/profiles/daniel/SOUL.md /opt/data/SOUL.md && chown root:root /opt/data/SOUL.md && chmod 755 /opt/data/SOUL.md`); las sesiones activas tomarán las reglas al abrir sesión nueva o /new (no se invalidó system_prompt en state.db sin autorización).
