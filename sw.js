const CACHE = 'plf-cotizador-v3';
const ASSETS = [
    './index.html',
    './logo-plf.png',
    'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.10.0/tabler-icons.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE)
            .then(function(cache) {
                console.log('Caching assets');
                return cache.addAll(ASSETS);
            })
            .then(function() {
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) {
                    return key !== CACHE;
                }).map(function(key) {
                    console.log('Deleting old cache:', key);
                    return caches.delete(key);
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(cached) {
            if (cached) {
                return cached;
            }
            return fetch(e.request).then(function(response) {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                var responseToCache = response.clone();
                caches.open(CACHE).then(function(cache) {
                    cache.put(e.request, responseToCache);
                });
                return response;
            }).catch(function() {
                return cached;
            });
        })
    );
});
