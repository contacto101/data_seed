// DataSeed Supabase Web config
// 1) Supabase Dashboard → Project Settings → API.
// 2) Copiar Project URL y anon public key.
// 3) Copiar este archivo a js/supabase-config.js para staging/local.
//
// Nota: la anon key es pública por diseño. La seguridad real depende de RLS.
// No poner service_role keys ni secretos privados en archivos del frontend.

window.DS_SUPABASE_CONFIG = {
  url: "REPLACE_WITH_SUPABASE_PROJECT_URL",
  anonKey: "REPLACE_WITH_SUPABASE_ANON_KEY"
};

window.DS_AUTH_OPTIONS = {
  redirectAfterLogin: "dashboard.html",
  redirectAfterLogout: "login.html",
  requireEmailVerification: false,
  allowedEmailDomains: ["dataseed.cl"],
  enabledProviders: ["password", "google"]
};
