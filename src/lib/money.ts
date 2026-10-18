// Aceita "4,99", "4.99" e "1.234,56". Retorna NaN se não for número.
export function parseMoney(input: string): number {
  const s = input.trim().replace(/[^\d.,]/g, "");
  if (!s) return NaN;
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  return Number(normalized);
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
