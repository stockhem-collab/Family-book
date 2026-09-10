// Manuell service worker (se CLAUDE.md: "next-pwa eller manuell service
// worker" – valde manuell för att slippa next-pwas friktion med App Router
// + Turbopack på senaste Next-versionerna).

const CACHE_NAME = "familjen-cache-v1";
const PRECACHE_URLS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const OFFLINE_HTML = `<!doctype html>
<html lang="sv">
  <head><meta charset="utf-8" /><title>Offline – Familjen</title></head>
  <body style="font-family: sans-serif; padding: 2rem; color: #2A2A38;">
    <h1>Du är offline</h1>
    <p>Familjen behöver en internetanslutning för att hämta aktuell information.</p>
  </body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.url.includes("/auth/")) return;

  // Rör aldrig API-/Supabase-anrop – appen ska aldrig visa cachad, inaktuell
  // familjedata som om den vore live.
  if (request.method !== "GET" || request.url.includes("/api/")) {
    return;
  }

 if (request.mode === "navigate") {
  return;
}

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
    )
  );
});

// Grundläggande stöd för Web Push – redo för v1.1 (morgonbrief), men ingen
// prenumerationslogik är kopplad ännu.
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Familjen", {
      body: data.body,
      icon: "/icons/icon-192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url ?? "/"));
});
