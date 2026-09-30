// Último paso de «¿Olvidaste tu contraseña?», compartido por el portal
// (api/auth/reset-password.js) y Pública (publica-handlers/reset-password.js).
//
// /auth/v1/recover se llama sin code_challenge, así que Supabase usa el flujo
// implícito: el enlace del correo termina en
// <redirect_to>#access_token=…&refresh_token=…&type=recovery. El fragmento no
// viaja al servidor; la página lo lee, lo borra de la barra de direcciones y
// manda solo el access_token aquí, junto con la contraseña nueva. No se guarda
// en localStorage ni en cookies.
//
// Tras cambiar la contraseña se revoca la sesión de recuperación y se borran
// las cookies de sesión de este navegador. No se abre sesión: el usuario entra
// por el login normal, que es el que valida organización y membresía.
import {
  isSameOriginRequest,
  methodNotAllowed,
  parseRequestBody,
  sendJson,
} from './http.js';
import { SupabaseRequestError, signOut, updateUserPassword } from './supabase.js';

export const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 1024;
const MAX_TOKEN_LENGTH = 8192;
const JWT_SHAPE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

const EXPIRED_LINK = 'El enlace de recuperación expiró o ya se usó. Pide uno nuevo desde «¿Olvidaste tu contraseña?».';

function readAccessToken(body) {
  const token = typeof body?.access_token === 'string' ? body.access_token : '';
  if (!token || token.length > MAX_TOKEN_LENGTH || !JWT_SHAPE.test(token)) return null;
  return token;
}

function readPassword(body) {
  const password = typeof body?.password === 'string' ? body.password : '';
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) return null;
  return password;
}

function providerErrorResponse(error) {
  if (!(error instanceof SupabaseRequestError) || error.status >= 500) {
    return [503, 'No pudimos cambiar tu contraseña. Intenta nuevamente.'];
  }
  if (error.status === 401 || error.status === 403) return [401, EXPIRED_LINK];
  if (error.status === 429) return [429, 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.'];
  if (error.code === 'same_password') {
    return [400, 'La contraseña nueva debe ser distinta de la anterior.'];
  }
  if (error.code === 'weak_password') {
    return [400, 'La contraseña es demasiado débil. Usa una más larga o combina letras, números y símbolos.'];
  }
  return [400, 'No pudimos cambiar tu contraseña. Pide un enlace nuevo e intenta otra vez.'];
}

export function createPasswordResetHandler({
  env = process.env,
  update = updateUserPassword,
  revoke = signOut,
  clearCookies,
  onFailure = () => {},
} = {}) {
  if (typeof clearCookies !== 'function') {
    throw new TypeError('clearCookies is required');
  }

  return async function passwordResetHandler(req, res) {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    if (!isSameOriginRequest(req, env)) {
      return sendJson(res, 403, { error: 'Solicitud no autorizada.' });
    }

    const body = parseRequestBody(req);
    const accessToken = readAccessToken(body);
    if (!accessToken) return sendJson(res, 401, { error: EXPIRED_LINK });

    const password = readPassword(body);
    if (!password) {
      return sendJson(res, 400, {
        error: `Usa una contraseña de al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      });
    }

    let user;
    try {
      user = await update(accessToken, password, { env });
    } catch (error) {
      onFailure('password_reset', error);
      const [status, message] = providerErrorResponse(error);
      return sendJson(res, status, { error: message });
    }

    try {
      // Sin scope explícito GoTrue cierra todas las sesiones del usuario: si
      // alguien más tenía una abierta, el cambio de contraseña la corta.
      await revoke(accessToken, { env });
    } catch (error) {
      onFailure('password_reset_revoke', error);
    }

    res.setHeader('Set-Cookie', clearCookies());
    return sendJson(res, 200, {
      ok: true,
      email: typeof user?.email === 'string' ? user.email : null,
      message: 'Tu contraseña quedó actualizada. Ya puedes iniciar sesión con ella.',
    });
  };
}
