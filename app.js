// 1. Initialize Map
const map = L.map('map', {
    maxZoom: 22 
}).setView([7.058, 80.34], 13); 

// 2. Load Google Maps Hybrid (Bottom Layer)
L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 22,
    attribution: '© Google'
}).addTo(map);

// 3A. Base Custom Imagery (Loads zoom 13-19 everywhere, stretches if you zoom deeper)
L.tileLayer('imagery_tiles/{z}/{x}/{y}.png', {
    minZoom: 13,
    maxNativeZoom: 19, 
    maxZoom: 22,       
    tms: false
}).addTo(map);

// 3B. High-Res Inset (Loads ONLY zoom 20 for your critical areas)
L.tileLayer('imagery_tiles/{z}/{x}/{y}.png', {
    minZoom: 20,
    maxNativeZoom: 20,
    maxZoom: 22,
    tms: false,
    // If a zoom 20 tile doesn't exist outside your inset, this makes the error invisible so the stretched zoom 19 shows through cleanly!
    errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
}).addTo(map);

// 4. Your updated .geojson files (exactly 17 files)
const spatialFiles = [
    'AMSL_115.geojson', 'AMSL_125.geojson', 'C_TINN_BNDY.geojson', 'Camp_sites.geojson',
    'Contour.geojson', 'DAM.geojson', 'Diversion_Canal.geojson', 'Excavation_area.geojson',
    'Existing_Buildings.geojson', 'Irrigation_outlet.geojson', 'New_access.geojson',
    'Power_house.geojson', 'PS.geojson', 'Road.geojson', 'Saddle_dam.geojson', 'Wee_Oya.geojson', 
    'Road_Corridor.geojson'
];

// 17 colors to match the 17 files
const layerColors = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', 
    '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', 
    '#9a6324', '#fffac8', '#800000', '#aaffc3', '#000000'
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

// 5. GPS Tracking
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

// 6. Register Service Worker for Offline Mode
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}
