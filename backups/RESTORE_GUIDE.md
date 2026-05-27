# 🦉 Guía de Reconstrucción - Hermes Agent con Amnesia

**Para:** Yo del futuro (o quien me restaure)
**Última actualización:** 2026-05-27
**Repositorio de respaldo:** ZeroSentinels/data_seed > /backups/

---

## Contexto

Si estás leyendo esto es porque algo falló. El VPS murió, se corrompió el disco, o el contenedor fue reconstruido desde cero. No tengo memoria de nada. Pero tengo este archivo, y es suficiente para volver a operar.

**Lo que NO tengo y NO puedo respaldar:**
- Tokens (HERMES_TOKEN, google_token.json)
- Client secrets de Google
- API keys de ningún servicio
- Contraseñas

**Lo que SÍ tengo:**
- Este tutorial
- La estructura de skills
- Las instrucciones para re-autorizar todo

FASE 1 — Reconstruir la base
· · · · · · · · · · · · · · · · · · · · · · ·

Paso 1.1 — Instalar Hermes Agent

Ejecutar en el terminal del VPS:

curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

Verificar con: hermes --help

>> INTERVENCIÓN DEL USUARIO: Si el instalador pide confirmaciones, el usuario debe aprobarlas.


Paso 1.2 — Restaurar el acceso a GitHub

Necesitas el HERMES_TOKEN. Sin él no puedo hacer nada en GitHub.

>> INTERVENCIÓN DEL USUARIO: Proporcionar el HERMES_TOKEN. Se guarda como variable de entorno:
export HERMES_TOKEN=<token_aquí>

Verificar acceso:
git ls-remote https://$HERMES_TOKEN@github.com/ZeroSentinels/data_seed.git HEAD


Paso 1.3 — Clonar el repo de respaldo

git clone https://$HERMES_TOKEN@github.com/ZeroSentinels/data_seed.git /opt/data_seed
cd /opt/data_seed

Los backups están en /opt/data_seed/backups/
Los archivos importantes del agente estaban en /opt/data/.hermes/ y /opt/data/skills/

---

FASE 2 — Restaurar Skills
· · · · · · · · · · · · · · · · · · · · · · ·

Paso 2.1 — Skills del Hub de Hermes

La mayoría de los skills se instalan desde el hub de habilidades de Hermes. Lista de skills que debes reinstalar:

hermes skills install hermes-agent
hermes skills install github-auth
hermes skills install github-code-review
hermes skills install github-issues
hermes skills install github-pr-workflow
hermes skills install github-repo-management
hermes skills install google-workspace
hermes skills install xurl
hermes skills install himalaya
hermes skills install spotify
hermes skills install native-mcp
hermes skills install youtube-content
hermes skills install arxiv
hermes skills install blogwatcher
hermes skills install airtable
hermes skills install notion
hermes skills install obsidian
hermes skills install openhue
hermes skills install linear
hermes skills install nano-pdf
hermes skills install ocr-and-documents
hermes skills install powerpoint
hermes skills install maps

>> INTERVENCIÓN DEL USUARIO: Algunos skills pueden requerir configuración adicional o dependencias. Seguir las instrucciones que hermes skills install muestre.


Paso 2.2 — Skills personalizados (creados a mano)

Estos NO están en el hub. Estaban en /opt/data/skills/:

1. **whatsapp-group-etiquette** — Manejo de grupos de WhatsApp (no responder salvo mención)
   >> INTERVENCIÓN DEL USUARIO: Si este skill no se restauró automáticamente, solicitar al usuario que lo vuelva a crear o lo proporcione.

2. **dogfood** — QA exploratorio de web apps
3. **agent-landing-manager** — Gestión de landings

Estos skills personalizados deberían reconstruirse desde las notas del proyecto o solicitar al usuario que los proporcione.

---

FASE 3 — Configurar Google Workspace
· · · · · · · · · · · · · · · · · · · · · · ·

>> INTERVENCIÓN DEL USUARIO OBLIGATORIA: Esta fase requiere interacción humana. No se puede automatizar porque involucra iniciar sesión en un navegador y autorizar permisos.

Paso 3.1 — Obtener el client_secret.json

El archivo google_client_secret.json NO está en los backups por seguridad. Para re-crearlo:

a) Ir a https://console.cloud.google.com/apis/credentials
b) Iniciar sesión con la cuenta de Google correspondiente
c) Seleccionar el proyecto existente (buscar "hermes-agent" o "demeter")
d) Si las credenciales OAuth existen pero el secreto se perdió, crear NUEVAS credenciales:
   - Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: "Desktop app"
   - Descargar el JSON
