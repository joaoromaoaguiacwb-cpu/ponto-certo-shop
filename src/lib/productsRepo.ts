import { readStore, writeStore } from "./cloud";
// ÚNICA camada de acesso aos produtos. Nesta demo os dados ficam no localStorage deste navegador.
// Para ligar o Lovable Cloud, troque o corpo destas funções por chamadas ao banco; o resto do site não muda.
import { PRODUCTS as SEED, type Product } from "@/data/products";

const KEY = "ponto-certo-products-v1";

import { round2 } from "./money";

export type ProductInput = {
  name: string;
  price: number;
  category: string;
  image: string;
  onSale: boolean;
  soldOut: boolean;
  unit: "kg" | "un";
  wholesale: { minQty: number; price: number } | null; // preço de atacado a partir de X
};
export type PriceSnapshot = Record<number, { price: number; wholesale: Product["wholesale"] }>;

// EXEMPLOS: produtos em promoção e preços de atacado (editáveis pelo painel; "Restaurar originais" volta a isto).
const EXAMPLE_SALE = new Set([1, 37, 38, 91, 111, 114, 116, 147, 165, 183]);
const EXAMPLE_WHOLESALE: Record<number, { minQty: number; price: number }> = {
  37: { minQty: 5, price: 15.9 }, // Peito de Frango kg: a partir de 5 kg
  92: { minQty: 10, price: 7.2 }, // Feijão Carioca 1kg: a partir de 10 un
  111: { minQty: 6, price: 8.9 }, // Refrigerante Cola 2L: a partir de 6 un
  113: { minQty: 12, price: 2.19 }, // Água Mineral 1,5L: a partir de 12 un
};

const seed = (): Product[] =>
  SEED.map((p) => ({ ...p, onSale: EXAMPLE_SALE.has(p.id), wholesale: EXAMPLE_WHOLESALE[p.id] ?? null }));

async function read(): Promise<Product[] | null> {
  const d = await readStore<Product[]>("products");
  return Array.isArray(d) ? d : null;
}

// Lança erro se não couber (localStorage cheio); quem chama mostra o aviso.
async function write(list: Product[]) {
  await writeStore("products", list);
}

export async function listProducts(): Promise<Product[]> {
  return (await read()) ?? seed();
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const list = (await read()) ?? seed();
  const id = list.reduce((m, p) => Math.max(m, p.id), 0) + 1;
  const product: Product = { id, ...input, fallback: "" };
  await write([...list, product]);
  return product;
}

export async function updateProduct(id: number, patch: Partial<ProductInput>): Promise<void> {
  const list = (await read()) ?? seed();
  await write(
    list.map((p) => {
      if (p.id !== id) return p;
      const next = { ...p, ...patch };
      // Se a foto mudou, o plano B antigo não vale mais.
      if (patch.image !== undefined && patch.image !== p.image) next.fallback = "";
      return next;
    }),
  );
}

export async function deleteProduct(id: number): Promise<void> {
  const list = (await read()) ?? seed();
  await write(list.filter((p) => p.id !== id));
}

export async function resetProducts(): Promise<void> {
  await writeStore("products", null);
}

// Reajusta preços (e o preço de atacado) de uma categoria ou de todos. Retorna o estado anterior para desfazer.
export async function adjustPrices(category: string, percent: number): Promise<{ count: number; before: PriceSnapshot }> {
  const list = (await read()) ?? seed();
  const before: PriceSnapshot = {};
  const factor = 1 + percent / 100;
  const next = list.map((p) => {
    if (category !== "todos" && p.category !== category) return p;
    before[p.id] = { price: p.price, wholesale: p.wholesale ?? null };
    return {
      ...p,
      price: Math.max(0.01, round2(p.price * factor)),
      wholesale: p.wholesale ? { ...p.wholesale, price: Math.max(0.01, round2(p.wholesale.price * factor)) } : p.wholesale,
    };
  });
  await write(next);
  return { count: Object.keys(before).length, before };
}

export async function restorePrices(before: PriceSnapshot): Promise<void> {
  const list = (await read()) ?? seed();
  await write(
    list.map((p) => {
      const b = before[p.id];
      return b ? { ...p, price: b.price, wholesale: b.wholesale } : p;
    }),
  );
}
