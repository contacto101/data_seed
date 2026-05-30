# Sistema de Login / Autenticación — DataSeed.cl

**Decisión optimizada para GCP:** Firebase Authentication como implementación inicial, con **Google Login corporativo como acceso principal**, y ruta natural a Google Cloud Identity Platform cuando se requiera multi-tenant, SLA/compliance avanzado o controles enterprise.  
**Estado:** integración frontend GCP/Firebase lista; falta crear proyecto/config real en Google Cloud/Firebase Console.  
**Fuentes verificadas:** documentación oficial Firebase Authentication, Firebase Web Setup e Identity Platform de Google Cloud.

---

## 1. Opción seleccionada

### Selección

```text
Google Login corporativo como método principal
Firebase Auth + Firebase Web SDK
→ Upgrade futuro opcional: Google Cloud Identity Platform
```

La experiencia principal queda así:

```text
Usuario del grupo/equipo → Continuar con Google → validar dominio @dataseed.cl → dashboard.html
```

### Por qué es la mejor opción para GCP

| Criterio | Resultado |
|---|---|
| Compatibilidad GCP | Nativa: Firebase vive sobre Google Cloud |
| Velocidad MVP | Alta: SDK web directo, sin backend propio |
| OAuth Google/Microsoft | Soportado vía proveedores auth |
| Hosting estático | Compatible con sitio HTML actual |
| Escalabilidad | Puede evolucionar a Identity Platform |
| Seguridad | Auth gestionado; reglas por dominio/proveedor |
| Futuro dashboard | Compatible con Firestore, Cloud Functions, BigQuery |

### Descartado por ahora

| Opción | Razón |
|---|---|
| Supabase Auth | Muy bueno, pero no optimiza GCP nativo |
| Clerk | Excelente UX, pero añade SaaS externo fuera de GCP |
| Auth0 | Robusto, pero más caro/complejo para MVP |
| Backend propio | No conviene antes de validar producto |

---

## 2. Archivos implementados

| Archivo | Función |
|---|---|
| `login.html` | UI de acceso/registro |
| `dashboard.html` | Dashboard privado V1 protegido por auth |
| `js/auth-ui.js` | UX local: tabs, validación, estados |
| `js/gcp-firebase-auth.js` | Integración Firebase Auth real, Google Login y validación opcional de dominio corporativo |
| `js/firebase-config.example.js` | Plantilla de configuración Firebase |
| `index.html` | Links hacia acceso clientes |

---

## 3. Cómo activar auth real

### Paso 1 — Crear proyecto en GCP/Firebase

1. Ir a Firebase Console.
2. Crear proyecto o vincular proyecto GCP existente.
3. Registrar una Web App.
4. Copiar la configuración Web SDK.

### Paso 2 — Crear `js/firebase-config.js`

Copiar:

```bash
cp js/firebase-config.example.js js/firebase-config.js
```

Editar con la configuración real:

