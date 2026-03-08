const CACHE_NAME = "app-cache-v7";
const OFFLINE_URL = "/movies/offline";
const PRECACHE_ASSETS = [OFFLINE_URL];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_ASSETS).then(() => self.skipWaiting());
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => clients.claim())
  );
});

self.addEventListener("fetch", event => {
  var url = new URL(event.request.url);

  // Only handle http/https requests from our own origin
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== "GET") return;

  var accept = event.request.headers.get("accept") || "";

  if (accept.includes("text/html")) {
    // HTML: network-first, fall back to cache, then offline page
    event.respondWith(
      fetchAndCache(event.request)
        .catch(() => caches.match(event.request.url))
        .then(function (response) {
          return response || caches.match(OFFLINE_URL);
        })
        .then(function (response) {
          return response || new Response("Offline", { status: 503, statusText: "Offline" });
        })
    );
  } else {
    // CSS, JS, images: network-first, fall back to cache
    event.respondWith(
      fetchAndCache(event.request)
        .catch(() => caches.match(event.request.url))
        .then(function (response) {
          if (response) return response;
          return fetch(event.request);
        })
    );
  }
});

function fetchAndCache(request) {
  return fetch(request).then(response => {
    if (!response.ok) {
      throw new TypeError("Bad response status");
    }
    var clone = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
    return response;
  });
}