import { useEffect, useSyncExternalStore } from "react";

// Histórico de compras do cliente, salvo SÓ neste aparelho (localStorage).
export type HistItem = { id: number; qty: number; note?: string | undefined };
export type History = { bought: number[]; last: HistItem[] }; // bought: ids já pedidos, o mais recente primeiro

const KEY = "ponto-certo-history";
const EMPTY: History = { bought: [], last: [] };
let state: History = EMPTY;
let loaded = false;
const subs = new Set<() => void>();

const set = (h: History) => {
  state = h;
  subs.forEach((f) => f());
};
const subscribe = (f: () => void) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};

export function loadHistory() {
  if (loaded) return;
  loaded = true;
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "null");
    if (d && Array.isArray(d.bought) && Array.isArray(d.last)) set({ bought: d.bought, last: d.last });
  } catch {
    /* sem histórico */
  }
}

// Chamado quando o pedido é enviado: os itens pedidos passam para o início da lista.
export function recordHistory(items: HistItem[]) {
  loadHistory();
  const ids = items.map((i) => i.id);
  const next: History = { bought: [...ids, ...state.bought.filter((id) => !ids.includes(id))].slice(0, 300), last: items };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* sem espaço: segue sem salvar */
  }
  set(next);
}

export function useHistory(): History {
  const h = useSyncExternalStore(subscribe, () => state, () => EMPTY);
  useEffect(() => {
    loadHistory();
  }, []);
  return h;
}
