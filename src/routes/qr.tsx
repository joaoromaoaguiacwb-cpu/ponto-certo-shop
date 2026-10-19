import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { makeQr } from "@/lib/qr";
import logo from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "QR code da loja — Ponto Certo" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QrPage,
});

const Q = 4; // margem branca ao redor do QR

function QrPage() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.origin + "/"), []);

  const modules = useMemo(() => {
    try { return url ? makeQr(url) : null; } catch { return null; }
  }, [url]);

  const svgRef = useRef<SVGSVGElement>(null);

  const path = useMemo(() => {
    if (!modules) return "";
    let d = "";
    modules.forEach((row, y) => row.forEach((on, x) => { if (on) d += `M${x + Q} ${y + Q}h1v1h-1z`; }));
    return d;
  }, [modules]);

  const total = modules ? modules.length + Q * 2 : 0;

  const downloadPng = () => {
    if (!svgRef.current) return;
    const xml = new XMLSerializer().serializeToString(svgRef.current);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 1024;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, 1024, 1024);
      const a = document.createElement("a");
      a.href = c.toDataURL("image/png");
      a.download = "qr-ponto-certo.png";
      a.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-md print:max-w-none">
        <div className="mb-4 rounded-2xl bg-card p-4 shadow-card ring-1 ring-border print:hidden">
          <p className="text-sm font-bold text-primary">Endereço que o QR code vai abrir</p>
          <input value={url} onChange={(e) => setUrl(e.target.value.trim())} inputMode="url" autoCapitalize="none"
            className="mt-2 w-full rounded-xl border-2 border-border bg-card px-3 py-3 text-base outline-none focus:border-primary" />
          <p className="mt-2 text-xs text-muted-foreground">
            Abra esta página pelo endereço final da loja (o que o cliente vai usar), ou corrija o endereço acima antes de imprimir.
          </p>
          {!modules && url && <p className="mt-2 text-sm font-bold text-accent">Endereço inválido ou muito longo.</p>}
          <div className="mt-3 flex gap-2">
            <button onClick={() => window.print()} className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground active:scale-[.98]">🖨️ Imprimir</button>
            <button onClick={downloadPng} className="flex-1 rounded-full border-2 border-primary px-4 py-3 text-sm font-extrabold text-primary active:scale-[.98]">⬇️ Baixar PNG</button>
          </div>
          <a href="/" className="mt-3 block text-center text-sm font-bold text-primary underline">← Voltar à loja</a>
        </div>

        {/* Cartaz para imprimir */}
        <div className="rounded-3xl bg-white p-6 text-center shadow-card ring-1 ring-border print:rounded-none print:p-10 print:shadow-none print:ring-0">
          <img src={logo.url} alt="Ponto Certo" className="mx-auto h-16 w-auto print:h-24" />
          <div className="my-4 h-1.5 rounded-full bg-brand-stripe" />
          <h1 className="text-3xl font-black text-primary print:text-5xl">Peça pelo celular!</h1>
          <p className="mt-1 text-base font-semibold text-foreground print:text-2xl">Aponte a câmera para o QR code</p>
          {modules && (
            <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${total} ${total}`} shapeRendering="crispEdges"
              className="mx-auto mt-4 w-full max-w-xs print:max-w-md" role="img" aria-label="QR code da loja">
              <rect width={total} height={total} fill="#fff" />
              <path d={path} fill="#111" />
            </svg>
          )}
          <p className="mt-3 break-all text-sm font-bold text-primary print:text-xl">{url.replace(/^https?:\/\//, "")}</p>
          <p className="mt-1 text-sm text-muted-foreground print:text-lg">Atacado e supermercado • Pedido rápido pelo WhatsApp</p>
        </div>
      </div>
    </div>
  );
}
