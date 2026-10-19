// Configurações da loja (aberta/fechada, banner, pedido mínimo, retirada, taxa por bairro).
// Nesta demo ficam no localStorage deste navegador. Para ligar o Lovable Cloud, troque o corpo destas
// funções por chamadas ao banco; o resto do site não muda.

export type DaySchedule = { enabled: boolean; open: string; close: string }; // "07:00" / "20:00"
export type Neighborhood = { id: number; name: string; fee: number; active: boolean };
export type Settings = {
  open: boolean; // loja aberta (aceita pedidos)
  closedMessage: string;
  bannerEnabled: boolean;
  bannerText: string;
  minOrder: number; // pedido mínimo em R$ (0 = sem mínimo)
  pickupEnabled: boolean; // permite "Retirar na loja"
  pickupAddress: string;
  neighborhoods: Neighborhood[]; // taxa de entrega por bairro (substitui a taxa padrão)
  scheduleEnabled: boolean; // abre e fecha sozinha nos horários abaixo
  schedule: DaySchedule[]; // 7 itens: 0 = domingo ... 6 = sábado
  deliveryFee: number; // taxa de entrega padrão (R$)
  freeDeliveryFrom: number; // entrega grátis a partir de R$ X (0 = desligado)
};
export type SettingsPatch = Partial<Omit<Settings, "neighborhoods">>;
export type NeighborhoodInput = Omit<Neighborhood, "id">;

// Horário comum de mercado: segunda a sábado 07:00-20:00, domingo 08:00-13:00.
export const DEFAULT_SCHEDULE: DaySchedule[] = [
  { enabled: true, open: "08:00", close: "13:00" },
  ...Array.from({ length: 6 }, () => ({ enabled: true, open: "07:00", close: "20:00" })),
];

export const DEFAULT_SETTINGS: Settings = {
  open: true,
  closedMessage: "No momento estamos fechados. Volte no nosso horário de atendimento.",
  bannerEnabled: false,
  bannerText: "",
  minOrder: 0,
  pickupEnabled: false,
  pickupAddress: "",
  neighborhoods: [],
  scheduleEnabled: true,
  schedule: DEFAULT_SCHEDULE,
  deliveryFee: 5,
  freeDeliveryFrom: 0,
};

// EXEMPLO: banner de ofertas ligado até você salvar suas próprias configurações.
export const EXAMPLE_SETTINGS: Settings = {
  ...DEFAULT_SETTINGS,
  bannerEnabled: true,
  bannerText: "A cada R$ 100 em compras você ganha 1 cupom para concorrer a um carro!",
  freeDeliveryFrom: 150, // exemplo: entrega grátis a partir de R$ 150
};

const KEY = "ponto-certo-settings-v1";

function read(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EXAMPLE_SETTINGS;
    const d = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...d,
      neighborhoods: Array.isArray(d?.neighborhoods) ? d.neighborhoods : [],
      schedule: Array.isArray(d?.schedule) && d.schedule.length === 7 ? d.schedule : DEFAULT_SCHEDULE,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Lança erro se não couber (localStorage cheio); quem chama mostra o aviso.
function write(s: Settings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export async function getSettings(): Promise<Settings> {
  return read();
}
export async function updateSettings(patch: SettingsPatch): Promise<void> {
  write({ ...read(), ...patch });
}
export async function createNeighborhood(input: NeighborhoodInput): Promise<void> {
  const s = read();
  const id = s.neighborhoods.reduce((m, n) => Math.max(m, n.id), 0) + 1;
  write({ ...s, neighborhoods: [...s.neighborhoods, { id, ...input }] });
}
export async function updateNeighborhood(id: number, patch: Partial<NeighborhoodInput>): Promise<void> {
  const s = read();
  write({ ...s, neighborhoods: s.neighborhoods.map((n) => (n.id === id ? { ...n, ...patch } : n)) });
}
export async function deleteNeighborhood(id: number): Promise<void> {
  const s = read();
  write({ ...s, neighborhoods: s.neighborhoods.filter((n) => n.id !== id) });
}
