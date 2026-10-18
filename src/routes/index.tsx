import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { CATEGORIES } from "@/data/products";
import { useProducts } from "@/lib/productsStore";
import { isAdminSession } from "@/lib/admin";
import { useSettings } from "@/lib/settingsStore";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/ProductCard";
import { CartPanel } from "@/components/CartPanel";
import { Checkout } from "@/components/Checkout";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminPanel } from "@/components/AdminPanel";
import logo from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ponto Certo — Atacado e Supermercado" },
      { name: "description", content: "Compre no Ponto Certo: frutas, carnes, mercearia, bebidas, limpeza e muito mais com preço de atacado. Peça pelo WhatsApp." },
      { property: "og:title", content: "Ponto Certo — Atacado e Supermercado" },
      { property: "og:description", content: "Preço de atacado e pedido rápido pelo WhatsApp." },
    ],
  }),
  component: Index,
});

const rank = (p: { onSale?: boolean | undefined; soldOut?: boolean | undefined }) => (p.soldOut ? 2 : p.onSale ? 0 : 1);
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function Index() {
  const products = useProducts();
  const settings = useSettings();
  const cart = useCart();
  const [admin, setAdmin] = useState<"off" | "login" | "panel">("off");
  const clicks = useRef<number[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todos");
  const [view, setView] = useState<"shop" | "cart" | "checkout" | "success">("shop");

  // Promoções primeiro (dentro da categoria e em "Todos"); o resto mantém a ordem original.
  const list = useMemo(
    () =>
      products
        .filter((p) => (cat === "todos" || p.category === cat) && norm(p.name).includes(norm(q)))
        // promoções primeiro, esgotados por último
        .sort((a, b) => rank(a) - rank(b)),
    [products, q, cat],
  );

  // 3 cliques rápidos no logo abrem o acesso administrativo
  const onLogoClick = () => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 900), now];
    if (clicks.current.length >= 3) {
      clicks.current = [];
      setAdmin(isAdminSession() ? "panel" : "login");
    }
  };

  const chip = (id: string, label: string) => (
    <button key={id} onClick={() => setCat(id)}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${cat === id ? "bg-primary text-primary-foreground shadow-card" : "bg-card text-foreground ring-1 ring-border"}`}>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 bg-card/95 shadow-sm backdrop-blur">
        <div className="flex justify-center py-2"><img src={logo.url} alt="Ponto Certo" onClick={onLogoClick} draggable={false} className="h-12 w-auto select-none sm:h-14" /></div>
        <div className="h-1 bg-brand-stripe" />
      </header>

      {!settings.open && (
        <div className="bg-accent px-4 py-2 text-center text-sm font-bold text-accent-foreground">🔒 Loja fechada. {settings.closedMessage}</div>
      )}
      {settings.open && settings.bannerEnabled && settings.bannerText.trim() && (
        <div className="bg-secondary px-4 py-2 text-center text-sm font-bold text-secondary-foreground">📢 {settings.bannerText}</div>
      )}

      <div className="mx-auto max-w-7xl px-4">
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={22} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produtos..." type="search"
            className="w-full rounded-full border-2 border-border bg-card py-4 pl-12 pr-4 text-base shadow-card outline-none focus:border-primary" />
        </div>

        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {chip("todos", "🛒 Todos")}
          {CATEGORIES.map((c) => chip(c.id, `${c.emoji} ${c.name}`))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{list.length} produtos</p>
        {list.length === 0 ? (
          <div className="py-16 text-center"><div className="text-5xl">🔍</div><p className="mt-2 font-semibold">Nenhum produto encontrado</p></div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {list.map((p) => <ProductCard key={p.id} product={p} onAdd={cart.add} />)}
          </div>
        )}
      </div>

      <button aria-label="Abrir carrinho" onClick={() => setView("cart")}
        className="fixed bottom-5 left-5 z-40 grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-float transition active:scale-95">
        <ShoppingCart size={28} />
        {cart.count > 0 && (
          <span className="absolute -right-1 -top-1 grid h-7 min-w-7 place-items-center rounded-full bg-accent px-1.5 text-xs font-extrabold text-accent-foreground ring-2 ring-card">
            {cart.count}
          </span>
        )}
      </button>

      {admin === "login" && <AdminLogin onSuccess={() => setAdmin("panel")} onClose={() => setAdmin("off")} />}
      {admin === "panel" && <AdminPanel onClose={() => setAdmin("off")} />}

      {view === "cart" && <CartPanel cart={cart} onClose={() => setView("shop")} onCheckout={() => setView("checkout")} />}
      {view === "checkout" && <Checkout cart={cart} onBack={() => setView("cart")} onDone={() => setView("success")} />}
      {view === "success" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-primary p-8 text-center text-primary-foreground animate-in fade-in">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-secondary text-5xl">✅</div>
          <h2 className="text-2xl font-extrabold">Pedido enviado!</h2>
          <p className="max-w-xs opacity-90">Recebemos seu pedido pelo WhatsApp. Ele será confirmado em instantes. Obrigado por comprar no Ponto Certo!</p>
          <button onClick={() => setView("shop")} className="mt-2 rounded-full bg-secondary px-8 py-3 font-extrabold text-secondary-foreground">Voltar à loja</button>
        </div>
      )}
    </div>
  );
}