e) Si no existe ningún proyecto, crear uno desde cero:
   - https://console.cloud.google.com/projectselector2/home/dashboard
   - Habilitar APIs: Gmail, Calendar, Drive, Sheets, Docs, People
   - Configurar OAuth consent screen (tipo External, agregar test user)
   - Luego crear credenciales como en el paso d)

 >> INTERVENCIÓN DEL USUARIO: El usuario debe proporcionar el archivo descargado. Guardarlo en: /opt/data/google_client_secret.json


Paso 3.2 — Instalar dependencias de Google

python3 -m ensurepip --default-pip 2>/dev/null || true
python3 -c "import urllib.request; urllib.request.urlretrieve('https://bootstrap.pypa.io/get-pip.py', '/tmp/get-pip.py')"
python3 /tmp/get-pip.py --quiet --break-system-packages
python3 -m pip install --quiet --break-system-packages google-api-python-client google-auth-oauthlib google-auth-httplib2


Paso 3.3 — Registrar el cliente OAuth

GSETUP="python3 /opt/data/skills/productivity/google-workspace/scripts/setup.py"
$GSETUP --client-secret /opt/data/google_client_secret.json --services all


Paso 3.4 — Generar URL de autorización

$ GSETUP --auth-url

Esto imprime una URL. 

>> INTERVENCIÓN DEL USUARIO: El usuario debe abrir esa URL en su navegador, iniciar sesión con la cuenta de Google del agente (ej: demeter@dataseed.cl), aceptar TODOS los permisos, y luego copiar la URL de redirección (aunque dé error en localhost:1) y proporcionarla.


Paso 3.5 — Intercambiar el código

$GSETUP --auth-code "<URL completa que el usuario pegó>"

Debería responder: "OK: Authenticated"


Paso 3.6 — Verificar

$GSETUP --check

Debería responder: "AUTHENTICATED"

Probar leyendo la bandeja:
python3 /opt/data/skills/productivity/google-workspace/scripts/google_api.py gmail search "is:unread" --max 3

---

FASE 4 — Restaurar Configuración de WhatsApp
· · · · · · · · · · · · · · · · · · · · · · ·

Paso 4.1 — Configurar require_mention en grupos

En ~/.hermes/config.yaml, verificar que exista:

whatsapp:
  require_mention: true
  mention_patterns:
    - "@hermes"
    - "@Hermes"
    - "@bot"
  group_policy: allowlist

>> INTERVENCIÓN DEL USUARIO: Si esta configuración no existe, el usuario debe verificarla manualmente en la documentación de Hermes.


Paso 4.2 — Reiniciar el gateway

hermes gateway restart

>> INTERVENCIÓN DEL USUARIO: Si el gateway no reinicia correctamente, verificar configuración en ~/.hermes/config.yaml

---

FASE 5 — Verificación Final
· · · · · · · · · · · · · · · · · · · · · · ·

Ejecutar estas pruebas para confirmar que todo funciona:

1. GitHub:
   git ls-remote https://$HERMES_TOKEN@github.com/ZeroSentinels/data_seed.git HEAD

2. Google (Gmail):
   python3 /opt/data/skills/productivity/google-workspace/scripts/google_api.py gmail search "is:unread" --max 1

3. Skills:
   hermes skills list

4. Cron jobs:
   hermes cron list

5. Google Workspace:
   python3 /opt/data/skills/productivity/google-workspace/scripts/setup.py --check

Si todos responden sin errores, la reconstrucción está completa.

---

## Resumen de intervenciones del usuario

| Paso | Qué debe hacer el usuario |
|------|--------------------------|
| 1.2 | Proporcionar HERMES_TOKEN |
| 2.2 | Proporcionar skills personalizados si no se restauraron |
| 3.1 | Crear/obtener client_secret.json de Google Cloud |
| 3.4 | Abrir URL OAuth en navegador y pegar código |
| 4.1 | Verificar configuración WhatsApp en config.yaml |

---

## Tips

- Si el VPS es completamente nuevo, asegurarse de que el volumen persistente esté montado en /opt/data/ para no perder datos entre recreaciones
- Los backups en GitHub se actualizan diariamente a las 5:00 AM hora de Chile (09:00 UTC)
- En caso de duda sobre cualquier configuración, revisar los archivos de backup más recientes en el repo

---

*Guía mantenida por Hermes Agent. Si la estás leyendo, ¡bienvenida de vuelta!*
