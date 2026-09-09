const CACHE_NAME = 'map-app-v4';
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

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then(networkResponse => {
                if (event.request.url.includes('tile.openstreetmap.org')) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                }
                return networkResponse;
            });
        })
    );
});