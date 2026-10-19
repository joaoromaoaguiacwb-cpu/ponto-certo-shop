import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { brl, type Product } from "@/data/products";
import { fmtQty, hasWholesale, labelQty, stepOf, unitOf, unitPriceFor } from "@/lib/pricing";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product, onAdd }: { product: Product; onAdd: (id: number, q: number, note?: string) => void }) {
  const step = stepOf(product);
  const kg = unitOf(product) === "kg";
  const start = kg ? 1 : step; // peso começa em 1 kg (dá para baixar até 0,5 kg)
  const [qty, setQty] = useState(start);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const soldOut = !!product.soldOut;
  const price = unitPriceFor(product, qty);
  const atWholesale = price < product.price;
  const w = hasWholesale(product) ? product.wholesale : null;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border">
      <div className="relative">
        <ProductImage product={product} className={`aspect-square w-full ${soldOut ? "opacity-50 grayscale" : ""}`} />
        {soldOut ? (
          <span className="absolute left-2 top-2 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-background shadow-card">
            Esgotado
          </span>
        ) : (
          product.onSale && (
            <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-accent-foreground shadow-card">
              Promoção
            </span>
          )
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-foreground">{product.name}</h3>
        <div>
          <p className="text-lg font-extrabold text-primary">
            {brl(price)}{kg && <span className="text-xs font-semibold text-muted-foreground">/kg</span>}
            {atWholesale && <span className="ml-1.5 text-xs font-semibold text-muted-foreground line-through">{brl(product.price)}</span>}
          </p>
          {w && (
            <p className={`text-xs font-semibold ${atWholesale ? "text-primary" : "text-muted-foreground"}`}>
              Atacado: {brl(w.price)} a partir de {labelQty(product, w.minQty)}
            </p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between rounded-full bg-muted p-1">
          <button aria-label="Diminuir" disabled={soldOut} onClick={() => setQty((q) => Math.max(step, q - step))}
            className="grid h-8 w-8 place-items-center rounded-full bg-card text-primary shadow-sm disabled:opacity-50"><Minus size={16} /></button>
          <span className="font-bold">{fmtQty(product, qty)}</span>
          <button aria-label="Aumentar" disabled={soldOut} onClick={() => setQty((q) => q + step)}
            className="grid h-8 w-8 place-items-center rounded-full bg-card text-primary shadow-sm disabled:opacity-50"><Plus size={16} /></button>
        </div>
        {!soldOut && (showNote ? (
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={80} placeholder="Observação (ex: bem madura)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary" />
        ) : (
          <button onClick={() => setShowNote(true)} className="text-left text-xs font-semibold text-muted-foreground underline">+ Observação</button>
        ))}
        <button
          disabled={soldOut}
          onClick={() => {
            onAdd(product.id, qty, note);
            toast.success(`${labelQty(product, qty)} de ${product.name} adicionado!`);
            setQty(start);
            setNote("");
            setShowNote(false);
          }}
          className="flex items-center justify-center gap-1.5 rounded-full bg-secondary px-2 py-2.5 text-xs font-bold text-secondary-foreground transition active:scale-95 disabled:bg-muted disabled:text-muted-foreground sm:text-sm">
          <ShoppingCart size={16} /> {soldOut ? "Esgotado" : "Adicionar ao carrinho"}
        </button>
      </div>
    </div>
  );
}
