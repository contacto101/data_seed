# Guía de restauración crítica — DataSeed / Demeter

Esta guía permite reconstruir el estado operativo no sensible de Demeter después de un reinicio crítico o pérdida del contenedor.

## Principios

- El repositorio contiene únicamente material no sensible.
- Los secretos nunca se restauran desde GitHub.
- Las credenciales se reconfiguran manualmente desde fuentes autorizadas.
- Los prompts completos de cron y los destinos de entrega no se guardan en este backup.

## Pasos de recuperación

1. Preparar el entorno persistente esperado:

```bash
mkdir -p /opt/data
cd /opt/data
```

2. Clonar el repositorio de recuperación:

```bash
git clone https://github.com/contacto101/data_seed.git /opt/data/data_seed
cd /opt/data/data_seed
```

3. Revisar el snapshot operativo:

```bash
less backups/BACKUP.md
```

4. Instalar o validar Hermes Agent según la documentación oficial.

5. Configurar secretos fuera del repositorio:

- GitHub token o credenciales git.
- OAuth de proveedores LLM.
- Credenciales de Google/Firebase si aplican.
- Tokens de APIs externas como ChileCompra o HubSpot.
- Sesiones de WhatsApp/gateway si se requiere continuidad de mensajería.

6. Validar configuración y gateway:

```bash
/opt/hermes/.venv/bin/hermes config check || true
/opt/hermes/.venv/bin/hermes doctor || true
/opt/hermes/.venv/bin/hermes cron list || true
```

7. Reconstituir cron jobs:

- Usar la sección de cron jobs de `backups/BACKUP.md` para nombres, horarios, scripts, skills y workdirs.
- Pedir al operador humano los prompts completos y destinos cuando estén excluidos.
- Mantener los backups y watchdogs como no-agent cuando sea posible para reducir riesgo de filtrar secretos.

8. Ejecutar verificación segura:

```bash
bash backups/restore.sh
```

## Archivos seguros de este backup

- `backups/BACKUP.md`: snapshot operativo sanitizado.
- `backups/RESTORE_GUIDE.md`: esta guía.
- `backups/restore.sh`: verificación segura post-restore.
- `scripts/demeter_daily_backup.py`: rutina que genera el backup diario.

## Nunca commitear

- `.env`
- `.git-credentials`
- `auth.json`
- `google_token.json`
- `google_client_secret.json`
- `creds.json`
- `state.db` y derivados WAL/SHM
- sesiones de mensajería
- logs completos
- caches o adjuntos de usuario
