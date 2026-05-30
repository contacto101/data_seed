# Sistema de Login / Autenticación — DataSeed.cl

**Estado:** V1 frontend implementado. Backend/proveedor auth pendiente de decisión.  
**Archivos implementados:**

- `login.html` — interfaz de acceso/registro.
- `js/auth-ui.js` — lógica frontend de tabs, validación, eventos y placeholders OAuth.
- `index.html` — links de navegación y footer hacia `login.html`.

---

## 1. Objetivo del login

El login no debe ser “una cuenta por tener cuenta”. Debe habilitar valor de producto.

Uso recomendado para V1:

1. Acceso a reportes personalizados de Pública AI.
2. Historial de oportunidades entregadas.
3. Radar por empresa/rubro/keywords.
4. Descarga de reportes privados.
5. Futura conexión con CRM/pagos.

---

## 2. Alcance implementado ahora

### Incluido

- Página `login.html` con diseño corporativo DataSeed.
- Tabs: ingresar / crear acceso.
- Campos: email de trabajo, nombre para registro, contraseña.
- Botones OAuth: Google y Microsoft.
- Validación frontend básica.
- Eventos analytics vía `DataseedTrack` / `dataLayer`:
  - `auth_mode_change`
  - `auth_recover_click`
  - `auth_oauth_click`
  - `auth_validation_error`
  - `auth_frontend_validated`
- Link desde navegación principal.
- Link desde footer.
- Página marcada `noindex,nofollow` por seguridad mientras no esté productiva.

### No incluido todavía

- Creación real de usuarios.
- Persistencia de sesión.
- Recuperación real de contraseña.
- OAuth real con Google/Microsoft.
- Dashboard privado.
- Base de datos de usuarios.
- Roles/permisos.

---

## 3. Arquitectura recomendada

### Fase 1 — Auth gestionado + sitio estático

Recomendación: usar un proveedor administrado.

Opciones viables:

| Opción | Ventaja | Riesgo / tradeoff | Recomendación |
|---|---|---|---|
| Supabase Auth | Open source, Postgres, rápido para dashboard futuro | Requiere configurar proyecto y RLS | Muy recomendada |
| Clerk | Muy rápido, excelente UX, OAuth simple | Dependencia SaaS, pricing escala | Recomendado si se prioriza velocidad |
| Auth0 | Enterprise, robusto, compliance | Más complejo/caro | Útil para clientes enterprise |
| Firebase Auth | Simple, barato, Google ecosystem | Modelo NoSQL si se usa Firestore | Bueno para MVP rápido |

**Recomendación inicial:** Supabase Auth si DataSeed quiere tener dashboard/data propia; Clerk si quiere velocidad máxima de implementación.

---

## 4. Modelo de datos mínimo

```sql
profiles
- id uuid primary key references auth.users(id)
- email text not null
- name text
- company text
- role text default 'client'
- created_at timestamp default now()

accounts
- id uuid primary key
- company_name text not null
- website text
- industry text
- region text
- created_at timestamp default now()

account_members
- account_id uuid references accounts(id)
- user_id uuid references profiles(id)
- role text check (role in ('owner','admin','viewer'))

reports
- id uuid primary key
- account_id uuid references accounts(id)
- title text
- type text -- publica_ai, diagnostic, monthly_report
- file_url text
- status text -- draft, published, archived
- created_at timestamp default now()
```

---

## 5. Flujos de usuario

### Login

```text
Usuario → login.html → proveedor auth → sesión → dashboard/reportes
```

### Registro

```text
Usuario → crear acceso → proveedor auth → perfil → completar empresa → dashboard vacío/con sample
```

### Pública AI

```text
Lead formulario → HubSpot/CRM → reporte demo → crear acceso → reporte privado → trial/pago
```

---

## 6. Eventos de analytics requeridos

| Evento | Cuándo se dispara | Propósito |
|---|---|---|
| `auth_page_view` | Al cargar login | Medir visitas a acceso |
| `auth_mode_change` | Cambio login/register | Intención de registro |
| `auth_frontend_validated` | Form válido frontend | Intento serio de login/registro |
| `auth_success` | Login real exitoso | Conversión auth |
| `auth_error` | Error proveedor | Diagnóstico |
| `auth_oauth_click` | Click Google/Microsoft | Preferencia OAuth |
| `auth_recover_click` | Recuperar acceso | Fricción |

Actualmente están implementados los eventos frontend posibles sin proveedor real.

---

## 7. Roadmap de implementación

### Sprint 1 — Frontend Auth Shell ✅

- [x] Crear `login.html`.
- [x] Crear `js/auth-ui.js`.
- [x] Enlazar desde home.
- [x] Eventos frontend.

### Sprint 2 — Proveedor Auth

- [ ] Elegir proveedor: Supabase / Clerk / Auth0 / Firebase.
- [ ] Crear proyecto/app.
- [ ] Configurar dominios autorizados.
- [ ] Configurar OAuth Google/Microsoft.
- [ ] Reemplazar placeholders por SDK real.
- [ ] Crear callback y logout.

### Sprint 3 — Dashboard mínimo

- [ ] Crear `dashboard.html` o app separada.
- [ ] Proteger ruta con sesión.
- [ ] Mostrar reportes demo/privados.
- [ ] Mostrar perfil empresa.
- [ ] Agregar logout.

### Sprint 4 — Roles + reportes privados

- [ ] Modelo `accounts`.
- [ ] Miembros por cuenta.
- [ ] Reportes por cuenta.
- [ ] Permisos owner/admin/viewer.

---

## 8. Decisiones pendientes del equipo

Para completar autenticación real se necesita decidir:

1. Proveedor auth preferido.
2. Si el dashboard será estático + proveedor externo o app separada.
3. Dominio final autorizado: `dataseed.cl`, `www.dataseed.cl`, subdominio tipo `app.dataseed.cl`.
4. OAuth requerido: Google, Microsoft, ambos o solo email/password.
5. Nivel de compliance inicial: básico MVP vs enterprise.

---

## 9. Recomendación ejecutiva

Para mantener velocidad y no sobredimensionar:

```text
login.html actual → Supabase Auth → dashboard.html simple → reportes Pública AI por cuenta
```

Esto permite validar producto sin construir backend complejo desde cero.

---

*Documento operativo — DataSeed.cl — Autenticación V1*
