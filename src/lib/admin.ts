// Login do painel: a senha é conferida no servidor (Lovable Cloud, secret ADMIN_PASSWORD).
// Aqui só guardamos o "passe" da sessão, que expira em 2 horas.
import { adminLogin } from "./store.functions";

const KEY = "ponto-certo-admin-token";

export function getAdminToken(): string | null {
  try {
    const t = sessionStorage.getItem(KEY);
    if (!t || Number(t.split(".")[0]) <= Date.now()) return null;
    return t;
  } catch {
    return null;
  }
}

export function isAdminSession(): boolean {
  return getAdminToken() !== null;
}

export async function loginAdmin(password: string): Promise<boolean> {
  const { token } = await adminLogin({ data: { password } });
  if (!token) return false;
  try {
    sessionStorage.setItem(KEY, token);
  } catch {
    /* nada */
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
