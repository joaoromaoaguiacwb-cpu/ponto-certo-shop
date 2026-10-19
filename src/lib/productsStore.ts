import { useEffect, useSyncExternalStore } from "react";
import { PRODUCTS as SEED, type Product } from "@/data/products";
import * as repo from "./productsRepo";

export type { ProductInput } from "./productsRepo";

// Começa com a lista original (igual no servidor e no navegador, sem erro de hidratação)
// e troca pela lista salva assim que o site abre no navegador.
let state: Product[] = SEED;
let loaded = false;
let ready = false;
const subs = new Set<() => void>();

const set = (list: Product[]) => {
  state = list;
  subs.forEach((f) => f());
};
const subscribe = (f: () => void) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};

export async function loadProducts() {
  if (loaded) return;
  loaded = true;
  const list = await repo.listProducts();
  ready = true;
  set(list);
}

export async function addProduct(input: repo.ProductInput) {
  await repo.createProduct(input);
  set(await repo.listProducts());
}

export async function editProduct(id: number, patch: Partial<repo.ProductInput>) {
  await repo.updateProduct(id, patch);
  set(await repo.listProducts());
}

export async function removeProduct(id: number) {
  await repo.deleteProduct(id);
  set(await repo.listProducts());
}

export async function adjustPrices(category: string, percent: number) {
  const r = await repo.adjustPrices(category, percent);
  set(await repo.listProducts());
  return r;
}

export async function restorePrices(before: repo.PriceSnapshot) {
  await repo.restorePrices(before);
  set(await repo.listProducts());
}

export async function restoreProducts() {
  await repo.resetProducts();
  set(await repo.listProducts());
}

export function useProductsReady(): boolean {
  return useSyncExternalStore(subscribe, () => ready, () => false);
}

export function useProducts(): Product[] {
  const products = useSyncExternalStore(subscribe, () => state, () => SEED);
  useEffect(() => {
    void loadProducts();
  }, []);
  return products;
}
