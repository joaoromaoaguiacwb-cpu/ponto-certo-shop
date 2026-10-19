import { useState } from "react";
import { toast } from "sonner";
import { brl } from "@/data/products";
import { parseMoney, round2 } from "@/lib/money";
import {
  addNeighborhood, editNeighborhood, removeNeighborhood, saveSettings, useSettings,
  type DaySchedule, type Neighborhood, type Settings,
} from "@/lib/settingsStore";
import { DAY_NAMES, useStoreStatus } from "@/lib/hours";
import { Confirm } from "./Confirm";
import { field, Modal, Row, saveError } from "./AdminUi";

const card = "rounded-2xl bg-card p-4 shadow-card ring-1 ring-border";

export function StoreAdmin() {
  const s = useSettings();
  const status = useStoreStatus();
  const [editing, setEditing] = useState<Neighborhood | "new" | null>(null);
  const [deleting, setDeleting] = useState<Neighborhood | null>(null);

  const toggleOpen = async () => {
    try { await saveSettings({ open: !s.open }); } catch { saveError(); }
  };
  const toggleHood = async (n: Neighborhood) => {
    try { await editNeighborhood(n.id, { active: !n.active }); } catch { saveError(); }
  };

  // key: recria o formulário se as configurações mudarem por fora
  const formKey = JSON.stringify([s.closedMessage, s.bannerEnabled, s.bannerText, s.minOrder, s.pickupEnabled, s.pickupAddress, s.scheduleEnabled, s.schedule, s.deliveryFee, s.freeDeliveryFrom]);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-4 overflow-y-auto px-4 pb-10 pt-4">
      <section className={card}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-primary">
              Loja {status.open ? "aberta" : status.reason === "horario" ? "fechada (fora do horário)" : "fechada (manual)"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {s.scheduleEnabled ? "Abre e fecha sozinha nos horários abaixo. " : ""}Fechada: os clientes veem o aviso e não conseguem enviar pedidos.
            </p>
          </div>
          <button onClick={toggleOpen} aria-pressed={s.open}
            className={`shrink-0 rounded-full px-5 py-3 text-sm font-extrabold ${s.open ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
            {s.open ? "Fechar a loja agora" : "Reabrir a loja"}
          </button>
        </div>
      </section>

      <SettingsForm key={formKey} s={s} />

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-extrabold text-primary">Taxa de entrega por bairro</h2>
            <p className="text-xs text-muted-foreground">Opcional: bairro com taxa diferente da padrão. Quem não escolher um bairro da lista paga a taxa padrão.</p>
          </div>
          <button onClick={() => setEditing("new")} className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground">+ Novo bairro</button>
        </div>
        {s.neighborhoods.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum bairro cadastrado.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {s.neighborhoods.map((n) => (
              <Row key={n.id} title={n.name} sub={n.fee > 0 ? `Taxa ${brl(n.fee)}` : "Entrega grátis"} on={n.active}
                onToggle={() => toggleHood(n)} onEdit={() => setEditing(n)} onDelete={() => setDeleting(n)} />
            ))}
          </ul>
        )}
      </section>

      {editing && <HoodForm hood={editing === "new" ? null : editing} all={s.neighborhoods} onClose={() => setEditing(null)} />}
      {deleting && (
        <Confirm title="Apagar bairro?" text={`${deleting.name} deixará de aparecer na entrega.`} action="Apagar" danger onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try { await removeNeighborhood(deleting.id); toast.success("Bairro apagado"); setDeleting(null); } catch { saveError(); }
          }} />
      )}
    </div>
  );
}

function SettingsForm({ s }: { s: Settings }) {
  const [closedMessage, setClosedMessage] = useState(s.closedMessage);
  const [bannerEnabled, setBannerEnabled] = useState(s.bannerEnabled);
  const [bannerText, setBannerText] = useState(s.bannerText);
  const [minOrder, setMinOrder] = useState(s.minOrder > 0 ? String(s.minOrder).replace(".", ",") : "");
  const [pickupEnabled, setPickupEnabled] = useState(s.pickupEnabled);
  const [pickupAddress, setPickupAddress] = useState(s.pickupAddress);
  const [scheduleEnabled, setScheduleEnabled] = useState(s.scheduleEnabled);
  const [schedule, setSchedule] = useState<DaySchedule[]>(s.schedule);
  const [deliveryFee, setDeliveryFee] = useState(String(s.deliveryFee).replace(".", ","));
  const [freeFrom, setFreeFrom] = useState(s.freeDeliveryFrom > 0 ? String(s.freeDeliveryFrom).replace(".", ",") : "");
  const [busy, setBusy] = useState(false);

  const setDay = (i: number, patch: Partial<DaySchedule>) => setSchedule((sc) => sc.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  const save = async () => {
    const min = minOrder.trim() ? parseMoney(minOrder) : 0;
    const fee = deliveryFee.trim() ? parseMoney(deliveryFee) : 0;
    const free = freeFrom.trim() ? parseMoney(freeFrom) : 0;
    if (!Number.isFinite(fee) || fee < 0) return void toast.error("Taxa de entrega inválida");
    if (!Number.isFinite(free) || free < 0) return void toast.error("Valor da entrega grátis inválido");
    for (const [i, d] of schedule.entries()) {
      if (d.enabled && (!d.open || !d.close || d.close <= d.open)) return void toast.error(`${DAY_NAMES[i]}: o horário de fechar precisa ser depois do de abrir`);
    }
    if (!Number.isFinite(min) || min < 0) return void toast.error("Pedido mínimo inválido");
    if (bannerEnabled && !bannerText.trim()) return void toast.error("Escreva o texto do banner ou desmarque a opção");
    setBusy(true);
    try {
      await saveSettings({
        closedMessage: closedMessage.trim() || "No momento estamos fechados.",
        bannerEnabled, bannerText: bannerText.trim(), minOrder: round2(min), pickupEnabled, pickupAddress: pickupAddress.trim(),
        scheduleEnabled, schedule, deliveryFee: round2(fee), freeDeliveryFrom: round2(free),
      });
      toast.success("Configurações salvas");
    } catch { saveError(); }
    setBusy(false);
  };

  return (
    <section className={card}>
      <h2 className="font-extrabold text-primary">Avisos e regras do pedido</h2>

      <a href="/qr" target="_blank" rel="noreferrer"
        className="mt-3 block rounded-full border-2 border-primary px-4 py-2 text-center text-sm font-extrabold text-primary">
        🔳 QR code da loja (imprimir)
      </a>

      <label className="mt-3 block text-xs font-bold">Aviso quando a loja está fechada (manual)</label>
      <input value={closedMessage} onChange={(e) => setClosedMessage(e.target.value)} maxLength={140}
        placeholder="Ex: Estamos fechados. Atendemos de seg a sáb, das 7h às 19h." className={field} />

      <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={bannerEnabled} onChange={(e) => setBannerEnabled(e.target.checked)} className="h-4 w-4" /> Mostrar banner de ofertas no topo da loja
      </label>
      <input value={bannerText} onChange={(e) => setBannerText(e.target.value)} maxLength={140}
        placeholder="Ex: Ofertas da semana: carnes com 10% de desconto!" className={field} />

      <h3 className="mt-5 font-extrabold text-primary">Horário de funcionamento</h3>
      <label className="mt-2 flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} className="h-4 w-4" /> Abrir e fechar sozinha nestes horários (fuso de Brasília)
      </label>
      {scheduleEnabled && (
        <ul className="mt-2 space-y-2">
          {schedule.map((d, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
              <label className="flex w-32 items-center gap-2 font-semibold">
                <input type="checkbox" checked={d.enabled} onChange={(e) => setDay(i, { enabled: e.target.checked })} className="h-4 w-4" /> {DAY_NAMES[i]}
              </label>
              {d.enabled ? (
                <>
                  <input type="time" value={d.open} onChange={(e) => setDay(i, { open: e.target.value })} className="rounded-lg border-2 border-border bg-background px-2 py-1.5 outline-none focus:border-primary" />
                  <span>às</span>
                  <input type="time" value={d.close} onChange={(e) => setDay(i, { close: e.target.value })} className="rounded-lg border-2 border-border bg-background px-2 py-1.5 outline-none focus:border-primary" />
                </>
              ) : (
                <span className="text-muted-foreground">Fechado</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-5 font-extrabold text-primary">Entrega e pedido</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mt-2 block text-xs font-bold">Taxa de entrega padrão (R$)</label>
          <input value={deliveryFee} inputMode="decimal" onChange={(e) => setDeliveryFee(e.target.value)} placeholder="5,00" className={field} />
        </div>
        <div>
          <label className="mt-2 block text-xs font-bold">Entrega grátis a partir de (R$)</label>
          <input value={freeFrom} inputMode="decimal" onChange={(e) => setFreeFrom(e.target.value)} placeholder="vazio = desligado" className={field} />
        </div>
      </div>

      <label className="mt-4 block text-xs font-bold">Pedido mínimo (R$) — vazio = sem mínimo</label>
      <input value={minOrder} inputMode="decimal" onChange={(e) => setMinOrder(e.target.value)} placeholder="0,00" className={field} />

      <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={pickupEnabled} onChange={(e) => setPickupEnabled(e.target.checked)} className="h-4 w-4" /> Permitir retirada na loja
      </label>
      {pickupEnabled && (
        <input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} maxLength={140}
          placeholder="Endereço para retirada (opcional)" className={field} />
      )}

      <button onClick={save} disabled={busy}
        className="mt-5 w-full rounded-full bg-primary px-4 py-3 font-extrabold text-primary-foreground disabled:opacity-60">Salvar alterações</button>
    </section>
  );
}

function HoodForm({ hood, all, onClose }: { hood: Neighborhood | null; all: Neighborhood[]; onClose: () => void }) {
  const [name, setName] = useState(hood?.name ?? "");
  const [fee, setFee] = useState(hood && hood.fee > 0 ? String(hood.fee).replace(".", ",") : "");
  const [active, setActive] = useState(hood?.active ?? true);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const n = name.trim();
    const f = fee.trim() ? parseMoney(fee) : 0;
    if (!n) return void toast.error("Informe o nome do bairro");
    if (all.some((x) => x.id !== hood?.id && x.name.toLowerCase() === n.toLowerCase())) return void toast.error("Esse bairro já existe");
    if (!Number.isFinite(f) || f < 0) return void toast.error("Taxa inválida");
    setBusy(true);
    try {
      const data = { name: n, fee: round2(f), active };
      if (hood) await editNeighborhood(hood.id, data); else await addNeighborhood(data);
      toast.success(hood ? "Bairro atualizado" : "Bairro adicionado");
      onClose();
    } catch { saveError(); setBusy(false); }
  };

  return (
    <Modal title={hood ? "Editar bairro" : "Novo bairro"} onClose={onClose}>
      <label className="mt-4 block text-xs font-bold">Bairro</label>
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={field} />
      <label className="mt-3 block text-xs font-bold">Taxa de entrega (R$) — vazio = grátis</label>
      <input value={fee} inputMode="decimal" onChange={(e) => setFee(e.target.value)} placeholder="0,00" className={field} />
      <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" /> Bairro ativo
      </label>
      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-full bg-muted px-4 py-2.5 font-bold">Cancelar</button>
        <button onClick={save} disabled={busy} className="flex-1 rounded-full bg-primary px-4 py-2.5 font-extrabold text-primary-foreground disabled:opacity-60">Salvar</button>
      </div>
    </Modal>
  );
}
