const CACHE_NAME = "golf-assistant-cache-v22";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icons.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  const requestUrl = new URL(event.request.url);

  if (event.request.method !== "GET" ||
    requestUrl.origin !== self.location.origin ||
    requestUrl.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
        }

        return response;
      })
      .catch(function () {
        return caches.match(event.request).then(function (cachedResponse) {
          return cachedResponse || caches.match("./index.html");
        });
      })
  );
});
