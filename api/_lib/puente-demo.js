// Firma de los pedidos que el sitio manda al motor de la demo (en el VPS).
//
// El motor no confía en nadie más: cada pedido lleva quién es (usuario y
// organización del portal, ya verificados acá) y una firma HMAC-SHA256, con
// DEMO_PUENTE_CLAVE, de
//
//     método \n ruta del motor \n momento \n usuario \n organización \n sha256(cuerpo)
//
// El motor rechaza una firma de más de 60 s, o si el cuerpo no es el firmado.
// La clave vive en el proyecto de Vercel y en el VPS, nunca en este repositorio.
import { createHash, createHmac } from 'node:crypto';

export function firmarPedido({ clave, metodo, ruta, usuario, org, cuerpo, momento = Math.floor(Date.now() / 1000) }) {
  const huella = createHash('sha256').update(cuerpo || Buffer.alloc(0)).digest('hex');
  const canonico = [String(metodo).toUpperCase(), ruta, momento, usuario, org, huella].join('\n');
  return {
    'X-Demo-Usuario': usuario,
    'X-Demo-Org': org,
    'X-Demo-Momento': String(momento),
    'X-Demo-Firma': createHmac('sha256', clave).update(canonico).digest('base64url'),
  };
}
