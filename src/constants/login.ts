export const LOGIN_DEFAULT_EMAIL = "admin@nuurgym.com";
export const LOGIN_DEFAULT_PASSWORD = "admin123";
export const LOGIN_ERROR_INVALID = "Email ou mot de passe incorrect";

export const LOGIN_TEST_ACCOUNTS = [
  { role: "Admin", email: "admin@nuurgym.com", password: "admin123" },
  { role: "Caissier", email: "nuur@nuurgym.com", password: "nuur123" },
  { role: "Contrôleur", email: "faby@nuurgym.com", password: "faby123" },
] as const;
