// Service worker mínimo: deixa o site instalável sem guardar páginas em cache
// (assim a loja sempre abre com preços, estoque e horário atualizados).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(
    fetch(e.request).catch(
      () =>
        new Response(
          '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sem internet</title><body style="font-family:sans-serif;text-align:center;padding:4rem 1rem"><h2>Sem internet 📶</h2><p>Conecte-se e tente de novo.</p>',
          { headers: { "Content-Type": "text/html; charset=utf-8" } },
        ),
    ),
  );
});
