// 1. Initialize Map (Force the map container to allow deep zooming)
const map = L.map('map', {
    maxZoom: 22 
}).setView([7.058, 80.34], 13); 

// 2. Load Local Custom Imagery Basemap
L.tileLayer('imagery_tiles/{z}/{x}/{y}.png', {
    minZoom: 13,
    maxNativeZoom: 18, // Change this to the highest zoom level you exported from QGIS
    maxZoom: 22,       // How far you are allowed to pinch-to-zoom on your screen
    tms: false,
    attribution: 'Project Imagery'
}).addTo(map);
// 3. Your updated .geojson files
const spatialFiles = [
    'AMSL_115.geojson', 'AMSL_125.geojson', 'C_TINN_BNDY.geojson', 'Camp_sites.geojson',
    'Contour.geojson', 'DAM.geojson', 'Diversion_canal.geojson', 'Excavation_area.geojson',
    'Existing_Buildings.geojson', 'Irrigation_outlet.geojson', 'New_access.geojson',
    'Power_house.geojson', 'PS.geojson', 'Road.geojson', 'Saddle_dam.geojson', 'Wee_Oya.geojson'
];

const layerColors = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', 
    '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', 
    '#9a6324', '#fffac8', '#800000', '#aaffc3'
];

const allLayersGroup = L.featureGroup().addTo(map);

// Load files robustly
spatialFiles.forEach(async (file, index) => {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        
        const data = await response.json();
        
        L.geoJSON(data, {
            style: { color: layerColors[index], weight: 2, fillOpacity: 0.4 }
        }).addTo(allLayersGroup);

        // Auto-zoom map to fit data
        map.fitBounds(allLayersGroup.getBounds());

    } catch (error) {
        console.error(`FAILED to load ${file}:`, error);
    }
});

// 4. GPS Tracking
const userMarker = L.circleMarker([0, 0], { color: 'red', radius: 8, fillOpacity: 1 }).addTo(map);

if ('geolocation' in navigator) {
    navigator.geolocation.watchPosition(
        (position) => {
            userMarker.setLatLng([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("GPS Error:", error),
        { enableHighAccuracy: true }
    );
}

// 5. Register Service Worker for Offline Mode
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}
