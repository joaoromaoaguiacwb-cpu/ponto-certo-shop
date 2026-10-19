// Registro dos pedidos ENVIADOS pelo site (para o painel de vendas).
// Nesta demo ficam no localStorage deste navegador; só aparecem pedidos feitos aqui.
// Para ligar o Lovable Cloud, troque o corpo destas funções por chamadas ao banco (tabela "orders").

export type Order = {
  id: number;
  at: number; // data/hora do envio (ms)
  total: number; // valor do pedido (com desconto e taxa de entrega conhecida)
  units: number; // itens vendidos por unidade
  kg: number; // itens vendidos por peso (kg)
  coupon: string | null;
};
export type OrderInput = Omit<Order, "id" | "at">;

const KEY = "ponto-certo-orders-v1";
const MAX = 10000;

function read(): Order[] {
  try {
    const raw = localStorage.getItem(KEY);
    const d = raw ? JSON.parse(raw) : [];
    return Array.isArray(d) ? (d as Order[]) : [];
  } catch {
    return [];
  }
}

export async function listOrders(): Promise<Order[]> {
  return read();
}

export async function createOrder(input: OrderInput): Promise<void> {
  const list = read();
  const id = list.reduce((m, o) => Math.max(m, o.id), 0) + 1;
  const next = [...list, { id, at: Date.now(), ...input }];
  localStorage.setItem(KEY, JSON.stringify(next.slice(-MAX)));
}

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
      const total = r2(35 + rnd() * rnd() * 600);
      const units = 2 + Math.floor(rnd() * 20);
      const kg = rnd() < 0.5 ? Math.round(rnd() * 10) / 2 : 0;
      if (at <= now) out.push({ id: id++, at, total, units, kg, coupon: null });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}
