import { useState } from "react";
import { toast } from "sonner";
import { brl } from "@/data/products";
import { parseMoney, round2 } from "@/lib/money";
import { normCode, type Coupon, type Reward } from "@/lib/promosRepo";
import { addCoupon, addReward, editCoupon, editReward, removeCoupon, removeReward, usePromos } from "@/lib/promosStore";
import { Confirm } from "./Confirm";
import { field, Modal, Row, saveError, Section } from "./AdminUi";

const couponSub = (c: Coupon) =>
  `${c.type === "percent" ? `${c.value}% de desconto` : `${brl(c.value)} de desconto`}${c.minTotal > 0 ? ` · compras a partir de ${brl(c.minTotal)}` : " · sem valor mínimo"}`;
const rewardSub = (r: Reward) =>
  `${r.raffle ? "Sorteio · " : ""}${r.repeat ? `A cada ${brl(r.everyAmount)} em compras (acumula)` : `Compras a partir de ${brl(r.everyAmount)} (1 vez por pedido)`}`;

/* ------------------------------ CUPONS ------------------------------ */

export function CouponsAdmin() {
  const { coupons } = usePromos();
  const [editing, setEditing] = useState<Coupon | "new" | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);

  const toggle = async (c: Coupon) => {
    try { await editCoupon(c.id, { active: !c.active }); } catch { saveError(); }
  };

  return (
    <Section title="Cupons de desconto" hint="O cliente digita o código no carrinho. Desative para parar de valer na hora." onAdd={() => setEditing("new")} addLabel="Novo cupom">
      {coupons.length === 0 ? (
        <div className="py-16 text-center"><div className="text-5xl">🎟️</div><p className="mt-2 font-semibold">Nenhum cupom criado</p></div>
      ) : (
        <ul className="flex flex-col gap-2">
          {coupons.map((c) => (
            <Row key={c.id} title={c.code} sub={couponSub(c)} on={c.active} onToggle={() => toggle(c)} onEdit={() => setEditing(c)} onDelete={() => setDeleting(c)} />
          ))}
        </ul>
      )}
      {editing && <CouponForm coupon={editing === "new" ? null : editing} all={coupons} onClose={() => setEditing(null)} />}
      {deleting && (
        <Confirm title="Apagar cupom?" text={`O cupom ${deleting.code} deixará de existir.`} action="Apagar" danger onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try { await removeCoupon(deleting.id); toast.success("Cupom apagado"); setDeleting(null); } catch { saveError(); }
          }} />
      )}
    </Section>
  );
}

function CouponForm({ coupon, all, onClose }: { coupon: Coupon | null; all: Coupon[]; onClose: () => void }) {
  const [code, setCode] = useState(coupon?.code ?? "");
  const [type, setType] = useState<Coupon["type"]>(coupon?.type ?? "percent");
  const [value, setValue] = useState(coupon ? String(coupon.value).replace(".", ",") : "");
  const [minTotal, setMinTotal] = useState(coupon && coupon.minTotal > 0 ? String(coupon.minTotal).replace(".", ",") : "");
  const [active, setActive] = useState(coupon?.active ?? true);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const c = normCode(code);
    const v = parseMoney(value);
    const min = minTotal.trim() ? parseMoney(minTotal) : 0;
    if (!c) return toast.error("Informe o código do cupom");
    if (all.some((x) => x.id !== coupon?.id && normCode(x.code) === c)) return toast.error("Já existe um cupom com esse código");
    if (!Number.isFinite(v) || v <= 0) return toast.error("Informe o valor do desconto");
    if (type === "percent" && v > 100) return toast.error("A porcentagem não pode passar de 100");
    if (!Number.isFinite(min) || min < 0) return toast.error("Compra mínima inválida");
    setBusy(true);
    try {
      const data = { code: c, type, value: round2(v), minTotal: round2(min), active };
      if (coupon) await editCoupon(coupon.id, data); else await addCoupon(data);
      toast.success(coupon ? "Cupom atualizado" : "Cupom criado");
      onClose();
    } catch { saveError(); setBusy(false); }
  };

  return (
    <Modal title={coupon ? "Editar cupom" : "Novo cupom"} onClose={onClose}>
      <label className="mt-4 block text-xs font-bold">Código</label>
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: BEMVINDO10" maxLength={30} className={`${field} uppercase placeholder:normal-case`} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value as Coupon["type"])} className={field}>
            <option value="percent">Porcentagem (%)</option>
            <option value="fixed">Valor fixo (R$)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold">{type === "percent" ? "Desconto (%)" : "Desconto (R$)"}</label>
          <input value={value} inputMode="decimal" onChange={(e) => setValue(e.target.value)} placeholder={type === "percent" ? "10" : "5,00"} className={field} />
        </div>
      </div>
      <label className="mt-3 block text-xs font-bold">Compra mínima (R$) — opcional</label>
      <input value={minTotal} inputMode="decimal" onChange={(e) => setMinTotal(e.target.value)} placeholder="0,00" className={field} />
      <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" /> Cupom ativo
      </label>
      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-full bg-muted px-4 py-2.5 font-bold">Cancelar</button>
        <button onClick={save} disabled={busy} className="flex-1 rounded-full bg-primary px-4 py-2.5 font-extrabold text-primary-foreground disabled:opacity-60">Salvar</button>
      </div>
    </Modal>
  );
}

