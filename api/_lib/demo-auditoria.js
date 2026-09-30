// Quién ve la demo de auditoría continua. La usan api/demo-auditoria.js, que la
// sirve, api/portal.js, que muestra el acceso, y el inicio de sesión, que lleva
// directo a ella a quien la tiene.
//
// DEMO_AC_ORGS es la lista de organizaciones habilitadas, separadas por coma.
// Vive en el proyecto de Vercel y no acá: el repositorio es público y los ids
// de organización no tienen por qué serlo. Vacía o ausente, nadie la ve.
//
// Un acceso de evaluación vence: `id@2026-10-05T23:59:59-03:00` deja entrar a esa
// organización hasta ese momento y después no. La fecha va siempre completa y con
// zona horaria; cualquier otra forma (una fecha sola, sin zona, mal escrita) cierra
// el acceso: no se abre por un error de escritura.
export const RUTA_DEMO = '/auditoria-continua';

const FECHA_CON_ZONA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

// El id de una entrada `id` o `id@fecha`, o vacío si venció o la fecha no vale.
function idVigente(entrada, ahora) {
  const [id, ...resto] = entrada.split('@');
  if (!resto.length) return id.trim();
  const fecha = resto.join('@').trim();
  return FECHA_CON_ZONA.test(fecha) && ahora <= Date.parse(fecha) ? id.trim() : '';
}

export function organizacionesConDemo(env = process.env, ahora = Date.now()) {
  return String(env.DEMO_AC_ORGS || '')
    .split(',')
    .map((entrada) => idVigente(entrada, ahora))
    .filter(Boolean);
}

export function tieneDemo(identity, env = process.env) {
  const id = identity?.organization?.id;
  return Boolean(id) && organizacionesConDemo(env).includes(id);
}

// Adónde va la persona al entrar: una organización con la demo no pasa por el portal.
// site/login.js acepta sólo estos dos destinos.
export function destinoTrasLogin(identity, env = process.env) {
  return tieneDemo(identity, env) ? RUTA_DEMO : '/portal';
}
