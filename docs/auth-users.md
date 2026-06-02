# Usuarios iniciales — DataSeed Auth

Estado: pendiente de correos corporativos confirmados.

## Lo que sí está listo

El login ya permite que cualquier usuario autorizado por Firebase entre con Google si:

1. Tiene cuenta Google corporativa.
2. Su dominio está permitido en `allowedEmailDomains`.
3. El dominio está autorizado en Firebase Auth.
4. El proveedor Google está activado.

Configuración recomendada:

```js
allowedEmailDomains: ["dataseed.cl"]
```

## Correos pendientes

| Persona / referencia | Email corporativo | Estado |
|---|---|---|
| Arturo | Pendiente | No confirmado |
| Daniel | Pendiente | No confirmado |
| @104544402972808 | Pendiente | No confirmado |
| @86058427539532 | Pendiente | No confirmado |

## Cómo dar acceso sin crear usuarios manualmente

Con Google Login corporativo no hace falta crear uno por uno antes. El primer login crea el usuario en Firebase Auth automáticamente si el dominio está permitido.

## Si quieren control manual

Se puede crear un allowlist explícito después:

```text
allowedEmails = [
  "persona@dataseed.cl",
  "otra@dataseed.cl"
]
```

Para eso necesito que compartan los correos corporativos reales.
