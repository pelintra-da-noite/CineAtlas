/* sw.js — CineAtlas
   Estratégia:
   - HTML / navegação: network-first (evita versões antigas presas no cache)
   - Assets (css/js/img/etc): cache-first (performance + offline)
*/

const CACHE = "cineatlas-v2";

// Lista base para precache (ajusta/expande conforme necessário)
const PRECACHE_URLS = [
  "/",                 // pode mapear para index.html
  "/index.html",
  "/styles.css",
  "/script.js",
  "/manifest.json",
  "/privacy.html",
  "/assets/world.geojson",

  // Se tiveres ícones, adiciona aqui (exemplos comuns):
  // "/assets/icon-192.png",
  // "/assets/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // addAll falha se algum URL não existir; por isso mantém só o que tens mesmo no projeto
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Só trata GET
  if (req.method !== "GET") return;

  // HTML / navegação: NETWORK FIRST
  const accept = req.headers.get("accept") || "";
  const isHTML = req.mode === "navigate" || accept.includes("text/html");

  if (isHTML) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (e) {
          // Se estiver offline, tenta devolver a página do cache
          const cached = await caches.match(req);
          if (cached) return cached;

          // fallback final para index.html (se estiver em cache)
          return (await caches.match("/index.html")) || Response.error();
        }
      })()
    );
    return;
  }

  // Assets / resto: CACHE FIRST
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);

        // Só guarda respostas "ok" (evita cachear erros/opaque estranhos)
        if (fresh && fresh.ok) {
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (e) {
        // Sem rede e sem cache => falha
        return Response.error();
      }
    })()
  );
});
