import type { Product } from "@/data/products";
import { round2 } from "./money";

// Produto vendido por quilo: campo "unit" ou, se não tiver, nome terminado em "kg".
export const unitOf = (p: Product): "kg" | "un" => p.unit ?? (/\bkg$/i.test(p.name.trim()) ? "kg" : "un");
export const stepOf = (p: Product) => (unitOf(p) === "kg" ? 0.5 : 1);

const tier = (p: Product) => (p.wholesale && p.wholesale.minQty > 0 && p.wholesale.price > 0 ? p.wholesale : null);

// Preço de atacado vale a partir da quantidade mínima.
export function unitPriceFor(p: Product, qty: number): number {
  const t = tier(p);
  return t && qty >= t.minQty ? t.price : p.price;
}
export const lineTotal = (p: Product, qty: number) => round2(unitPriceFor(p, qty) * qty);
export const hasWholesale = (p: Product) => tier(p) !== null;

const num = (n: number) => n.toLocaleString("pt-BR");
// "1,5 kg" para peso; só o número para unidade.
export const fmtQty = (p: Product, qty: number) => (unitOf(p) === "kg" ? `${num(qty)} kg` : String(qty));
// "6 un" / "5 kg" (para textos soltos)
export const labelQty = (p: Product, qty: number) => (unitOf(p) === "kg" ? `${num(qty)} kg` : `${qty} un`);
