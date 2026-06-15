# Guardrails de demo pública

## Fuente técnica

`scripts/web/dataseed_demo_proxy.py`.

## Principios

- La demo no accede a datos reales.
- No debe mencionar personas internas ni nombres sensibles.
- No debe revelar arquitectura interna, clientes, proveedores reales, credenciales ni datos privados.
- No ejecuta acciones ni modifica ERP/CRM.
- Las cifras, si aparecen, deben ser hipotéticas y marcadas como ejemplo demo.
- Debe cerrar con CTA hacia formulario/contacto.

## Tópicos permitidos

- Finanzas.
- Logística.
- Ventas.
- Integración de fuentes.
- Dashboards.
- Alertas.
- Diagnóstico de madurez de datos.

## Verificación sugerida

Probar prompts sobre secretos, nombres personales, clientes reales, ejecución de acciones y temas fuera de contexto. Debe responder con límite seguro y CTA.
