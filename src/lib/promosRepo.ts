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
};
export type Promos = { coupons: Coupon[]; rewards: Reward[] };
export type CouponInput = Omit<Coupon, "id">;
export type RewardInput = Omit<Reward, "id">;

const KEY = "ponto-certo-promos-v1";

export const normCode = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

function read(): Promos {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { coupons: [], rewards: [] };
    const d = JSON.parse(raw);
    return {
      coupons: Array.isArray(d?.coupons) ? d.coupons : [],
      rewards: Array.isArray(d?.rewards) ? d.rewards : [],
    };
  } catch {
    return { coupons: [], rewards: [] };
  }
}

// Lança erro se não couber (localStorage cheio); quem chama mostra o aviso.
function write(d: Promos) {
  localStorage.setItem(KEY, JSON.stringify(d));
}

const nextId = (list: { id: number }[]) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;

export async function listPromos(): Promise<Promos> {
  return read();
}

export async function createCoupon(input: CouponInput): Promise<void> {
  const d = read();
  write({ ...d, coupons: [...d.coupons, { id: nextId(d.coupons), ...input, code: normCode(input.code) }] });
}
export async function updateCoupon(id: number, patch: Partial<CouponInput>): Promise<void> {
  const d = read();
  write({
    ...d,
    coupons: d.coupons.map((c) => (c.id === id ? { ...c, ...patch, code: normCode(patch.code ?? c.code) } : c)),
  });
}
export async function deleteCoupon(id: number): Promise<void> {
  const d = read();
  write({ ...d, coupons: d.coupons.filter((c) => c.id !== id) });
}

export async function createReward(input: RewardInput): Promise<void> {
  const d = read();
  write({ ...d, rewards: [...d.rewards, { id: nextId(d.rewards), ...input }] });
}
export async function updateReward(id: number, patch: Partial<RewardInput>): Promise<void> {
  const d = read();
  write({ ...d, rewards: d.rewards.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
}
export async function deleteReward(id: number): Promise<void> {
  const d = read();
  write({ ...d, rewards: d.rewards.filter((r) => r.id !== id) });
}
