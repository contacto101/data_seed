// DataSeed Supabase Web config — staging placeholder.
// Reemplazar en ambiente de prueba con Project URL y anon public key.
// La anon key es pública por diseño; nunca usar service_role en frontend.

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
