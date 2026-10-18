// Lo puro de los marcadores del mapa: el dibujo del alfiler (SVG, sin imágenes) y el recuadro que encierra a todos.
//
// Por qué un SVG y no la imagen de Leaflet: el ícono de Leaflet son archivos .png que el empaquetador del proyecto no
// encuentra (el marcador sale roto, sin imagen). El alfiler se dibuja con el color del tema y no pide archivos.
//
// Funciones puras, sin React ni Leaflet: function (regla de la casa).

/** El alfiler: su tamaño normal y el del elegido (px). */
export const MAP_PIN_SIZE = Object.freeze({normal: 32, selected: 44});

/**
 * El HTML del alfiler para un divIcon de Leaflet: la gota del color pedido con un punto blanco al centro. El color va en
 * style y no en el atributo fill: así acepta las variables CSS del tema (var(--mui-palette-…)) en todos los navegadores.
 *
 * @param {string} color cualquier color de CSS (también var(--mui-palette-…))
 * @param {boolean} [isSelected]
 * @returns {string}
 */
export function mapPinHtmlOf(color, isSelected = false) {
    const size = isSelected ? MAP_PIN_SIZE.selected : MAP_PIN_SIZE.normal;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">`
        + `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" style="fill:${color}" stroke="white" stroke-width="1.2"/>`
        + '<circle cx="12" cy="9" r="2.6" fill="white"/></svg>';
}

/**
 * El recuadro que encierra a todos los marcadores ([[sur, oeste], [norte, este]]), para acomodar el mapa; null sin marcadores.
 *
 * @param {Array<{position: [number, number]}>} markers
 * @returns {[[number, number], [number, number]]|null}
 */
export function boundsOfMarkers(markers) {
    if (!markers?.length) {
        return null;
    }
    const latitudes = markers.map((marker) => marker.position[0]);
    const longitudes = markers.map((marker) => marker.position[1]);
    return [[Math.min(...latitudes), Math.min(...longitudes)], [Math.max(...latitudes), Math.max(...longitudes)]];
}
