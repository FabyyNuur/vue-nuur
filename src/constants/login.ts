const IS_DEV = typeof import.meta !== "undefined" && !!import.meta.env?.DEV;

export const LOGIN_DEFAULT_EMAIL = IS_DEV ? "admin@nuurgym.com" : "";
export const LOGIN_DEFAULT_PASSWORD = IS_DEV ? "admin123" : "";
export const LOGIN_ERROR_INVALID = "Email ou mot de passe incorrect";

const LOGIN_TEST_ACCOUNTS_DEV = [
  { role: "Admin", email: "admin@nuurgym.com", password: "admin123" },
  { role: "Caissier", email: "nuur@nuurgym.com", password: "nuur123" },
  { role: "Contrôleur", email: "faby@nuurgym.com", password: "faby123" },
] as const;

export type LoginTestAccount = (typeof LOGIN_TEST_ACCOUNTS_DEV)[number];

export const LOGIN_TEST_ACCOUNTS: readonly LoginTestAccount[] = IS_DEV
  ? LOGIN_TEST_ACCOUNTS_DEV
  : [];
