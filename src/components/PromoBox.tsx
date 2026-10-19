import { useState } from "react";
import { Gift, Ticket, X } from "lucide-react";
import { brl } from "@/data/products";
import type { Cart } from "@/lib/cart";
import { rewardLabel } from "@/lib/order";

// Campo de cupom + prêmios ganhos / quanto falta para o próximo prêmio.
export function PromoBox({ cart, hideEarned = false }: { cart: Cart; hideEarned?: boolean | undefined }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    const err = cart.applyCoupon(text);
    setError(err);
    if (!err) setText("");
  };

  const show = cart.hasCoupons || !!cart.couponCode || cart.earned.length > 0 || cart.next.length > 0;
  if (!show) return null;

  return (
    <div className="space-y-2">
      {(cart.hasCoupons || cart.couponCode) &&
        (cart.couponCode ? (
          <div className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm ring-1 ${cart.coupon ? "bg-muted ring-border" : "bg-card ring-accent"}`}>
            <span className="flex min-w-0 items-center gap-1.5 font-semibold">
              <Ticket size={16} className="shrink-0 text-primary" />
              {cart.coupon ? <>Cupom <b>{cart.coupon.code}</b>: -{brl(cart.discount)}</> : <span className="text-accent">{cart.couponProblem}</span>}
            </span>
            <button aria-label="Remover cupom" onClick={() => { cart.removeCoupon(); setError(null); }} className="shrink-0 rounded-full p-1"><X size={16} /></button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input value={text} onChange={(e) => { setText(e.target.value); setError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") apply(); }}
                placeholder="Cupom de desconto" autoCapitalize="characters"
                className="min-w-0 flex-1 rounded-full border-2 border-border bg-background px-4 py-2 text-sm uppercase outline-none placeholder:normal-case focus:border-primary" />
              <button onClick={apply} className="shrink-0 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground">Aplicar</button>
            </div>
            {error && <p className="mt-1 text-xs font-semibold text-accent">{error}</p>}
          </div>
        ))}

      {!hideEarned && cart.earned.map((e) => (
        <p key={e.reward.id} className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold">
          <Gift size={16} className="shrink-0 text-primary" /> Você ganhou: {rewardLabel(e)}
        </p>
      ))}
      {cart.next.slice(0, 2).map((n) => (
        <p key={n.reward.id} className="text-xs text-muted-foreground">
          🎁 Faltam <b>{brl(n.missing)}</b> para ganhar: {n.reward.name}
        </p>
      ))}
    </div>
  );
}
