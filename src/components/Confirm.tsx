export function Confirm({ title, text, action, danger, onConfirm, onCancel }: {
  title: string; text: string; action: string; danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4" onClick={onCancel}>
      <div role="alertdialog" onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-float ring-1 ring-border">
        <h2 className="text-lg font-extrabold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-full bg-muted px-4 py-2.5 font-bold">Cancelar</button>
          <button onClick={onConfirm}
            className={`flex-1 rounded-full px-4 py-2.5 font-extrabold ${danger ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>{action}</button>
        </div>
      </div>
    </div>
  );
}
