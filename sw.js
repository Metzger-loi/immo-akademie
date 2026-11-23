// Offline-Speicher der Immobilien-Akademie: online immer die neueste Version, offline die zuletzt geladene.
const CACHE = "immo-akademie-v3";
const DATEIEN = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(alle => Promise.all(alle.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const anfrage = e.request;
  if (anfrage.method !== "GET" || new URL(anfrage.url).origin !== location.origin) return;
  e.respondWith(
    fetch(anfrage)
      .then(antwort => {
        if (antwort.ok) { const kopie = antwort.clone(); caches.open(CACHE).then(c => c.put(anfrage, kopie)); }
        return antwort;
      })
      .catch(() => caches.match(anfrage, { ignoreSearch: true }).then(r => r || caches.match("./index.html")))
  );
});
