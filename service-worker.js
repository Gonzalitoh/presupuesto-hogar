var CACHE_NAME = "presupuesto-v1";
var URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request).then(function(netResponse) {
        return caches.open(CACHE_NAME).then(function(cache) {
          if (event.request.url.indexOf("firebasejs") === -1 &&
              event.request.url.indexOf("googleapis") === -1) {
            cache.put(event.request, netResponse.clone());
          }
          return netResponse;
        });
      }).catch(function() {
        return response;
      });
    })
  );
});
