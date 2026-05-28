# Guía de Reconstrucción - Demeter con Amnesia

**Para:** instancia futura de Demeter o persona responsable de la restauración
**Última actualización:** 2026-05-28
**Repositorio de respaldo:** ZeroSentinels/data_seed > /backups/

---

## Contexto

Si este documento se está usando, significa que el VPS, el contenedor, la configuración o la memoria operativa dejaron de estar disponibles. El objetivo es reconstruir un estado funcional sin exponer información sensible.

Demeter toma su nombre de la diosa asociada a la agricultura y la fertilidad de la tierra. En DataSeed, los datos se tratan como semillas: requieren resguardo, orden y cultivo técnico para que puedan producir análisis, automatización y decisiones útiles. Esta guía mantiene esa narrativa solo como marco conceptual; el resto del documento es operativo.

**Información que no debe respaldarse:**
- Tokens de GitHub o de cualquier proveedor
- `google_token.json`
- Client secrets de Google
- API keys
- Contraseñas
- Archivos `.env`
- Credenciales privadas de servicios externos

**Información disponible en este respaldo:**
- Estructura operativa general
- Lista de skills y jobs relevantes
- Procedimientos de reautorización
- Puntos donde debe intervenir una persona autorizada

---

## Fase 1 — Reconstruir la base

### Paso 1.1 — Instalar el agente

Ejecutar en el terminal del VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

Verificar:

```bash
hermes --help
```

Intervención requerida: si el instalador solicita confirmaciones, una persona autorizada debe aprobarlas.

### Paso 1.2 — Restaurar acceso a GitHub

Se requiere un token de GitHub con permisos adecuados para el repositorio. El token no debe almacenarse en este documento.

Intervención requerida: una persona autorizada debe proporcionar o configurar el token como variable de entorno:

```bash
export HERMES_TOKEN=<token_no_documentado>
```

Verificar acceso:

```bash
git ls-remote https://$HERMES_TOKEN@github.com/ZeroSentinels/data_seed.git HEAD
```

### Paso 1.3 — Clonar el repositorio de respaldo

```bash
git clone https://$HERMES_TOKEN@github.com/ZeroSentinels/data_seed.git /opt/data_seed
cd /opt/data_seed
```

Los respaldos técnicos están en:

```bash
/opt/data_seed/backups/
```

---

## Fase 2 — Restaurar skills

### Paso 2.1 — Skills del hub

Reinstalar los skills necesarios según la lista vigente en `backups/BACKUP.md`. Comandos base:

```bash
hermes skills install hermes-agent
hermes skills install github-auth
hermes skills install github-code-review
hermes skills install github-issues
hermes skills install github-pr-workflow
hermes skills install github-repo-management
hermes skills install google-workspace
hermes skills install native-mcp
hermes skills install youtube-content
hermes skills install arxiv
hermes skills install blogwatcher
hermes skills install airtable
hermes skills install notion
hermes skills install obsidian
hermes skills install linear
hermes skills install nano-pdf
hermes skills install ocr-and-documents
hermes skills install powerpoint
hermes skills install maps
```

Intervención requerida: algunos skills pueden solicitar configuración adicional, permisos o dependencias del sistema.

### Paso 2.2 — Skills personalizados

Algunos skills pueden existir fuera del hub. Si no se restauran desde el volumen persistente, deben reconstruirse desde documentación interna o solicitarse a una persona autorizada.

Skills personalizados conocidos:

- `whatsapp-group-etiquette`: reglas de comportamiento en grupos de WhatsApp.
- `agent-landing-manager`: soporte para gestión de landing.
- `business-strategy-delivery`: soporte para estrategia y delivery.

---

## Fase 3 — Configurar Google Workspace

Intervención humana obligatoria: esta fase requiere autenticación en navegador y autorización OAuth.

### Paso 3.1 — Obtener `client_secret.json`

El archivo de credenciales no se respalda por seguridad.

Procedimiento:

