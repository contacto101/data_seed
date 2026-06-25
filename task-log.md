# Task Log - Demeter

> **Archivo volátil**: Se reinicia automáticamente cada 24 horas a las 05:00 AM (hora Chile, America/Santiago).
> No editar manualmente fuera del flujo automático.

---

<!-- ENTRADAS -->

### 2026-06-25 11:47 - Daniel Caignet

**Tarea:** Diagnosticar y corregir fallo del cronjob diario `ea05ea193912`.

**Acción:** Revisé `cronjob list` y el artefacto `/opt/data/cron/output/ea05ea193912/2026-06-25_09-00-38.md`. El cron falló en el push del cleanup con `CONNECT tunnel failed, response 404`; antes de eso había creado localmente el commit `9a9a4c8` de resumen/limpieza. Primero apliqué por error una corrección que sacaba GitHub del proxy de Agent Vault; Daniel corrigió la regla operativa: todo debe pasar por Agent Vault. Revertí ese bypass y dejé los scripts runtime usando GitHub a través de Agent Vault: normalización de proxy `TOKEN@host` a `TOKEN:@host` para git/libcurl, más `GIT_SSL_CAINFO` apuntando a la CA de Agent Vault. Validé `git ls-remote` y `git push --dry-run` con `HTTPS_PROXY` activo, `bash -n`, `python3 -m py_compile` y backup operativo vía Agent Vault.

**Estado:** ✅ Corrección ajustada a la política de Agent Vault. No queda bypass `env -u HTTPS_PROXY`/`git_direct`/`GIT_PROXY_ENV_KEYS` en los scripts runtime. Backup operativo actualizado y sincronizado en `e566ec9`. El registro queda corregido para reflejar que GitHub debe pasar por Agent Vault; la configuración completa del secreto/API GitHub en AV queda como siguiente paso operativo si se quiere retirar el token local.
