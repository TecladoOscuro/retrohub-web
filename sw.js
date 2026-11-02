/* Service worker: network-first para HTML (evita shells obsoletas),
   cache-first solo para estáticos propios. */
const CACHE = "retrohub-web-v6";
const SHELL = [
  "./",
  "./index.html",
  "./play.html",
  "./app.js",
  "./idb.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // Navegaciones y HTML: red primero, cache como respaldo offline.
  if (event.request.mode === "navigate" || url.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Estáticos propios: cache primero.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
