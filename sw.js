const CACHE = "cineatlas-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/manifest.json",
  "/assets/favicon.png",
  "/assets/earth-minimal.jpg",
  // Needed for the globe country polygons
  "/assets/world.geojson"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Não cachear chamadas dinâmicas externas (TMDB/flagcdn/unpkg etc)
  const isExternal = url.origin !== self.location.origin;
  if (isExternal) return;

  // Network-first para /api/*
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // App shell: cache-first
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
