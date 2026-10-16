import { useEffect, useState } from "react";
import { CATEGORIES, type Product } from "@/data/products";

const CACHE_KEY = "pc_img_cache_v1";
const mem: Record<string, string> = (() => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
})();
const pending: Record<string, Promise<string>> = {};

function cleanName(name: string) {
  return name
    .replace(/\b\d+([.,]\d+)?\s?(kg|g|ml|l|lt|un|mg|cm)\b/gi, "")
    .replace(/\b(kg|un|pct|cx)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function wiki(lang: string, q: string): Promise<string> {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=5&gsrsearch=${encodeURIComponent(q)}&prop=pageimages&piprop=thumbnail&pithumbsize=400`;
  const r = await fetch(url);
  const j = await r.json();
  const pages = Object.values(j?.query?.pages ?? {}) as { index: number; thumbnail?: { source: string } }[];
  pages.sort((a, b) => a.index - b.index);
  return pages.find((p) => p.thumbnail)?.thumbnail?.source ?? "";
}

function findImage(name: string): Promise<string> {
  if (mem[name] !== undefined) return Promise.resolve(mem[name]);
  if (!pending[name]) {
    pending[name] = (async () => {
      let src = "";
      try {
        const q = cleanName(name);
        src = (await wiki("pt", q)) || (await wiki("pt", q.split(" ")[0])) || "";
      } catch { /* ignora */ }
      mem[name] = src;
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(mem)); } catch { /* ignora */ }
      return src;
    })();
  }
  return pending[name];
}

export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  const [src, setSrc] = useState<string>(mem[product.name] || "");
  const [failed, setFailed] = useState(false);
  const emoji = CATEGORIES.find((c) => c.id === product.category)?.emoji ?? "🛒";

  useEffect(() => {
    let alive = true;
    setFailed(false);
    findImage(product.name).then((s) => { if (alive) setSrc(s || product.image); });
    return () => { alive = false; };
  }, [product.name, product.image]);

  if (failed || !src)
    return (
      <div className={`grid place-items-center bg-fallback text-4xl ${className}`} aria-label={product.name}>
        {emoji}
      </div>
    );
  return (
    <img src={src} alt={product.name} loading="lazy"
      onError={() => { if (src !== product.image) setSrc(product.image); else setFailed(true); }}
      className={`object-cover bg-muted ${className}`} />
  );
}
