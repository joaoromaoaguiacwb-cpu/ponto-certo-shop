import { useEffect, useState } from "react";
import type { Product } from "@/data/products";
import { useProducts } from "./productsStore";

export type CartItem = { id: number; qty: number };
const KEY = "ponto-certo-cart";

export function useCart() {
  const products = useProducts();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

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
  const clear = () => setItems([]);

  const lines = items
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.id) as Product }))
    .filter((l) => l.product);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.product.price, 0);

  return { lines, count, total, add, setQty, remove, clear };
}
export type Cart = ReturnType<typeof useCart>;
