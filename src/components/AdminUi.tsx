import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const saveError = () => toast.error("Não foi possível salvar. O espaço do navegador pode estar cheio.");
export const field = "mt-1 w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

export function ActiveToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={on}
      className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${on ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
      {on ? "Ativo" : "Desativado"}
    </button>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div role="dialog" onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-5 shadow-float ring-1 ring-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-primary">{title}</h2>
          <button aria-label="Fechar" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-muted"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Section({ title, hint, onAdd, addLabel, children }: {
  title: string; hint: string; onAdd?: () => void; addLabel?: string; children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-4 pb-10 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-extrabold text-primary">{title}</h2>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground"><Plus size={14} /> {addLabel}</button>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function Row({ title, sub, on, onToggle, onEdit, onDelete }: {
  title: string; sub: string; on: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <li className={`flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card ring-1 ring-border ${on ? "" : "opacity-70"}`}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <ActiveToggle on={on} onClick={onToggle} />
      <button aria-label={`Editar ${title}`} onClick={onEdit} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-primary"><Pencil size={16} /></button>
      <button aria-label={`Apagar ${title}`} onClick={onDelete} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-destructive"><Trash2 size={16} /></button>
    </li>
  );
}
