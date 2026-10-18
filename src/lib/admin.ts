// ⚠️ VERSÃO DE DEMONSTRAÇÃO: a senha é conferida aqui no navegador e fica visível no código do site.
// Na versão final (Lovable Cloud), a conferência deve ir para uma função de servidor, com a senha guardada como secret.
export const ADMIN_PASSWORD = "atacado321";

const KEY = "ponto-certo-admin";
const DURATION_MS = 2 * 60 * 60 * 1000; // sessão expira em 2 horas

export function isAdminSession(): boolean {
  try {
    return Number(sessionStorage.getItem(KEY)) > Date.now();
  } catch {
    return false;
  }
}

export function loginAdmin(password: string): boolean {
  if (password !== ADMIN_PASSWORD) return false;
  try {
    sessionStorage.setItem(KEY, String(Date.now() + DURATION_MS));
  } catch {
    /* sem sessionStorage: o painel abre, mas não lembra a sessão */
  }
  return true;
}

export function logoutAdmin() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nada */
  }
}
