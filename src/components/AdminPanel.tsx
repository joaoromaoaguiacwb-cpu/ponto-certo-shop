import { useMemo, useRef, useState } from "react";
import { LogOut, Pencil, Plus, RotateCcw, Search, Tag, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { brl, CATEGORIES, type Product } from "@/data/products";
import { addProduct, editProduct, removeProduct, restoreProducts, useProducts } from "@/lib/productsStore";
import { fileToResizedDataUrl } from "@/lib/image";
import { logoutAdmin } from "@/lib/admin";
import { ProductImage } from "./ProductImage";
import { Confirm } from "./Confirm";
import { CouponsAdmin, RewardsAdmin } from "./AdminPromos";
import { parseMoney } from "@/lib/money";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type Form = { name: string; price: string; category: string; image: string; onSale: boolean };
const emptyForm: Form = { name: "", price: "", category: CATEGORIES[0].id, image: "", onSale: false };

const saveError = () => toast.error("Não foi possível salvar. O espaço do navegador pode estar cheio (tente uma foto menor ou um link).");

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const products = useProducts();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todos");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [tab, setTab] = useState<"produtos" | "cupons" | "premios">("produtos");

  const list = useMemo(
    () => products.filter((p) => (cat === "todos" || p.category === cat) && norm(p.name).includes(norm(q))),
    [products, q, cat],
  );
  const catName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? id;

  const togglePromo = async (p: Product) => {
    try {
      await editProduct(p.id, { onSale: !p.onSale });
    } catch {
      saveError();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <div>
            <h1 className="text-lg font-extrabold">Painel administrativo</h1>
            <p className="text-xs opacity-90">Modo demonstração: alterações ficam salvas só neste navegador.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { logoutAdmin(); onClose(); }}
              className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground"><LogOut size={14} /> Sair</button>
            <button aria-label="Fechar painel" onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-card text-primary"><X size={18} /></button>
          </div>
        </div>
      </header>

      <nav className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl gap-2 px-4 py-2">
          {([["produtos", "Produtos"], ["cupons", "Cupons"], ["premios", "Prêmios"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id}
              className={`rounded-full px-4 py-2 text-sm font-bold ${tab === id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{label}</button>
          ))}
        </div>
      </nav>

      {tab === "produtos" ? (
      <div className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-4 pb-10">
        <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 pb-3 pt-4 backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome..." type="search"
                className="w-full rounded-full border-2 border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary" />
            </div>
            <select value={cat} onChange={(e) => setCat(e.target.value)}
              className="rounded-full border-2 border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary">
              <option value="todos">Todas as categorias</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">{list.length} de {products.length} produtos</span>
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1.5 rounded-full bg-card px-3 py-2 text-xs font-bold text-foreground ring-1 ring-border"><RotateCcw size={14} /> Restaurar originais</button>
              <button onClick={() => setEditing("new")}
                className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground"><Plus size={14} /> Adicionar produto</button>
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="py-16 text-center"><div className="text-5xl">🔍</div><p className="mt-2 font-semibold">Nenhum produto encontrado</p></div>
        ) : (
          <ul className="flex flex-col gap-2">
            {list.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-2 shadow-card ring-1 ring-border">
                <ProductImage product={p} className="h-14 w-14 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{catName(p.category)}</p>
                  <p className="text-sm font-extrabold text-primary">{brl(p.price)}</p>
                </div>
                <button onClick={() => togglePromo(p)} aria-pressed={!!p.onSale}
                  className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs font-bold ${p.onSale ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"}`}>
                  <Tag size={14} /> {p.onSale ? "Em promoção" : "Promoção"}
                </button>
                <button aria-label={`Editar ${p.name}`} onClick={() => setEditing(p)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-primary"><Pencil size={16} /></button>
                <button aria-label={`Apagar ${p.name}`} onClick={() => setDeleting(p)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-destructive"><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
      ) : tab === "cupons" ? <CouponsAdmin /> : <RewardsAdmin />}

      {editing && <ProductForm product={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}

      {deleting && (
        <Confirm title="Apagar produto?" text={`"${deleting.name}" será removido da loja.`} action="Apagar" danger
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await removeProduct(deleting.id);
              toast.success("Produto apagado");
              setDeleting(null);
            } catch {
              saveError();
            }
          }} />
      )}

      {confirmReset && (
        <Confirm title="Restaurar produtos originais?" text="Todas as edições, produtos novos e promoções feitos neste navegador serão perdidos." action="Restaurar" danger
          onCancel={() => setConfirmReset(false)}
          onConfirm={async () => {
            await restoreProducts();
            toast.success("Produtos originais restaurados");
            setConfirmReset(false);
          }} />
      )}
    </div>
  );
}

function ProductForm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [f, setF] = useState<Form>(
    product ? { name: product.name, price: String(product.price).replace(".", ","), category: product.category, image: product.image, onSale: !!product.onSale } : emptyForm,
  );
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      set("image", await fileToResizedDataUrl(file));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar a imagem");
    }
  };

  const save = async () => {
    const name = f.name.trim();
    const price = parseMoney(f.price);
    if (!name) return toast.error("Informe o nome do produto");
    if (!Number.isFinite(price) || price <= 0) return toast.error("Informe um preço válido");
    setBusy(true);
    try {
      const data = { name, price: Math.round(price * 100) / 100, category: f.category, image: f.image.trim(), onSale: f.onSale };
      if (product) await editProduct(product.id, data);
      else await addProduct(data);
      toast.success(product ? "Produto atualizado" : "Produto adicionado");
      onClose();
    } catch {
      saveError();
      setBusy(false);
    }
  };

  const preview: Product = { id: 0, name: f.name || "Produto", price: 0, category: f.category, image: f.image, fallback: "" };
  const field = "mt-1 w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div role="dialog" onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-5 shadow-float ring-1 ring-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-primary">{product ? "Editar produto" : "Novo produto"}</h2>
          <button aria-label="Fechar" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-muted"><X size={16} /></button>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <ProductImage product={preview} className="h-24 w-24 shrink-0 rounded-xl" />
          <div className="flex-1">
            <label className="text-xs font-bold">Link da foto</label>
            <input value={f.image.startsWith("data:") ? "" : f.image} placeholder={f.image.startsWith("data:") ? "(foto enviada do aparelho)" : "https://..."}
              onChange={(e) => set("image", e.target.value)} className={field} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
            <button onClick={() => fileRef.current?.click()}
              className="mt-2 flex items-center gap-1.5 rounded-full bg-muted px-3 py-2 text-xs font-bold"><Upload size={14} /> Enviar foto</button>
          </div>
        </div>

        <label className="mt-4 block text-xs font-bold">Nome</label>
        <input value={f.name} onChange={(e) => set("name", e.target.value)} className={field} />

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold">Preço (R$)</label>
            <input value={f.price} inputMode="decimal" placeholder="0,00" onChange={(e) => set("price", e.target.value)} className={field} />
          </div>
          <div>
            <label className="text-xs font-bold">Categoria</label>
            <select value={f.category} onChange={(e) => set("category", e.target.value)} className={field}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={f.onSale} onChange={(e) => set("onSale", e.target.checked)} className="h-4 w-4" /> Em promoção
        </label>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-full bg-muted px-4 py-2.5 font-bold">Cancelar</button>
          <button onClick={save} disabled={busy}
            className="flex-1 rounded-full bg-primary px-4 py-2.5 font-extrabold text-primary-foreground disabled:opacity-60">Salvar</button>
        </div>
      </div>
    </div>
  );
}
