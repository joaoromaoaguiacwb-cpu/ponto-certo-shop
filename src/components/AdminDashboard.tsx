import { useMemo, useState } from "react";
import { brl } from "@/data/products";
import { exampleOrders, type Order } from "@/lib/ordersRepo";
import { useOrders } from "@/lib/ordersStore";

type Agg = { count: number; value: number; units: number; kg: number };
const agg = (list: Order[]): Agg =>
  list.reduce((a, o) => ({ count: a.count + 1, value: a.value + o.total, units: a.units + o.units, kg: a.kg + o.kg }), { count: 0, value: 0, units: 0, kg: 0 });

const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const monthKey = (t: number) => dayKey(t).slice(0, 7);
const monthName = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  const s = new Date(y ?? 2000, (m ?? 1) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const fmtKg = (n: number) => `${(Math.round(n * 10) / 10).toLocaleString("pt-BR")} kg`;
const ticket = (a: Agg) => (a.count ? a.value / a.count : 0);

function Stat({ label, value, sub }: { label: string; value: string; sub?: string | undefined }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-border">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-primary">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function AdminDashboard() {
  const real = useOrders();
  const demo = real.length === 0;
  const orders = useMemo(() => (demo ? exampleOrders(Date.now()) : real), [demo, real]);
  const now = Date.now();
  const todayKey = dayKey(now);
  const curMonth = monthKey(now);
  const [view, setView] = useState<"dia" | "mes" | "meses">("dia");
  const [sel, setSel] = useState(todayKey);

  const dayOrders = orders.filter((o) => dayKey(o.at) === sel);
  const day = agg(dayOrders);

  const monthOrders = orders.filter((o) => monthKey(o.at) === curMonth);
  const month = agg(monthOrders);
  const daysSoFar = new Date(now).getDate();
  const daily = Array.from({ length: daysSoFar }, (_, i) => {
    const key = `${curMonth}-${pad(i + 1)}`;
    return { d: i + 1, value: agg(monthOrders.filter((o) => dayKey(o.at) === key)).value };
  });
  const maxDaily = Math.max(1, ...daily.map((x) => x.value));

  const previous = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of orders) {
      const k = monthKey(o.at);
      if (k === curMonth) continue;
      map.set(k, [...(map.get(k) ?? []), o]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 12).map(([k, l]) => ({ key: k, ...agg(l) }));
  }, [orders, curMonth]);
  const maxPrev = Math.max(1, ...previous.map((m) => m.value));

  const yesterday = dayKey(now - 86400000);
  const seg = (id: typeof view, label: string) => (
    <button key={id} onClick={() => setView(id)} aria-pressed={view === id}
      className={`rounded-full px-4 py-2 text-sm font-bold ${view === id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{label}</button>
  );

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-4 overflow-y-auto px-4 pb-10 pt-4">
      {demo && (
        <p className="rounded-2xl bg-muted px-4 py-3 text-sm">
          <b>Dados de exemplo.</b> Ainda não há pedidos enviados neste navegador. Cada pedido enviado pelo site passa a aparecer aqui. Com o Cloud, aparecem os pedidos de todos os clientes.
        </p>
      )}
      <div className="flex flex-wrap gap-2">{seg("dia", "Por dia")}{seg("mes", "Mês atual")}{seg("meses", "Meses anteriores")}</div>

      {view === "dia" && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={sel} max={todayKey} onChange={(e) => e.target.value && setSel(e.target.value)}
              className="rounded-full border-2 border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
            <button onClick={() => setSel(todayKey)} className="rounded-full bg-muted px-3 py-2 text-xs font-bold">Hoje</button>
            <button onClick={() => setSel(yesterday)} className="rounded-full bg-muted px-3 py-2 text-xs font-bold">Ontem</button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Pedidos" value={String(day.count)} />
            <Stat label="Valor vendido" value={brl(day.value)} sub={day.count ? `Ticket médio ${brl(ticket(day))}` : undefined} />
            <Stat label="Itens (unidades)" value={String(day.units)} />
            <Stat label="Peso vendido" value={fmtKg(day.kg)} />
          </div>
          {dayOrders.length > 0 && (
            <div className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-border">
              <h3 className="font-extrabold text-primary">Pedidos do dia</h3>
              <ul className="mt-2 divide-y divide-border text-sm">
                {[...dayOrders].reverse().slice(0, 30).map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="text-muted-foreground">{new Date(o.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="flex-1 truncate text-xs text-muted-foreground">{o.units} un{o.kg > 0 ? ` + ${fmtKg(o.kg)}` : ""}{o.coupon ? ` · cupom ${o.coupon}` : ""}</span>
                    <span className="font-bold">{brl(o.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {view === "mes" && (
        <>
          <h2 className="font-extrabold text-primary">{monthName(curMonth)} — do dia 1 ao dia {daysSoFar}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Valor no mês até agora" value={brl(month.value)} />
            <Stat label="Pedidos" value={String(month.count)} sub={month.count ? `Ticket médio ${brl(ticket(month))}` : undefined} />
            <Stat label="Itens (unidades)" value={String(month.units)} />
            <Stat label="Peso vendido" value={fmtKg(month.kg)} />
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-border">
            <h3 className="font-extrabold text-primary">Vendas por dia</h3>
            <div className="mt-3 flex h-36 items-end gap-0.5">
              {daily.map((x) => (
                <div key={x.d} title={`Dia ${x.d}: ${brl(x.value)}`} className="flex-1 rounded-t bg-primary" style={{ height: `${Math.max(2, (x.value / maxDaily) * 100)}%` }} />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>Dia 1</span><span>Dia {daysSoFar}</span></div>
          </div>
        </>
      )}

      {view === "meses" && (
        <div className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-border">
          <h3 className="font-extrabold text-primary">Meses anteriores</h3>
          {previous.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Ainda não há meses anteriores.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {previous.map((m) => (
                <li key={m.key}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{monthName(m.key)}</span>
                    <span className="font-extrabold text-primary">{brl(m.value)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(m.value / maxPrev) * 100}%` }} /></div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.count} pedidos · ticket médio {brl(ticket(m))} · {m.units} un · {fmtKg(m.kg)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Conta os pedidos enviados pelo site (clique em "Enviar pedido"), não os pagamentos confirmados.</p>
    </div>
  );
}
