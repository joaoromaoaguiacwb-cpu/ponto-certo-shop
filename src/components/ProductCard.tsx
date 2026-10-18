import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { brl, type Product } from "@/data/products";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product, onAdd }: { product: Product; onAdd: (id: number, q: number) => void }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border">
      <div className="relative">
        <ProductImage product={product} className="aspect-square w-full" />
        {product.onSale && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-accent-foreground shadow-card">
            Promoção
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-foreground">{product.name}</h3>
        <p className="text-lg font-extrabold text-primary">{brl(product.price)}</p>
        <div className="mt-auto flex items-center justify-between rounded-full bg-muted p-1">
          <button aria-label="Diminuir" onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid h-8 w-8 place-items-center rounded-full bg-card text-primary shadow-sm"><Minus size={16} /></button>
          <span className="font-bold">{qty}</span>
          <button aria-label="Aumentar" onClick={() => setQty((q) => q + 1)}
            className="grid h-8 w-8 place-items-center rounded-full bg-card text-primary shadow-sm"><Plus size={16} /></button>
        </div>
        <button
          onClick={() => { onAdd(product.id, qty); toast.success(`${qty}x ${product.name} adicionado!`); setQty(1); }}
          className="flex items-center justify-center gap-1.5 rounded-full bg-secondary px-2 py-2.5 text-xs font-bold text-secondary-foreground transition active:scale-95 sm:text-sm">
          <ShoppingCart size={16} /> Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}
