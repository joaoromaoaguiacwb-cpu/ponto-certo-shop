import type { Coupon, Reward } from "./promosRepo";
import { round2 } from "./money";

export function couponDiscount(c: Coupon, subtotal: number): number {
  const raw = c.type === "percent" ? subtotal * (c.value / 100) : c.value;
  return round2(Math.min(subtotal, Math.max(0, raw)));
}

export type EarnedReward = { reward: Reward; qty: number };
export type NextReward = { reward: Reward; missing: number };

// Prêmios são calculados sobre o valor FINAL da compra (já com o desconto do cupom).
export function calcRewards(total: number, rewards: Reward[]) {
  const earned: EarnedReward[] = [];
  const next: NextReward[] = [];
  const cents = Math.round(total * 100);
  for (const r of rewards) {
    const step = Math.round(r.everyAmount * 100);
    if (!r.active || step <= 0) continue;
    const times = Math.floor(cents / step);
    const qty = r.repeat ? times : Math.min(1, times);
    if (qty > 0) earned.push({ reward: r, qty });
    if (r.repeat || qty === 0) next.push({ reward: r, missing: ((times + 1) * step - cents) / 100 });
  }
  next.sort((a, b) => a.missing - b.missing);
  return { earned, next };
}

export const rewardLabel = (e: EarnedReward) => `${e.qty > 1 ? `${e.qty}x ` : ""}${e.reward.name}`;
