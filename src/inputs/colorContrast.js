// Contraste de un color contra el papel blanco, con la fórmula de WCAG 2.2 (criterio 1.4.3), y el mismo tono oscurecido lo
// justo para que se lea. Viene del campo de color de PLD («Identidad de documentos»).
//
// Sirve para avisar MIENTRAS se elige un color; si el color importa (un comprobante, la marca de un cliente), el servidor
// vuelve a revisarlo.
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (colorContrast.test.js).

/** El contraste mínimo de WCAG AA para texto normal. */
export const MIN_CONTRAST = 4.5;
/** Un color escrito como #RRGGBB. */
export const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const CHANNEL_MAX = 255;
// la fórmula de luminancia relativa de WCAG (sRGB)
const LINEAR_THRESHOLD = 0.04045;
const LINEAR_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA = 2.4;
const LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722];
const WHITE_LUMINANCE_PLUS_FLARE = 1.05;
const FLARE = 0.05;
// cuánto se oscurece en cada intento al buscar el tono que sí se lee
const DARKENING_STEP = 0.02;

/**
 * Los tres canales de un color #RRGGBB, de 0 a 255.
 *
 * @param {string} color
 * @returns {number[]}
 */
function channelsOf(color) {
    return [1, 3, 5].map((start) => parseInt(color.slice(start, start + 2), 16));
}

/**
 * Un canal en su valor lineal (la fórmula de WCAG).
 *
 * @param {number} value 0 a 255
 * @returns {number}
 */
function linearChannelOf(value) {
    const scaled = value / CHANNEL_MAX;
    return scaled <= LINEAR_THRESHOLD ? scaled / LINEAR_DIVISOR : ((scaled + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA;
}

/**
 * Cuánto contrasta un color sobre blanco: 21 es negro, 1 es blanco.
 *
 * @param {string} color #RRGGBB
 * @returns {number|null} null si no es un color #RRGGBB
 */
export function contrastOnWhite(color) {
    if (!HEX_COLOR.test(color ?? '')) {
        return null;
    }
    const luminance = channelsOf(color).map(linearChannelOf).reduce((sum, value, position) => sum + value * LUMINANCE_WEIGHTS[position], 0);
    return WHITE_LUMINANCE_PLUS_FLARE / (luminance + FLARE);
}

/**
 * El mismo tono, oscurecido lo justo para llegar a MIN_CONTRAST sobre blanco. Si ya se lee, regresa el mismo.
 *
 * @param {string} color #RRGGBB
 * @returns {string|null} #RRGGBB en mayúsculas; null si no es un color #RRGGBB
 */
export function readableVariantOf(color) {
    if (!HEX_COLOR.test(color ?? '')) {
        return null;
    }
    const channels = channelsOf(color);
    let factor = 1;
    let candidate = color.toUpperCase();
    while (contrastOnWhite(candidate) < MIN_CONTRAST && factor > 0) {
        factor = Math.round((factor - DARKENING_STEP) * 100) / 100;
        candidate = `#${channels.map((value) => Math.round(value * factor).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
    }
    return candidate;
}
