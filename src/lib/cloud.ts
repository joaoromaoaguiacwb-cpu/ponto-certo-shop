// Leitura e gravação dos dados da loja no Lovable Cloud (tabela store_data: produtos, configurações, cupons).
import { supabase } from "@/integrations/supabase/client";
import { saveStoreData } from "./store.functions";
import { getAdminToken } from "./admin";

export type StoreKey = "products" | "settings" | "promos";

const cache = new Map<StoreKey, unknown>();

// null = ainda não salvo no Cloud (o site usa os exemplos)
export async function readStore<T>(key: StoreKey): Promise<T | null> {
  if (cache.has(key)) return cache.get(key) as T | null;
  const { data, error } = await supabase.from("store_data").select("data").eq("key", key).maybeSingle();
  if (error) throw new Error(error.message);
  const v = (data?.data ?? null) as T | null;
  cache.set(key, v);
  return v;
}

// value = null apaga (volta aos exemplos)
export async function writeStore(key: StoreKey, value: unknown): Promise<void> {
  await saveStoreData({ data: { token: getAdminToken() ?? "", key, data: value } });
  cache.set(key, value);
}