/* ------------------------------ PRÊMIOS ------------------------------ */

export function RewardsAdmin() {
  const { rewards } = usePromos();
  const [editing, setEditing] = useState<Reward | "new" | null>(null);
  const [deleting, setDeleting] = useState<Reward | null>(null);

  const toggle = async (r: Reward) => {
    try { await editReward(r.id, { active: !r.active }); } catch { saveError(); }
  };

  return (
    <Section title="Prêmios por valor de compra" hint="O cliente ganha o prêmio conforme o total do pedido (já com o desconto do cupom). Ele aparece no carrinho e no pedido do WhatsApp." onAdd={() => setEditing("new")} addLabel="Novo prêmio">
      {rewards.length === 0 ? (
        <div className="py-16 text-center"><div className="text-5xl">🎁</div><p className="mt-2 font-semibold">Nenhum prêmio criado</p></div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rewards.map((r) => (
            <Row key={r.id} title={r.name} sub={rewardSub(r)} on={r.active} onToggle={() => toggle(r)} onEdit={() => setEditing(r)} onDelete={() => setDeleting(r)} />
          ))}
        </ul>
      )}
      {editing && <RewardForm reward={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <Confirm title="Apagar prêmio?" text={`"${deleting.name}" deixará de ser oferecido.`} action="Apagar" danger onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try { await removeReward(deleting.id); toast.success("Prêmio apagado"); setDeleting(null); } catch { saveError(); }
          }} />
      )}
    </Section>
  );
}

function RewardForm({ reward, onClose }: { reward: Reward | null; onClose: () => void }) {
  const [name, setName] = useState(reward?.name ?? "");
  const [every, setEvery] = useState(reward ? String(reward.everyAmount).replace(".", ",") : "");
  const [repeat, setRepeat] = useState(reward?.repeat ?? true);
  const [active, setActive] = useState(reward?.active ?? true);
  const [raffle, setRaffle] = useState(reward?.raffle ?? false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const n = name.trim();
    const amount = parseMoney(every);
    if (!n) return toast.error("Informe o prêmio");
    if (!Number.isFinite(amount) || amount <= 0) return toast.error("Informe o valor em compras");
    setBusy(true);
    try {
      const data = { name: n, everyAmount: round2(amount), repeat, active, raffle };
      if (reward) await editReward(reward.id, data); else await addReward(data);
      toast.success(reward ? "Prêmio atualizado" : "Prêmio criado");
      onClose();
    } catch { saveError(); setBusy(false); }
  };

  return (
    <Modal title={reward ? "Editar prêmio" : "Novo prêmio"} onClose={onClose}>
      <label className="mt-4 block text-xs font-bold">Prêmio</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Cupom para o sorteio do carro" maxLength={80} className={field} />
      <label className="mt-3 block text-xs font-bold">A cada quantos reais em compras (R$)</label>
      <input value={every} inputMode="decimal" onChange={(e) => setEvery(e.target.value)} placeholder="100,00" className={field} />
      <label className="mt-4 flex items-start gap-2 text-sm font-semibold">
        <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} className="mt-0.5 h-4 w-4" />
        <span>Acumula: ganha de novo a cada valor atingido<span className="block text-xs font-normal text-muted-foreground">Desmarcado, o cliente ganha só 1 vez por pedido ao atingir o valor.</span></span>
      </label>
      <label className="mt-3 flex items-start gap-2 text-sm font-semibold">
        <input type="checkbox" checked={raffle} onChange={(e) => setRaffle(e.target.checked)} className="mt-0.5 h-4 w-4" />
        <span>É cupom de sorteio<span className="block text-xs font-normal text-muted-foreground">O cliente é avisado de que os números dos cupons são enviados pela loja na confirmação do pedido.</span></span>
      </label>
      <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" /> Prêmio ativo
      </label>
      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-full bg-muted px-4 py-2.5 font-bold">Cancelar</button>
        <button onClick={save} disabled={busy} className="flex-1 rounded-full bg-primary px-4 py-2.5 font-extrabold text-primary-foreground disabled:opacity-60">Salvar</button>
      </div>
    </Modal>
  );
}