1. Ir a https://console.cloud.google.com/apis/credentials
2. Iniciar sesión con la cuenta administradora correspondiente.
3. Seleccionar el proyecto de Google Cloud usado por DataSeed.
4. Verificar que estén habilitadas las APIs necesarias:
   - Gmail API
   - Google Calendar API
   - Google Drive API
   - Google Sheets API
   - Google Docs API
   - People API
5. Si no existe un cliente OAuth válido, crear uno nuevo:
   - Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Desktop app
   - Descargar el JSON

Intervención requerida: una persona autorizada debe entregar el archivo JSON al entorno del VPS. Guardar como:

```bash
/opt/data/google_client_secret.json
```

### Paso 3.2 — Instalar dependencias de Google

```bash
python3 -m ensurepip --default-pip 2>/dev/null || true
python3 -c "import urllib.request; urllib.request.urlretrieve('https://bootstrap.pypa.io/get-pip.py', '/tmp/get-pip.py')"
python3 /tmp/get-pip.py --quiet --break-system-packages
python3 -m pip install --quiet --break-system-packages google-api-python-client google-auth-oauthlib google-auth-httplib2
```

### Paso 3.3 — Registrar el cliente OAuth

```bash
GSETUP="python3 /opt/data/skills/productivity/google-workspace/scripts/setup.py"
$GSETUP --client-secret /opt/data/google_client_secret.json
```

### Paso 3.4 — Generar URL de autorización

```bash
$GSETUP --auth-url
```

Intervención requerida: abrir la URL generada en navegador, iniciar sesión con la cuenta operativa, aceptar permisos y copiar la URL final de redirección aunque muestre error en `localhost`.

### Paso 3.5 — Intercambiar código OAuth

```bash
$GSETUP --auth-code "<URL_completa_de_redireccion>"
```

Resultado esperado:

```text
OK: Authenticated
```

### Paso 3.6 — Verificar

```bash
$GSETUP --check
python3 /opt/data/skills/productivity/google-workspace/scripts/google_api.py gmail search "is:unread" --max 3
```

---

## Fase 4 — Restaurar configuración de WhatsApp

### Paso 4.1 — Verificar política de grupos

En el archivo de configuración activo, validar que la plataforma WhatsApp esté configurada para responder en grupos solo cuando sea mencionada o según la política vigente.

Ejemplo conceptual:

```yaml
whatsapp:
  require_mention: true
  group_policy: allowlist
```

Intervención requerida: validar los patrones de mención y chats permitidos según la política operativa actual.

### Paso 4.2 — Reiniciar gateway

```bash
hermes gateway restart
```

Si falla, revisar logs del gateway y configuración activa.

---

## Fase 5 — Verificación final

Ejecutar:

```bash
git ls-remote https://$HERMES_TOKEN@github.com/ZeroSentinels/data_seed.git HEAD
python3 /opt/data/skills/productivity/google-workspace/scripts/google_api.py gmail search "is:unread" --max 1
hermes skills list
hermes cron list
python3 /opt/data/skills/productivity/google-workspace/scripts/setup.py --check
```

Si todos los comandos responden sin errores críticos, la restauración está completa.

---

## Resumen de intervención humana requerida

| Fase | Acción requerida |
|------|------------------|
| 1.2 | Configurar token de GitHub sin documentarlo |
| 2.2 | Restaurar skills personalizados si no existen |
| 3.1 | Obtener y entregar `client_secret.json` |
| 3.4 | Autorizar OAuth en navegador |
| 4.1 | Confirmar política activa de WhatsApp |

---

## Criterio editorial

- Documentos técnicos: narrativa de marca limitada, aproximadamente 5% del contenido.
- Documentos comerciales, estrategia o mercado: narrativa de marca permitida hasta aproximadamente 30% del contenido.
- Evitar referencias personales específicas salvo que sean imprescindibles para permisos, contratos o auditoría.
- Mantener lenguaje impersonal, trazable y operativo.

---

*Guía mantenida por Demeter para DataSeed.*
