import { readStore, writeStore } from "./cloud";
// Cupons e prêmios. Nesta demo ficam no localStorage deste navegador.
// Para ligar o Lovable Cloud, troque o corpo destas funções por chamadas ao banco; o resto do site não muda.

export type Coupon = {
  id: number;
  code: string; // sempre em MAIÚSCULAS, sem espaços
  type: "percent" | "fixed"; // % de desconto ou valor fixo em R$
  value: number;
  minTotal: number; // compra mínima (0 = sem mínimo)
  active: boolean;
};
export type Reward = {
  id: number;
  name: string; // ex.: "1 refrigerante 600ml de brinde"
  everyAmount: number; // a cada R$ X em compras
  repeat: boolean; // true = ganha de novo a cada R$ X (acumula); false = ganha 1 vez ao atingir R$ X
  active: boolean;
  raffle?: boolean | undefined; // true = cupom de sorteio (a loja envia os números na confirmação do pedido)
};
export type Promos = { coupons: Coupon[]; rewards: Reward[] };
export type CouponInput = Omit<Coupon, "id">;
export type RewardInput = Omit<Reward, "id">;

const KEY = "ponto-certo-promos-v1";

// EXEMPLOS: aparecem enquanto nada foi salvo neste navegador. Edite, desative ou apague pelo painel.
const EXAMPLE_COUPONS: Coupon[] = [
  { id: 1, code: "BEMVINDO10", type: "percent", value: 10, minTotal: 50, active: true },
  { id: 2, code: "DESCONTO15", type: "fixed", value: 15, minTotal: 150, active: true },
  { id: 3, code: "ATACADO5", type: "percent", value: 5, minTotal: 500, active: true },
  { id: 4, code: "BLACK20", type: "percent", value: 20, minTotal: 200, active: false },
];
const EXAMPLE_REWARDS: Reward[] = [
  { id: 1, name: "Cupom para o sorteio do carro", everyAmount: 100, repeat: true, active: true, raffle: true },
  { id: 2, name: "Sacola ecológica de brinde", everyAmount: 150, repeat: false, active: false, raffle: false },
];

export const normCode = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

async function read(): Promise<Promos> {
  const d = await readStore<Promos>("promos");
  if (!d) return { coupons: [...EXAMPLE_COUPONS], rewards: [...EXAMPLE_REWARDS] };
  return {
    coupons: Array.isArray(d?.coupons) ? d.coupons : [],
    rewards: Array.isArray(d?.rewards) ? d.rewards : [],
  };
}

// Lança erro se não couber (localStorage cheio); quem chama mostra o aviso.
async function write(d: Promos) {
  await writeStore("promos", d);
}

const nextId = (list: { id: number }[]) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;

export async function listPromos(): Promise<Promos> {
  return (await read());
}

export async function createCoupon(input: CouponInput): Promise<void> {
  const d = (await read());
  await write({ ...d, coupons: [...d.coupons, { id: nextId(d.coupons), ...input, code: normCode(input.code) }] });
}
export async function updateCoupon(id: number, patch: Partial<CouponInput>): Promise<void> {
  const d = (await read());
  await write({
    ...d,
    coupons: d.coupons.map((c) => (c.id === id ? { ...c, ...patch, code: normCode(patch.code ?? c.code) } : c)),
  });
}
export async function deleteCoupon(id: number): Promise<void> {
  const d = (await read());
  await write({ ...d, coupons: d.coupons.filter((c) => c.id !== id) });
}

export async function createReward(input: RewardInput): Promise<void> {
  const d = (await read());
  await write({ ...d, rewards: [...d.rewards, { id: nextId(d.rewards), ...input }] });
}
export async function updateReward(id: number, patch: Partial<RewardInput>): Promise<void> {
  const d = (await read());
  await write({ ...d, rewards: d.rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
}
export async function deleteReward(id: number): Promise<void> {
  const d = (await read());
  await write({ ...d, rewards: d.rewards.filter((r) => r.id !== id) });
}
