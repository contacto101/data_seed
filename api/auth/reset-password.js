import { clearSessionCookies } from './_lib/cookies.js';
import { logAuthFailure } from './_lib/diagnostics.js';
import { createPasswordResetHandler } from './_lib/password-reset.js';

export const config = { runtime: 'nodejs' };

export function createResetPasswordHandler(options = {}) {
  return createPasswordResetHandler({
    clearCookies: clearSessionCookies,
    onFailure: logAuthFailure,
    ...options,
  });
}

export default createResetPasswordHandler();
