import { useEffect, useState } from "react";
import { useSettings, type Settings } from "./settingsStore";

// Horário da loja sempre no fuso de Brasília, não importa onde o cliente esteja.
const TZ = "America/Sao_Paulo";
export const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function storeNow(date: Date = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = WEEKDAYS_EN.indexOf(get("weekday"));
  return { day: day < 0 ? 0 : day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export function scheduleOpen(s: Settings, now = storeNow()): boolean {
  const d = s.schedule[now.day];
  return !!d && d.enabled && now.minutes >= toMin(d.open) && now.minutes < toMin(d.close);
}

// "hoje às 07:00", "amanhã às 07:00", "segunda às 07:00"
export function nextOpening(s: Settings, now = storeNow()): string | null {
  for (let i = 0; i <= 7; i++) {
    const day = (now.day + i) % 7;
    const d = s.schedule[day];
    if (!d || !d.enabled) continue;
    if (i === 0 && now.minutes >= toMin(d.open)) continue; // hoje já passou do horário de abrir
    const when = i === 0 ? "hoje" : i === 1 ? "amanhã" : (DAY_NAMES[day] ?? "").toLowerCase();
    return `${when} às ${d.open}`;
  }
  return null;
}

// "Seg a Sáb: 07:00 às 20:00 · Dom: 08:00 às 13:00"
export function scheduleSummary(s: Settings): string {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const text = (day: number) => {
    const d = s.schedule[day];
    return d && d.enabled ? `${d.open} às ${d.close}` : "Fechado";
  };
  const groups: { days: number[]; text: string }[] = [];
  for (const day of order) {
    const last = groups[groups.length - 1];
    if (last && last.text === text(day)) last.days.push(day);
    else groups.push({ days: [day], text: text(day) });
  }
  return groups
    .map((g) => {
      const first = SHORT[g.days[0] ?? 0] ?? "";
      const end = SHORT[g.days[g.days.length - 1] ?? 0] ?? "";
      return `${g.days.length > 1 ? `${first} a ${end}` : first}: ${g.text}`;
    })
    .join(" · ");
}

export type StoreStatus = { open: boolean; reason: "manual" | "horario" | null; message: string };

// Aberta = não fechada manualmente E dentro do horário (se o horário automático estiver ligado).
export function useStoreStatus(): StoreStatus {
  const s = useSettings();
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);
  if (!mounted) return { open: true, reason: null, message: "" }; // evita diferença entre servidor e navegador
  if (!s.open) return { open: false, reason: "manual", message: s.closedMessage };
  if (s.scheduleEnabled && !scheduleOpen(s)) {
    const next = nextOpening(s);
    return { open: false, reason: "horario", message: `Estamos fechados agora.${next ? ` Abrimos ${next}.` : ""}` };
  }
  return { open: true, reason: null, message: "" };
}
