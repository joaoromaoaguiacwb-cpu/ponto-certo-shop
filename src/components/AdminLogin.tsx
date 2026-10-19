import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { loginAdmin } from "@/lib/admin";

export function AdminLogin({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const submit = async () => {
    let ok = false;
    try {
      ok = await loginAdmin(pw);
    } catch {
      ok = false;
    }
    if (ok) onSuccess();
    else {
      setError(true);
      setPw("");
      ref.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div role="dialog" aria-label="Acesso administrativo" onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-float ring-1 ring-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-primary">Acesso administrativo</h2>
          <button aria-label="Fechar" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-muted"><X size={16} /></button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Digite a senha para editar os produtos.</p>
        <input ref={ref} type="password" value={pw} autoComplete="off" placeholder="Senha"
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          className="mt-4 w-full rounded-full border-2 border-border bg-background px-4 py-3 outline-none focus:border-primary" />
        {error && <p className="mt-2 text-sm font-semibold text-destructive">Senha incorreta.</p>}
        <button onClick={submit}
          className="mt-4 w-full rounded-full bg-primary px-4 py-3 font-extrabold text-primary-foreground active:scale-95">Entrar</button>
      </div>
    </div>
  );
}
