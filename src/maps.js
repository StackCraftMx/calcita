// Un mapa con marcadores (@stackcraftmx/calcita/maps): Leaflet con los mosaicos de OpenStreetMap. Pide leaflet y
// react-leaflet: por eso va en su propia puerta y solo viaja a la pantalla que lo usa.
export {OPEN_STREET_MAP_TILES, default as MapView} from '@/maps/MapView.jsx';
export {MAP_PIN_SIZE, boundsOfMarkers, mapPinHtmlOf} from '@/maps/mapMarkers.js';
