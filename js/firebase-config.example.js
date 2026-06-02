// DataSeed Firebase Web config
// 1) Crear proyecto Firebase/GCP.
// 2) Registrar una Web App.
// 3) Copiar este archivo a js/firebase-config.js.
// 4) Reemplazar valores con la configuración oficial de Firebase.
//
// Nota: Firebase web config no es un secreto, pero las reglas/Auth authorized domains
// son las que protegen el proyecto. No poner service account keys aquí.

window.DS_FIREBASE_CONFIG = {
  apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_PROJECT_ID.firebaseapp.com",
  projectId: "REPLACE_WITH_PROJECT_ID",
  storageBucket: "REPLACE_WITH_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_WITH_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_FIREBASE_APP_ID"
};

window.DS_AUTH_OPTIONS = {
  redirectAfterLogin: "dashboard.html",
  redirectAfterLogout: "login.html",
  requireEmailVerification: true,
  // Seguridad del portal interno: la validación real ocurre server-side en Cloud Functions.
  // Esta allowlist cliente solo mejora UX antes de llamar al backend.
  allowedEmailDomains: ["dataseed.cl"],
  primaryProvider: "google",
  enabledProviders: ["google"]
};
