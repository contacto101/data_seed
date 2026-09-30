// Igual que api/auth/reset-password.js, pero borra las cookies __Host-pub_*
// de Pública en vez de las __Host-ds_* del portal.
//
// No es una ruta de Vercel (vive bajo _lib/, que Vercel no cuenta como
// función serverless): lo despacha api/auth/publica-router.js.
import { clearSessionCookies } from '../publica-cookies.js';
import { logAuthFailure } from '../diagnostics.js';
import { createPasswordResetHandler } from '../password-reset.js';

export function createPublicaResetPasswordHandler(options = {}) {
  return createPasswordResetHandler({
    clearCookies: clearSessionCookies,
    onFailure: logAuthFailure,
    ...options,
  });
}

export default createPublicaResetPasswordHandler();
