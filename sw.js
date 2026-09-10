const CACHE_NAME = 'map-app-v9';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/AMSL_115.geojson',
    '/AMSL_125.geojson',
    '/C_TINN_BNDY.geojson',
    '/Camp_sites.geojson',
    '/Contour.geojson',
    '/DAM.geojson',
    '/Diversion_canal.geojson',
    '/Excavation_area.geojson',
    '/Existing_Buildings.geojson',
    '/Irrigation_outlet.geojson',
    '/New_access.geojson',
    '/Power_house.geojson',
    '/PS.geojson',
    '/Road.geojson',
    '/Saddle_dam.geojson',
    '/Wee_Oya.geojson',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install: Cache files and force immediate takeover
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

// Activate: Delete any old, broken caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch: Intercept requests. If offline, serve from cache.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then(networkResponse => {
                
                // Cache both your local tiles AND the Google Map tiles
                if (event.request.url.includes('imagery_tiles') || event.request.url.includes('mt1.google.com')) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                }
                
                return networkResponse;
            });
        }).catch(() => {
            console.error("Offline and file not in cache:", event.request.url);
        })
    );
});
