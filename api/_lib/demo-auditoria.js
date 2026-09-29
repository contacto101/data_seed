// Quién ve la demo de auditoría continua. La usan api/demo-auditoria.js, que la
// sirve, y api/portal.js, que muestra el acceso.
//
// DEMO_AC_ORGS es la lista de organizaciones habilitadas, separadas por coma.
// Vive en el proyecto de Vercel y no acá: el repositorio es público y los ids
// de organización no tienen por qué serlo. Vacía o ausente, nadie la ve.
export const RUTA_DEMO = '/auditoria-continua';

export function organizacionesConDemo(env = process.env) {
  return String(env.DEMO_AC_ORGS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function tieneDemo(identity, env = process.env) {
  const id = identity?.organization?.id;
  return Boolean(id) && organizacionesConDemo(env).includes(id);
}
