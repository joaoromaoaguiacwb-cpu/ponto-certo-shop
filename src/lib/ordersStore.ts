import { useEffect, useSyncExternalStore } from "react";
import * as repo from "./ordersRepo";

export type { Order, OrderInput } from "./ordersRepo";

const EMPTY: repo.Order[] = [];
let state: repo.Order[] = EMPTY;
let loaded = false;
const subs = new Set<() => void>();

const set = (l: repo.Order[]) => {
  state = l;
  subs.forEach((f) => f());
};
const subscribe = (f: () => void) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};

export async function loadOrders() {
  if (loaded) return;
  loaded = true;
  try {
    set(await repo.listOrders());
  } catch {
    loaded = false;
  }
}

export async function addOrder(input: repo.OrderInput) {
  await repo.createOrder(input);
  if (loaded) set(await repo.listOrders());
}

// Recarrega (ex.: logo depois de entrar no painel)
export async function reloadOrders() {
  loaded = true;
  set(await repo.listOrders());
}

export function useOrders(): repo.Order[] {
  const list = useSyncExternalStore(subscribe, () => state, () => EMPTY);
  useEffect(() => {
    void loadOrders();
  }, []);
  return list;
}
