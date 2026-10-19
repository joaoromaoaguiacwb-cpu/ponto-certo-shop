import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { brl, STORE_WHATSAPP } from "@/data/products";
import type { Cart } from "@/lib/cart";
import { rewardLabel } from "@/lib/order";
import { fmtQty, unitOf } from "@/lib/pricing";
import { round2 } from "@/lib/money";
import { useSettings } from "@/lib/settingsStore";
import { addOrder } from "@/lib/ordersStore";
import { PromoBox } from "./PromoBox";

const PAYMENTS = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"];
type Form = { nome: string; telefone: string; rua: string; numero: string; bairro: string; cidade: string; complemento: string; pagamento: string; troco: string };
const empty: Form = { nome: "", telefone: "", rua: "", numero: "", bairro: "", cidade: "", complemento: "", pagamento: "", troco: "" };

// Dados do cliente ficam salvos neste aparelho (localStorage) para os próximos pedidos.
const SAVED_KEY = "ponto-certo-customer";
type Saved = Partial<Omit<Form, "troco">> & { modo?: "entrega" | "retirada"; outroBairro?: boolean };
function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

export function Checkout({ cart, onBack, onDone }: { cart: Cart; onBack: () => void; onDone: () => void }) {
  const settings = useSettings();
  const [saved, setSaved] = useState<Saved | null>(loadSaved);
  const [f, setF] = useState<Form>(() => ({
    ...empty,
    nome: saved?.nome ?? "", telefone: saved?.telefone ?? "", rua: saved?.rua ?? "", numero: saved?.numero ?? "",
    bairro: saved?.bairro ?? "", cidade: saved?.cidade ?? "", complemento: saved?.complemento ?? "", pagamento: saved?.pagamento ?? "",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [locating, setLocating] = useState(false);
  const [modo, setModo] = useState<"entrega" | "retirada">(saved?.modo ?? "entrega");
  const [outroBairro, setOutroBairro] = useState(!!saved?.outroBairro);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const hoods = settings.neighborhoods.filter((n) => n.active);
  const retirada = settings.pickupEnabled && modo === "retirada";
  const delivery = !retirada;
  const hood = hoods.find((n) => n.name === f.bairro);
  const useHoodList = delivery && hoods.length > 0;
  // taxa: null = "a combinar" (outro bairro) ou ainda sem bairro escolhido
  const fee: number | null = !useHoodList ? 0 : outroBairro ? null : hood ? hood.fee : null;
  const grand = round2(cart.total + (fee ?? 0));
  const feePending = useHoodList && fee === null;
  const closed = !settings.open;
  const hasRaffle = cart.earned.some((e) => e.reward.raffle);

  const clearSaved = () => {
    try { localStorage.removeItem(SAVED_KEY); } catch { /* nada */ }
    setSaved(null);
    setF(empty);
    setOutroBairro(false);
    toast.success("Dados apagados deste aparelho");
  };

  const locate = () => {
    if (!navigator.geolocation) { toast.error("Seu aparelho não suporta localização."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=pt-BR`);
        const a = (await r.json()).address || {};
        setF((p) => ({ ...p, rua: a.road || p.rua, numero: a.house_number || p.numero,
          bairro: useHoodList ? p.bairro : a.suburb || a.neighbourhood || a.city_district || p.bairro, cidade: a.city || a.town || a.village || p.cidade }));
        toast.success("Endereço preenchido! Confira e corrija se precisar.");
      } catch { toast.error("Não foi possível obter o endereço."); }
      setLocating(false);
    }, () => { setLocating(false); toast.error("Permita o acesso à localização para usar esta função."); }, { enableHighAccuracy: true, timeout: 15000 });
  };

  const submit = () => {
    if (closed) { toast.error(settings.closedMessage); return; }
    if (cart.hasSoldOut) { toast.error("Há produto esgotado no carrinho."); return; }
    if (cart.missingMin > 0) { toast.error(`Pedido mínimo de ${brl(cart.minOrder)}.`); return; }
    const e: typeof errors = {};
    if (f.nome.trim().length < 3) e.nome = "Informe seu nome completo";
    if (f.telefone.replace(/\D/g, "").length < 10) e.telefone = "Telefone inválido";
    if (delivery) {
      if (!f.rua.trim()) e.rua = "Obrigatório";
      if (!f.numero.trim()) e.numero = "Obrigatório";
      if (!f.bairro.trim() || (useHoodList && !outroBairro && !hood)) e.bairro = "Escolha o bairro";
      if (!f.cidade.trim()) e.cidade = "Obrigatório";
    }
    if (!f.pagamento) e.pagamento = "Escolha a forma de pagamento";
    setErrors(e);
    if (Object.keys(e).length) { toast.error("Preencha os campos obrigatórios."); return; }

    const endereco = `${f.rua.trim()}, ${f.numero.trim()} - ${f.bairro.trim()}, ${f.cidade.trim()}${f.complemento.trim() ? ` (${f.complemento.trim()})` : ""}`;
    const pagamento = f.pagamento === "Dinheiro" && f.troco.trim() ? `Dinheiro (troco para ${f.troco.trim()})` : f.pagamento;
    const produtos = cart.lines.map((l) => {
      const base = unitOf(l.product) === "kg" ? `• ${l.product.name} — ${fmtQty(l.product, l.qty)}` : `• ${l.qty}x ${l.product.name}`;
      return `${base} — ${brl(l.lineTotal)}${l.note ? `\n   📝 ${l.note}` : ""}`;
    }).join("\n");
    const local = retirada ? `🏬 Retirada na loja${settings.pickupAddress ? ` (${settings.pickupAddress})` : ""}` : `📍 Endereço: ${endereco}`;
    const extras = [
      cart.coupon ? `\n🎟️ Cupom ${cart.coupon.code}: -${brl(cart.discount)} (subtotal ${brl(cart.subtotal)})` : "",
      cart.earned.length ? `\n🎁 *Você ganhou:* ${cart.earned.map(rewardLabel).join(", ")}` : "",
      hasRaffle ? "\n🍀 Os números dos cupons do sorteio serão enviados na confirmação do pedido." : "",
      useHoodList ? (fee !== null ? `\n🚚 Taxa de entrega (${f.bairro.trim()}): ${brl(fee)}` : "\n🚚 Taxa de entrega: a combinar") : "",
      cart.lines.some((l) => unitOf(l.product) === "kg") ? "\n⚖️ Itens por kg: o valor final pode variar conforme a pesagem." : "",
    ].join("");
    const totalTxt = `${brl(grand)}${feePending ? " + taxa de entrega" : ""}`;
    const msg = `🛒 *NOVO PEDIDO - PONTO CERTO*\n\n👤 Cliente: ${f.nome.trim()}\n📞 Telefone: ${f.telefone.trim()}\n${local}\n💳 Pagamento (na hora da ${retirada ? "retirada" : "entrega"}): ${pagamento}\n\n*Produtos:*\n${produtos}${extras}\n\n💰 *TOTAL: ${totalTxt}*\n\nObrigado por comprar no Ponto Certo! Seu pedido será confirmado em instantes. ✅`;
    // guarda os dados do cliente neste aparelho para os próximos pedidos
    try {
      const keep: Saved = {
        nome: f.nome.trim(), telefone: f.telefone.trim(), rua: f.rua.trim(), numero: f.numero.trim(), bairro: f.bairro.trim(),
        cidade: f.cidade.trim(), complemento: f.complemento.trim(), pagamento: f.pagamento, modo, outroBairro,
      };
      localStorage.setItem(SAVED_KEY, JSON.stringify(keep));
    } catch { /* sem espaço: segue sem salvar */ }
    // registra o pedido para o painel de vendas (falha aqui não impede o envio)
    const sum = (u: "kg" | "un") => cart.lines.filter((l) => unitOf(l.product) === u).reduce((s, l) => s + l.qty, 0);
    void addOrder({ total: grand, units: sum("un"), kg: sum("kg"), coupon: cart.coupon?.code ?? null }).catch(() => {});
    window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
    cart.clear();
    onDone();
  };

  const input = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <input value={f[k]} onChange={set(k)} {...props}
        className={`w-full rounded-xl border-2 bg-card px-4 py-3 outline-none focus:border-primary ${errors[k] ? "border-accent" : "border-border"}`} />
      {errors[k] && <span className="mt-1 block text-xs font-semibold text-accent">{errors[k]}</span>}
    </label>
  );

  const modeBtn = (id: "entrega" | "retirada", label: string) => (
    <button key={id} onClick={() => setModo(id)}
      className={`rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${modo === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background animate-in slide-in-from-bottom">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-primary px-4 py-4 text-primary-foreground">
        <button aria-label="Voltar" onClick={onBack}><ArrowLeft /></button>
        <h2 className="text-lg font-extrabold">Finalizar compra</h2>
      </header>
      <div className="mx-auto max-w-xl space-y-6 p-4 pb-10">
        {closed && <p className="rounded-2xl bg-accent px-4 py-3 text-sm font-bold text-accent-foreground">🔒 Loja fechada. {settings.closedMessage}</p>}
        <section className="space-y-3">
          <h3 className="font-extrabold text-primary">Seus dados</h3>
          {input("nome", "Nome completo *", { autoComplete: "name", maxLength: 100 })}
          {input("telefone", "Telefone/WhatsApp *", { type: "tel", inputMode: "tel", placeholder: "(27) 99999-9999", maxLength: 20 })}
          <p className="text-xs text-muted-foreground">
            Seus dados ficam salvos neste aparelho para os próximos pedidos.{" "}
            {saved && <button onClick={clearSaved} className="font-semibold underline">Apagar dados salvos</button>}
          </p>
        </section>

        {settings.pickupEnabled && (
          <section className="space-y-3">
            <h3 className="font-extrabold text-primary">Como você quer receber?</h3>
            <div className="grid grid-cols-2 gap-2">{modeBtn("entrega", "🚚 Entrega")}{modeBtn("retirada", "🏬 Retirar na loja")}</div>
            {retirada && settings.pickupAddress && <p className="text-sm text-muted-foreground">Retirada em: {settings.pickupAddress}</p>}
          </section>
        )}

        {delivery && (
          <section className="space-y-3">
            <h3 className="font-extrabold text-primary">Endereço de entrega</h3>
            <button onClick={locate} disabled={locating}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary py-3 font-bold text-primary disabled:opacity-60">
              {locating ? <Loader2 className="animate-spin" size={18} /> : "📍"} Usar minha localização atual
            </button>
            {input("rua", "Rua *", { maxLength: 150 })}
            {useHoodList ? (
              <>
                {input("numero", "Número *", { maxLength: 10 })}
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold">Bairro *</span>
                  <select value={outroBairro ? "__outro" : hood ? f.bairro : ""}
                    onChange={(e) => {
                      if (e.target.value === "__outro") { setOutroBairro(true); setF({ ...f, bairro: "" }); }
                      else { setOutroBairro(false); setF({ ...f, bairro: e.target.value }); }
                    }}
                    className={`w-full rounded-xl border-2 bg-card px-4 py-3 outline-none focus:border-primary ${errors.bairro ? "border-accent" : "border-border"}`}>
                    <option value="">Escolha o bairro</option>
                    {hoods.map((n) => <option key={n.id} value={n.name}>{n.name} — {n.fee > 0 ? brl(n.fee) : "grátis"}</option>)}
                    <option value="__outro">Outro bairro (taxa a combinar)</option>
                  </select>
                  {errors.bairro && <span className="mt-1 block text-xs font-semibold text-accent">{errors.bairro}</span>}
                </label>
                {outroBairro && input("bairro", "Nome do bairro *", { maxLength: 80 })}
              </>
            ) : (
              <div className="grid grid-cols-[1fr_2fr] gap-3">
                {input("numero", "Número *", { maxLength: 10 })}
                {input("bairro", "Bairro *", { maxLength: 80 })}
              </div>
            )}
            {input("cidade", "Cidade *", { maxLength: 80 })}
            {input("complemento", "Complemento", { placeholder: "Apto, bloco, referência...", maxLength: 120 })}
          </section>
        )}

        <section className="space-y-3">
          <h3 className="font-extrabold text-primary">Forma de pagamento *</h3>
          <p className="rounded-xl bg-muted px-3 py-2 text-sm font-semibold">
            {retirada ? "🏬 Você paga na hora da retirada, na loja." : "🚚 Você paga na hora que o pedido chegar."}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENTS.map((p) => (
              <button key={p} onClick={() => setF({ ...f, pagamento: p })}
                className={`rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${f.pagamento === p ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                {p}
              </button>
            ))}
          </div>
          {errors.pagamento && <span className="block text-xs font-semibold text-accent">{errors.pagamento}</span>}
          {f.pagamento === "Dinheiro" && input("troco", "Precisa de troco para quanto?", { placeholder: "Ex: R$ 100,00", maxLength: 20 })}
        </section>

        <section className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <h3 className="mb-2 font-extrabold text-primary">Resumo do pedido</h3>
          <ul className="space-y-1 text-sm">
            {cart.lines.map((l) => (
              <li key={l.id}>
                <div className="flex justify-between gap-2">
                  <span>{unitOf(l.product) === "kg" ? `${fmtQty(l.product, l.qty)} de ${l.product.name}` : `${l.qty}x ${l.product.name}`}</span>
                  <span className="shrink-0 font-semibold">{brl(l.lineTotal)}</span>
                </div>
                {l.note && <p className="text-xs text-muted-foreground">📝 {l.note}</p>}
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t pt-3"><PromoBox cart={cart} hideEarned /></div>
          {(cart.discount > 0 || useHoodList) && (
            <div className="mt-3 space-y-0.5 border-t pt-3 text-sm text-muted-foreground">
              {cart.discount > 0 && (
                <>
                  <div className="flex justify-between"><span>Subtotal</span><span>{brl(cart.subtotal)}</span></div>
                  <div className="flex justify-between"><span>Cupom {cart.coupon?.code}</span><span>-{brl(cart.discount)}</span></div>
                </>
              )}
              {useHoodList && (
                <div className="flex justify-between"><span>Taxa de entrega</span><span>{fee !== null ? (fee > 0 ? brl(fee) : "Grátis") : outroBairro ? "A combinar" : "Escolha o bairro"}</span></div>
              )}
            </div>
          )}
          {cart.earned.length > 0 && (
            <div className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm font-semibold">
              🎁 Você ganhou: {cart.earned.map(rewardLabel).join(", ")}
              {hasRaffle && <p className="mt-1 text-xs font-normal text-muted-foreground">Os números dos cupons do sorteio são enviados na confirmação do pedido.</p>}
            </div>
          )}
          <div className="mt-3 flex justify-between border-t pt-3 text-lg font-extrabold"><span>Total</span><span className="text-primary">{brl(grand)}{feePending && outroBairro ? " + taxa" : ""}</span></div>
          {cart.lines.some((l) => unitOf(l.product) === "kg") && <p className="mt-2 text-xs text-muted-foreground">⚖️ Itens por kg: o valor final pode variar conforme a pesagem.</p>}
        </section>
        <button onClick={submit} disabled={closed} className="w-full rounded-full bg-whatsapp py-4 text-lg font-extrabold text-primary-foreground shadow-card active:scale-[.98] disabled:opacity-50">
          {closed ? "Loja fechada" : "Enviar pedido"}
        </button>
      </div>
    </div>
  );
}
