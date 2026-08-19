/* Tour de Bourgogne à vélo — service worker v10.1.0
   - App shell : cache-first (index, manifest, icônes, Leaflet, fonts)
   - Tuiles OSM : network-first avec mise en cache à la volée
     → les zones consultées en ligne restent visibles hors-ligne */
'use strict';

var VERSION = 'bourgogne-v10.1.0';
var SHELL_CACHE = VERSION + '-shell';
var TILE_CACHE = VERSION + '-tiles';
var TILE_LIMIT = 400;

var SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Spline+Sans:wght@400;500;600&family=Spline+Sans+Mono:wght@400;500&display=swap'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(SHELL_CACHE).then(function (c) {
      // addAll individuel pour ne pas tout faire échouer si une ressource CDN bloque
      return Promise.all(SHELL.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k.indexOf(VERSION) !== 0) { return caches.delete(k); }
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function trimTiles() {
  caches.open(TILE_CACHE).then(function (c) {
    c.keys().then(function (keys) {
      if (keys.length > TILE_LIMIT) {
        c.delete(keys[0]).then(trimTiles);
      }
    });
  });
}

self.addEventListener('fetch', function (e) {
  var url = e.request.url;
  if (e.request.method !== 'GET') { return; }

  // Tuiles OSM : réseau d'abord, cache en secours
  if (url.indexOf('tile.openstreetmap.org') !== -1) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(TILE_CACHE).then(function (c) {
          c.put(e.request, copy);
          trimTiles();
        });
        return res;
      }).catch(function () {
        return caches.match(e.request);
      })
    );
    return;
  }

  // Routage BRouter : réseau d'abord, cache en secours (URL complète avec query)
  if (url.indexOf('brouter.de') !== -1) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(TILE_CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(e.request);
      })
    );
    return;
  }

  // Fonts Google (fichiers woff2 sur fonts.gstatic.com) : cache-first à la volée
  if (url.indexOf('fonts.gstatic.com') !== -1) {
    e.respondWith(
      caches.match(e.request).then(function (hit) {
        return hit || fetch(e.request).then(function (res) {
          var copy = res.clone();
          caches.open(SHELL_CACHE).then(function (c) { c.put(e.request, copy); });
          return res;
        });
      })
    );
    return;
  }

  // Navigations (index) : RÉSEAU d'abord — en ligne on a toujours la dernière
  // version, hors ligne le cache prend le relais. Fini les mises à jour bloquées.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(SHELL_CACHE).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Reste du shell + CDN : cache-first, réseau en secours
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(e.request);
    })
  );
});
