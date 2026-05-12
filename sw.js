var CACHE_NAME = "presupuesto-v5";

self.addEventListener("install", function(event) {
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      var toDelete = [];
      for (var i = 0; i < names.length; i++) {
        if (names[i] !== CACHE_NAME) toDelete.push(caches.delete(names[i]));
      }
      return Promise.all(toDelete);
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  var url = event.request.url;
  if (url.indexOf("firebasejs") !== -1 ||
      url.indexOf("googleapis") !== -1 ||
      url.indexOf("dolarapi") !== -1 ||
      url.indexOf("firestore") !== -1) {
    return;
  }
  // Obliga al celular a intentar buscar la versión nueva de internet siempre
  event.respondWith(
    fetch(event.request).then(function(response) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function() {
      // Solo si no hay internet, usa la versión guardada en caché
      return caches.match(event.request);
    })
  );
});