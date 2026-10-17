// El espaciado entre letras (tracking) de la letra del sistema de Apple, según el tamaño: la tabla de SF Pro de la guía
// (HIG «Typography», «Tracking values», iOS; la de macOS es la misma), en milésimas de em.
//
// Por qué hace falta en la web: en sus apps, iOS lo aplica solo desde su API de letras (UIFont), no desde el archivo de
// la letra, así que el navegador no lo hace. Y MUI trae uno POSITIVO pensado para Roboto; con la letra del sistema se veía
// separada. Apple de 13 a 22 pt lo cierra y en los tamaños chicos lo abre.
//
// OJO: el espaciado en em se calcula con el tamaño de letra DEL ELEMENTO que lo declara. Un componente que cambia su
// tamaño (una etiqueta de 13 px con el estilo del cuerpo, de 16) tiene que traer el suyo: textSizeOf(13). Si no, se
// queda con el de 16 y las letras salen muy juntas (pasó con «Desde» y el control segmentado; lo reportaron).
//
// Funciones puras, sin React: function (regla de la casa).

// la tabla de SF Pro de Apple, tamaño en pt (= px en la web) → milésimas de em
const APPLE_TRACKING_PER_MILLE = Object.freeze({
    10: 12, 11: 6, 12: 0, 13: -6, 14: -11, 15: -16, 16: -20, 17: -26, 20: -23, 22: -12, 24: 3, 28: 14, 34: 12, 48: 8, 60: 4, 96: 0,
});
const KNOWN_SIZES = Object.keys(APPLE_TRACKING_PER_MILLE).map(Number).sort((first, second) => first - second);

/**
 * El tracking de un tamaño, en em. Entre dos tamaños de la tabla se reparte en línea recta; fuera de ella, el del extremo.
 *
 * @param {number} sizePixels
 * @returns {string} p. ej. '-0.02em'
 */
export function trackingOf(sizePixels) {
    const smaller = [...KNOWN_SIZES].reverse().find((size) => size <= sizePixels) ?? KNOWN_SIZES[0];
    const larger = KNOWN_SIZES.find((size) => size >= sizePixels) ?? KNOWN_SIZES[KNOWN_SIZES.length - 1];
    const share = larger === smaller ? 0 : (sizePixels - smaller) / (larger - smaller);
    const perMille = APPLE_TRACKING_PER_MILLE[smaller] + share * (APPLE_TRACKING_PER_MILLE[larger] - APPLE_TRACKING_PER_MILLE[smaller]);
    return `${Math.round(perMille) / 1000}em`;
}

/**
 * Un tamaño de letra con SU espaciado: lo que se pone en el sx de un componente que cambia el tamaño de su letra.
 *
 * @param {number} sizePixels
 * @returns {{fontSize: string, letterSpacing: string}} el tamaño en rem (crece con el tamaño de letra que elige la persona)
 */
export function textSizeOf(sizePixels) {
    return {fontSize: `${sizePixels / 16}rem`, letterSpacing: trackingOf(sizePixels)};
}