```js
window.DS_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "dataseed-xxxxx.firebaseapp.com",
  projectId: "dataseed-xxxxx",
  storageBucket: "dataseed-xxxxx.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

Nota: esta configuración Web no es un secreto. No incluir nunca service account keys ni credenciales privadas en el repo.

### Paso 3 — Activar proveedores

En Firebase Authentication → Sign-in method:

- Email/password.
- Google.
- Microsoft, si se requiere acceso corporativo Microsoft 365.

### Paso 4 — Authorized domains

Agregar dominios reales:

- `dataseed.cl`
- `www.dataseed.cl`
- dominio temporal de preview si se usa
- dominio Firebase Hosting si aplica

### Paso 5 — Probar flujo

1. Abrir `login.html`.
2. Crear usuario con email/password.
3. Confirmar redirección a `dashboard.html`.
4. Cerrar sesión.
5. Probar recuperación de contraseña.
6. Probar Google OAuth.

---

## 4. Flujos implementados

### Email/password

```text
login.html → Firebase Auth → dashboard.html
```

Funciones reales ya integradas:

- `createUserWithEmailAndPassword`
- `signInWithEmailAndPassword`
- `sendPasswordResetEmail`
- `signOut`
- `onAuthStateChanged`

### OAuth

```text
login.html → popup Google/Microsoft → Firebase Auth → dashboard.html
```

Proveedores integrados:

- `GoogleAuthProvider`
- `OAuthProvider('microsoft.com')`

### Dashboard protegido

```text
Usuario sin sesión → dashboard.html → redirect a login.html
Usuario con sesión → dashboard.html visible
```

---

## 5. Eventos analytics implementados

| Evento | Propósito |
|---|---|
| `auth_gcp_config_missing` | Detectar que falta configuración Firebase |
| `auth_gcp_ready` | Confirmar integración activa |
| `auth_mode_change` | Cambio login/register |
| `auth_register_success` | Registro exitoso |
| `auth_login_success` | Login exitoso |
| `auth_error` | Error de proveedor o credenciales |
| `auth_recover_sent` | Recuperación enviada |
| `auth_oauth_click` | Click en proveedor OAuth |
| `auth_guard_redirect` | Dashboard redirige por falta de sesión |
| `auth_guard_ok` | Usuario autenticado accede |
| `auth_logout` | Cierre de sesión |

---

## 6. Modelo futuro recomendado en GCP

### MVP

```text
Firebase Auth
Static HTML dashboard
Reportes demo/privados manuales
```

### V1 Producto

```text
Firebase Auth
Firestore: accounts, profiles, reports
Cloud Functions: generación de reportes / webhooks
Cloud Storage: PDFs privados
```

### V2 Data/AI

```text
BigQuery: licitaciones / oportunidades / histórico
Cloud Run: API de Pública AI
Vertex AI / Gemini: resúmenes, scoring, agente IA
Firestore: metadata de usuario/cuenta
```

### Enterprise

```text
Google Cloud Identity Platform
Multi-tenancy
SAML/OIDC corporativo
Cloud Armor / IAM / audit logs
```

---

## 7. Modelo de datos recomendado

```sql
profiles
- id uuid primary key
- firebase_uid text unique not null
- email text not null
- name text
- created_at timestamp

accounts
- id uuid primary key
- company_name text not null
- website text
- industry text
- region text
- created_at timestamp

account_members
- account_id uuid
- firebase_uid text
- role text -- owner/admin/viewer

reports
- id uuid primary key
- account_id uuid
- title text
- type text -- publica_ai, diagnostic, monthly_report
- file_url text
- status text -- draft/published/archived
- created_at timestamp
```

En Firebase/Firestore esto se representa como colecciones:

```text
/users/{uid}
/accounts/{accountId}
/accounts/{accountId}/members/{uid}
/accounts/{accountId}/reports/{reportId}
```

---

## 8. Seguridad mínima

- No subir service accounts al repo.
- Configurar Authorized domains.
- Activar App Check cuando haya backend/API.
- Reglas Firestore: usuarios solo leen cuentas donde son miembros.
- Reportes privados en Storage con reglas por cuenta.
- Para clientes enterprise: migrar a Identity Platform + SAML/OIDC.

---

## 9. Pendientes para cerrar T-021

| Pendiente | Quién lo habilita |
|---|---|
| Crear proyecto Firebase/GCP | Equipo con acceso GCP |
| Copiar config real a `js/firebase-config.js` | Equipo/Agente con datos del proyecto |
| Activar Email/password + Google + Microsoft | Admin Firebase |
| Agregar dominios autorizados | Admin Firebase |
| Probar en dominio real | Agente después de deploy |

---

## 10. Resumen ejecutivo

El login ya está implementado a nivel frontend y preparado para GCP/Firebase. La decisión recomendada es correcta para el stack: rápida, nativa de Google Cloud y escalable hacia Identity Platform.

Falta únicamente crear/configurar el proyecto Firebase real y publicar `js/firebase-config.js` con los datos del proyecto.

---

*Documento operativo — DataSeed.cl — Autenticación GCP/Firebase V1*
