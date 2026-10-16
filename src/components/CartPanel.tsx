import { Minus, Plus, Trash2, X } from "lucide-react";
import { brl } from "@/data/products";
import type { Cart } from "@/lib/cart";
import { ProductImage } from "./ProductImage";

export function CartPanel({ cart, onClose, onCheckout }: { cart: Cart; onClose: () => void; onCheckout: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay animate-in fade-in" onClick={onClose}>
      <aside onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col bg-background animate-in slide-in-from-right sm:max-w-md">
        <header className="flex items-center justify-between bg-primary px-4 py-4 text-primary-foreground">
          <h2 className="text-lg font-extrabold">🛒 Meu carrinho</h2>
          <button aria-label="Fechar" onClick={onClose} className="rounded-full p-1 hover:bg-primary-foreground/10"><X /></button>
        </header>
        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="text-6xl">🛍️</div>
            <p className="text-lg font-bold">Seu carrinho está vazio</p>
            <p className="text-sm text-muted-foreground">Que tal escolher alguns produtos fresquinhos?</p>
            <button onClick={onClose} className="mt-2 rounded-full bg-secondary px-6 py-3 font-bold text-secondary-foreground">Ver produtos</button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {cart.lines.map((l) => (
                <div key={l.id} className="flex gap-3 rounded-2xl bg-card p-2 ring-1 ring-border">
                  <ProductImage product={l.product} className="h-20 w-20 shrink-0 rounded-xl" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-semibold">{l.product.name}</p>
                      <button aria-label="Remover" onClick={() => cart.remove(l.id)} className="text-accent"><Trash2 size={18} /></button>
                    </div>
                    <p className="text-xs text-muted-foreground">{brl(l.product.price)} cada</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full bg-muted p-1">
                        <button aria-label="Diminuir" onClick={() => cart.setQty(l.id, l.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full bg-card text-primary"><Minus size={14} /></button>
                        <span className="w-5 text-center text-sm font-bold">{l.qty}</span>
                        <button aria-label="Aumentar" onClick={() => cart.setQty(l.id, l.qty + 1)} className="grid h-7 w-7 place-items-center rounded-full bg-card text-primary"><Plus size={14} /></button>
                      </div>
                      <p className="font-extrabold text-primary">{brl(l.qty * l.product.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={cart.clear} className="w-full py-2 text-sm font-semibold text-accent">Limpar carrinho</button>
            </div>
            <footer className="space-y-3 border-t bg-card p-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-extrabold text-primary">{brl(cart.total)}</span>
              </div>
              <button onClick={onCheckout} className="w-full rounded-full bg-primary py-4 text-lg font-extrabold text-primary-foreground shadow-card active:scale-[.98]">
                Finalizar compra
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
