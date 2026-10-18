import { useEffect, useSyncExternalStore } from "react";
import * as repo from "./promosRepo";

export type { Coupon, Reward, Promos, CouponInput, RewardInput } from "./promosRepo";

const EMPTY: repo.Promos = { coupons: [], rewards: [] };
let state: repo.Promos = EMPTY;
let loaded = false;
const subs = new Set<() => void>();

const set = (p: repo.Promos) => {
  state = p;
  subs.forEach((f) => f());
};
const subscribe = (f: () => void) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};
const refresh = async () => set(await repo.listPromos());

export async function loadPromos() {
  if (loaded) return;
  loaded = true;
  await refresh();
}

export const addCoupon = async (i: repo.CouponInput) => { await repo.createCoupon(i); await refresh(); };
export const editCoupon = async (id: number, p: Partial<repo.CouponInput>) => { await repo.updateCoupon(id, p); await refresh(); };
export const removeCoupon = async (id: number) => { await repo.deleteCoupon(id); await refresh(); };
export const addReward = async (i: repo.RewardInput) => { await repo.createReward(i); await refresh(); };
export const editReward = async (id: number, p: Partial<repo.RewardInput>) => { await repo.updateReward(id, p); await refresh(); };
export const removeReward = async (id: number) => { await repo.deleteReward(id); await refresh(); };

export function usePromos(): repo.Promos {
  const promos = useSyncExternalStore(subscribe, () => state, () => EMPTY);
  useEffect(() => {
    void loadPromos();
  }, []);
  return promos;
}
