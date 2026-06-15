# Plan de autenticación DataSeed

## Estado

Histórico útil. Fuente: `agent-landing-updates/docs/auth-login-plan.md`.

## Decisión recomendada

Firebase Authentication como implementación inicial en GCP, con Google Login corporativo como acceso principal y evolución posible a Google Cloud Identity Platform.

## Estado original observado

La integración frontend GCP/Firebase estaba lista en la rama histórica, pero faltaba acceso admin/Firebase CLI para crear/configurar proyecto real.

## Riesgo

La autenticación frontend no protege datos privados servidos como assets estáticos. Para datos internos se requiere autorización server-side o API segura.

## Próxima acción

Revalidar con un admin GCP/Firebase antes de reactivar login real.
