import { useEffect, useState } from "react";
import { brl } from "@/data/products";
import { useProducts } from "./productsStore";
import { usePromos } from "./promosStore";
import { useSettings } from "./settingsStore";
import { normCode } from "./promosRepo";
import { calcRewards, couponDiscount } from "./order";
import { round2 } from "./money";
import { lineTotal, unitPriceFor } from "./pricing";

export type CartItem = { id: number; qty: number; note?: string | undefined };
const KEY = "ponto-certo-cart";

export function useCart() {
  const products = useProducts();
  const { coupons, rewards } = usePromos();
  const settings = useSettings();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* vazio */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(items)); }, [items, ready]);

  const add = (id: number, qty: number, note?: string) => {
    const n = note?.trim() || undefined;
    setItems((c) => c.some((i) => i.id === id)
      ? c.map((i) => i.id === id ? { ...i, qty: i.qty + qty, note: n ?? i.note } : i)
      : [...c, { id, qty, note: n }]);
  };
  const setQty = (id: number, qty: number) =>
    setItems((c) => qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => i.id === id ? { ...i, qty } : i));
  const setNote = (id: number, note: string) =>
    setItems((c) => c.map((i) => i.id === id ? { ...i, note: note || undefined } : i));
  const remove = (id: number) => setItems((c) => c.filter((i) => i.id !== id));
  const clear = () => { setItems([]); setCode(""); };

  const lines = items.flatMap((i) => {
    const product = products.find((p) => p.id === i.id);
    if (!product) return [];
    return [{
      ...i,
      product,
      unitPrice: unitPriceFor(product, i.qty),
      lineTotal: lineTotal(product, i.qty),
      soldOut: !!product.soldOut,
    }];
  });
  const count = lines.length > 0 ? lines.reduce((s, l) => s + Math.ceil(l.qty), 0) : 0;
  const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
  const hasSoldOut = lines.some((l) => l.soldOut);
  const minOrder = settings.minOrder;
  const missingMin = minOrder > 0 && subtotal < minOrder ? round2(minOrder - subtotal) : 0;

  // Cupom aplicado: só vale se ainda estiver ativo e a compra atingir o mínimo.
  const found = code ? coupons.find((c) => c.active && normCode(c.code) === code) : undefined;
  const minOk = !!found && subtotal >= found.minTotal;
  const coupon = found && minOk ? found : null;
  const couponProblem = !code ? null : !found ? "Este cupom não está mais disponível." : !minOk ? `Cupom válido para compras a partir de ${brl(found.minTotal)}.` : null;
  const discount = coupon ? couponDiscount(coupon, subtotal) : 0;
  const total = round2(subtotal - discount);
  const { earned, next } = calcRewards(total, rewards);
  const hasCoupons = coupons.some((c) => c.active);

  // Retorna a mensagem de erro, ou null se o cupom foi aplicado.
  const applyCoupon = (raw: string): string | null => {
    const c = normCode(raw);
    if (!c) return "Digite o código do cupom.";
    const f = coupons.find((x) => x.active && normCode(x.code) === c);
    if (!f) return "Cupom inválido.";
    if (subtotal < f.minTotal) return `Cupom válido para compras a partir de ${brl(f.minTotal)}.`;
    setCode(c);
    return null;
  };
  const removeCoupon = () => setCode("");

  return {
    lines, count, subtotal, discount, total, coupon, couponCode: code, couponProblem, hasCoupons, earned, next,
    hasSoldOut, minOrder, missingMin,
    applyCoupon, removeCoupon, add, setQty, setNote, remove, clear,
  };
}
export type Cart = ReturnType<typeof useCart>;
