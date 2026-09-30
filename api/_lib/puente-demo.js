// Puente entre el sitio y el motor de la demo (en el VPS).
//
// El motor no confía en nadie más: cada pedido lleva quién es (usuario y
// organización del portal, ya verificados acá) y una firma HMAC-SHA256, con
// DEMO_PUENTE_CLAVE, de
//
//     método \n ruta del motor \n momento \n usuario \n organización \n sha256(cuerpo)
//
// El motor rechaza una firma de más de 60 s, o si el cuerpo no es el firmado.
// La dirección y la clave viven en el proyecto de Vercel y en el VPS, nunca en
// este repositorio.
import { createHash, createHmac } from 'node:crypto';

// estados del motor que el navegador tiene que ver tal cual: la pantalla reacciona a cada uno
const DEL_MOTOR = new Set([200, 400, 404, 409, 413, 429]);

export class MotorNoDisponible extends Error {}

export function firmarPedido({ clave, metodo, ruta, usuario, org, cuerpo, momento = Math.floor(Date.now() / 1000) }) {
  const huella = createHash('sha256').update(cuerpo).digest('hex');
  const canonico = [metodo, ruta, momento, usuario, org, huella].join('\n');
  return {
    'X-Demo-Usuario': usuario,
    'X-Demo-Org': org,
    'X-Demo-Momento': String(momento),
    'X-Demo-Firma': createHmac('sha256', clave).update(canonico).digest('base64url'),
  };
}

// Sin dirección https o sin una clave de largo razonable no hay puente: la demo
// queda no disponible, nunca abierta.
export function configuracionPuente(env) {
  const origen = String(env.DEMO_AC_ORIGIN || '').replace(/\/+$/, '');
  const clave = String(env.DEMO_PUENTE_CLAVE || '');
  return origen.startsWith('https://') && clave.length >= 32 ? { origen, clave } : null;
}

// Devuelve { status, texto } con un estado que la pantalla sabe leer, o lanza
// MotorNoDisponible. Un 401 del motor es una firma rechazada (clave distinta en
// los dos lados): no se reenvía, porque la pantalla lo leería como sesión
// vencida y recargaría sin fin. Tampoco se reenvían redirecciones, cabeceras ni
// errores del motor.
export async function pedirAlMotor({ puente, fetchImpl, recurso, plazoMs, identity, cuerpo }) {
  const headers = firmarPedido({
    clave: puente.clave,
    metodo: recurso.metodo,
    ruta: recurso.ruta,
    usuario: identity.user.id,
    org: identity.organization.id,
    cuerpo,
  });
  if (recurso.entrada) headers['Content-Type'] = recurso.entrada;

  let upstream;
  try {
    upstream = await fetchImpl(puente.origen + recurso.ruta, {
      method: recurso.metodo,
      headers,
      body: recurso.metodo === 'POST' ? cuerpo : undefined,
      redirect: 'manual',
      signal: AbortSignal.timeout(plazoMs),
    });
  } catch {
    throw new MotorNoDisponible();
  }
  if (!DEL_MOTOR.has(upstream.status) || (recurso.pagina && upstream.status !== 200)) throw new MotorNoDisponible();
  try {
    return { status: upstream.status, texto: await upstream.text() };
  } catch {
    throw new MotorNoDisponible();
  }
}
