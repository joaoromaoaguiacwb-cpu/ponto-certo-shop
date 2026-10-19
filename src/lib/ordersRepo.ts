// Registro dos pedidos ENVIADOS pelo site (para o painel de vendas).
// Ficam salvos no Lovable Cloud (tabela "orders"): aparecem pedidos de todos os clientes.

export type OrderLine = { id: number; name: string; qty: number; unit: "kg" | "un"; total: number };
export type Order = {
  id: number;
  at: number; // data/hora do envio (ms)
  total: number; // valor do pedido (com desconto e taxa de entrega conhecida)
  units: number; // itens vendidos por unidade
  kg: number; // itens vendidos por peso (kg)
  coupon: string | null;
  lines?: OrderLine[] | undefined; // produtos do pedido (para o ranking de mais vendidos)
};
export type OrderInput = Omit<Order, "id" | "at">;

import { fetchOrders, submitOrder } from "./store.functions";
import { getAdminToken } from "./admin";

// Só o painel (com a senha) consegue ler os pedidos.
export async function listOrders(): Promise<Order[]> {
  const token = getAdminToken();
  if (!token) return [];
  return fetchOrders({ data: { token } });
}

export async function createOrder(input: OrderInput): Promise<void> {
  await submitOrder({ data: input });
}

import { PRODUCTS } from "@/data/products";

// Dados de EXEMPLO para o painel não ficar vazio enquanto não há pedidos reais (nunca são salvos).
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r2 = (n: number) => Math.round(n * 100) / 100;

export function exampleOrders(now: number): Order[] {
  const out: Order[] = [];
  // ordem fixa de "popularidade" dos produtos (embaralhada com semente constante)
  const perm = PRODUCTS.map((_, i) => i);
  const shuf = mulberry32(42);
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(shuf() * (i + 1));
    [perm[i], perm[j]] = [perm[j] as number, perm[i] as number];
  }
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  let id = 1;
  for (let back = 150; back >= 0; back--) {
    const day = new Date(today);
    day.setDate(day.getDate() - back);
    const rnd = mulberry32(day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate());
    const wd = day.getDay();
    const n = (wd === 0 ? 4 : wd === 6 ? 14 : 9) + Math.floor(rnd() * 6);
    for (let i = 0; i < n; i++) {
      const at = day.getTime() + (7 * 60 + Math.floor(rnd() * 12 * 60)) * 60000;
      const nLines = 2 + Math.floor(rnd() * 7);
      const lines: OrderLine[] = [];
      for (let k = 0; k < nLines; k++) {
        const p = PRODUCTS[perm[Math.floor(rnd() * rnd() * PRODUCTS.length)] as number];
        if (!p || lines.some((l) => l.id === p.id)) continue;
        const kgItem = /\bkg$/i.test(p.name.trim());
        const qty = kgItem ? 0.5 + Math.floor(rnd() * 6) / 2 : 1 + Math.floor(rnd() * 6);
        lines.push({ id: p.id, name: p.name, qty, unit: kgItem ? "kg" : "un", total: r2(p.price * qty) });
      }
      const total = r2(lines.reduce((s, l) => s + l.total, 0));
      const units = lines.filter((l) => l.unit === "un").reduce((s, l) => s + l.qty, 0);
      const kg = lines.filter((l) => l.unit === "kg").reduce((s, l) => s + l.qty, 0);
      if (at <= now && lines.length > 0) out.push({ id: id++, at, total, units, kg, coupon: null, lines });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}
