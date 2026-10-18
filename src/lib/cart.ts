import { useEffect, useState } from "react";
import { brl, type Product } from "@/data/products";
import { useProducts } from "./productsStore";
import { usePromos } from "./promosStore";
import { normCode } from "./promosRepo";
import { calcRewards, couponDiscount } from "./order";
import { round2 } from "./money";

export type CartItem = { id: number; qty: number };
const KEY = "ponto-certo-cart";

export function useCart() {
  const products = useProducts();
  const { coupons, rewards } = usePromos();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* vazio */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(items)); }, [items, ready]);

  const add = (id: number, qty: number) =>
    setItems((c) => c.some((i) => i.id === id) ? c.map((i) => i.id === id ? { ...i, qty: i.qty + qty } : i) : [...c, { id, qty }]);
  const setQty = (id: number, qty: number) =>
    setItems((c) => qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => i.id === id ? { ...i, qty } : i));
  const remove = (id: number) => setItems((c) => c.filter((i) => i.id !== id));
  const clear = () => { setItems([]); setCode(""); };

  const lines = items
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.id) as Product }))
    .filter((l) => l.product);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = round2(lines.reduce((s, l) => s + l.qty * l.product.price, 0));

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

  return { lines, count, subtotal, discount, total, coupon, couponCode: code, couponProblem, hasCoupons, earned, next, applyCoupon, removeCoupon, add, setQty, remove, clear };
}
export type Cart = ReturnType<typeof useCart>;
