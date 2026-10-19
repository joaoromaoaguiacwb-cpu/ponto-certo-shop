// Funções de servidor da loja: login do painel, gravação dos dados e pedidos.
// A senha do painel fica guardada no Lovable Cloud (secret ADMIN_PASSWORD), nunca no site.
import { createServerFn } from "@tanstack/react-start";

const SESSION_MS = 2 * 60 * 60 * 1000; // sessão do painel: 2 horas
const KEYS = ["products", "settings", "promos"] as const;
type StoreKey = (typeof KEYS)[number];

async function sign(exp: number): Promise<string> {
  const secret = process.env["ADMIN_PASSWORD"] ?? "";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`admin:${exp}`));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function checkToken(token: unknown) {
  if (typeof token !== "string") throw new Error("Sessão do painel expirada. Entre de novo.");
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || exp < Date.now() || !sig || sig !== (await sign(exp))) throw new Error("Sessão do painel expirada. Entre de novo.");
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => ({ password: String(d?.password ?? "") }))
  .handler(async ({ data }) => {
    const real = process.env["ADMIN_PASSWORD"];
    if (!real || data.password !== real) return { token: null as string | null, exp: 0 };
    const exp = Date.now() + SESSION_MS;
    return { token: `${exp}.${await sign(exp)}`, exp };
  });

export const saveStoreData = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; key: StoreKey; data: unknown }) => {
    if (!KEYS.includes(d?.key)) throw new Error("Chave inválida");
    return d;
  })
  .handler(async ({ data }) => {
    await checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.data === null) {
      const { error } = await supabaseAdmin.from("store_data").delete().eq("key", data.key);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { error } = await supabaseAdmin
      .from("store_data")
      .upsert({ key: data.key, data: data.data as never, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

type Line = { id: number; name: string; qty: number; unit: "kg" | "un"; total: number };
type OrderIn = { total: number; units: number; kg: number; coupon: string | null; lines?: Line[] | undefined };

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 1e7 ? v : 0);

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((d: OrderIn) => ({
    total: num(d?.total),
    units: num(d?.units),
    kg: num(d?.kg),
    coupon: typeof d?.coupon === "string" ? d.coupon.slice(0, 40) : null,
    lines: (Array.isArray(d?.lines) ? d.lines : []).slice(0, 500).map((l) => ({
      id: Math.floor(num(l?.id)),
      name: String(l?.name ?? "").slice(0, 120),
      qty: num(l?.qty),
      unit: l?.unit === "kg" ? ("kg" as const) : ("un" as const),
      total: num(l?.total),
    })),
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("orders").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const fetchOrders = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    await checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const out: { id: number; at: number; total: number; units: number; kg: number; coupon: string | null; lines: Line[] }[] = [];
    for (let from = 0; ; from += 1000) {
      const { data: rows, error } = await supabaseAdmin.from("orders").select("*").order("id").range(from, from + 999);
      if (error) throw new Error(error.message);
      for (const r of rows ?? [])
        out.push({ id: Number(r.id), at: new Date(r.at).getTime(), total: Number(r.total), units: Number(r.units), kg: Number(r.kg), coupon: r.coupon, lines: (r.lines as Line[]) ?? [] });
      if (!rows || rows.length < 1000) break;
    }
    return out;
  });
