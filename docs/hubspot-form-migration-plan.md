# Plan de Migración — Formulario Dataseed.cl a HubSpot Forms API

## Objetivo

Migrar el formulario de contacto de Dataseed.cl desde Formspree hacia HubSpot, manteniendo el diseño actual del sitio y creando contactos/leads automáticamente en el CRM.

El formulario actual ya funciona como solución temporal con Formspree:

```html
<form class="contact-form" action="https://formspree.io/f/xzdwykww" method="POST">
```

La migración recomendada es usar **HubSpot Forms API** en vez de embebido visual, para conservar el diseño del sitio.

---

## Arquitectura recomendada

### Opción recomendada: HubSpot Forms API

Frontend Dataseed.cl → `https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}` → HubSpot CRM

Ventajas:

- Mantiene el diseño actual del formulario.
- No expone tokens privados de HubSpot.
- Crea contactos/leads usando un formulario oficial de HubSpot.
- Permite workflows, notificaciones, listas y automatización dentro de HubSpot.

---

## Datos requeridos para implementar

Faltan estos datos:

1. **HubSpot Portal ID**
   - ID de la cuenta/portal de HubSpot.

2. **Form GUID**
   - ID del formulario creado en HubSpot.

3. **Campos internos del formulario en HubSpot**
   - Deben coincidir con los `name` que se enviarán desde el sitio.

4. **URL de la página de gracias**
   - Recomendado: `https://dataseed.cl/gracias.html`

---

## Formulario HubSpot sugerido

Nombre del formulario en HubSpot:

**Contacto Dataseed Website**

Campos mínimos:

| Campo visible | Campo HubSpot recomendado | Tipo | Obligatorio |
| --- | --- | --- | --- |
| Nombre | `firstname` | texto | sí |
| Email | `email` | email | sí |
| Empresa | `company` | texto | no/sí recomendado |
| ERP / Sistemas principales | `sistemas_principales` | texto largo o single-line text | no |
| ¿Qué quieres lograr? | `objetivo_del_cliente` o `message` | texto largo | sí |
| Servicio de interés | `servicio_de_interes` | dropdown | recomendado |
| Origen del lead | `lead_source` o campo custom | hidden | sí |

Campos hidden recomendados:

- `lead_source = dataseed.cl`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `page_url`
- `producto_interes = publica_ai` si el formulario está en una landing específica.

---

## Payload esperado para HubSpot Forms API

Endpoint:

```text
POST https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}
```

Payload ejemplo:

```json
{
  "fields": [
    { "name": "firstname", "value": "Nombre del cliente" },
    { "name": "email", "value": "cliente@empresa.com" },
    { "name": "company", "value": "Empresa SpA" },
    { "name": "sistemas_principales", "value": "SAP B1, Odoo, Salesforce" },
    { "name": "objetivo_del_cliente", "value": "Queremos ordenar datos comerciales y detectar oportunidades" },
    { "name": "lead_source", "value": "dataseed.cl" }
  ],
  "context": {
    "pageUri": "https://dataseed.cl/",
    "pageName": "Dataseed Landing"
  }
}
```

---

## Implementación frontend sugerida

Cuando existan `portalId` y `formGuid`, cambiar el formulario para usar JavaScript `fetch` en vez de `action` HTML directo.

### Pasos

1. Mantener el HTML visual actual.
2. Agregar `id="contact-form"` al formulario.
3. Cambiar botón para mostrar estado de carga.
4. Interceptar submit.
5. Enviar payload a HubSpot.
6. Redirigir a `/gracias.html` si responde OK.
7. Mostrar error amigable si falla.

### Código base sugerido

```html
<form id="contact-form" class="contact-form">
  ...campos actuales...
</form>

<script>
const HUBSPOT_PORTAL_ID = 'REEMPLAZAR_PORTAL_ID';
const HUBSPOT_FORM_GUID = 'REEMPLAZAR_FORM_GUID';

const form = document.getElementById('contact-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;

  const payload = {
    fields: [
      { name: 'firstname', value: data.get('nombre') || '' },
      { name: 'email', value: data.get('email') || '' },
      { name: 'company', value: data.get('empresa') || '' },
      { name: 'sistemas_principales', value: data.get('sistemas') || '' },
      { name: 'objetivo_del_cliente', value: data.get('objetivo') || '' },
      { name: 'lead_source', value: 'dataseed.cl' }
    ],
    context: {
      pageUri: window.location.href,
      pageName: document.title
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HubSpot error ${response.status}`);
  }

  window.location.href = '/gracias.html';
});
</script>
```

---

## Workflow recomendado en HubSpot

Trigger:

- Form submission = “Contacto Dataseed Website”

Acciones:

1. Crear/actualizar contacto.
2. Setear lifecycle stage: Lead.
3. Setear lead source: dataseed.cl.
4. Notificar a `contacto@dataseed.cl`.
5. Crear tarea comercial: “Responder lead Dataseed.cl”.
6. Si `servicio_de_interes = Publica AI`, agregar a lista “Pública AI Leads”.
7. Enviar email automático de recepción.
8. Crear deal opcional en pipeline comercial si la empresa cumple criterios.

---

## Validación end-to-end

Checklist de prueba:

- [ ] Formulario creado en HubSpot.
- [ ] Portal ID confirmado.
- [ ] Form GUID confirmado.
- [ ] Campos internos creados y publicados.
- [ ] Submit desde dataseed.cl responde 200/204.
- [ ] Contacto aparece en HubSpot.
- [ ] Campos custom llegan con valor correcto.
- [ ] Workflow envía notificación a `contacto@dataseed.cl`.
- [ ] Usuario es redirigido a `/gracias.html`.
- [ ] Vercel deploy OK.

---

## Stoppers actuales

No se puede completar la migración hasta tener:

1. HubSpot Portal ID.
2. Form GUID.
3. Campos custom creados en HubSpot.
4. Confirmación de workflow/notificación interna.

Mientras tanto, Formspree queda como solución temporal operativa.

---

## Recomendación

Mantener Formspree solo como puente temporal. Para el producto Pública AI y para captación comercial seria, HubSpot debe ser la fuente de verdad del funnel:

Dataseed.cl → HubSpot Form → Contacto/Lead → Workflow → Tarea comercial → Demo → Deal
