// Registrar el Service Worker para la PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').catch(function(err){ console.log('SW fail', err); });
  });
}

// Inicializar Firebase y cargar entorno
loadDolarCache();
initFb();
loadD();
render();
fetchDolar();
