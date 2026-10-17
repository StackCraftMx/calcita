// Los colores del tema que elige la persona en el configurador: los comparten la app (que arma su tema con ellos) y el
// configurador (que los edita y exporta su código). Sin React: se prueba con node --test (themeColors.test.js).
//
// Las reglas:
//   - se parte de las paletas de Stackcraft (fondo, texto, grises) y solo cambian los colores que se eligieron DISTINTOS a los
//     de fábrica: con los de fábrica, el tema queda idéntico al de siempre (changedColorsOf);
//   - de cada color basta el «main»: MUI saca su versión clara, la oscura y el color de la letra encima;
//   - en oscuro, los colores de estado (éxito, aviso, error, información) se aclaran en sus tres tonos: el mismo de claro
//     sobre un fondo casi negro no se lee. El principal y el secundario se quedan igual: son la marca.
import {lighten} from '@mui/material/styles';
import {STACKCRAFT, stackcraftLightPalette} from '@stackcraftmx/calcita';

/** Los colores que se eligen, en el orden en que se piden. */
export const THEME_COLOR_KEYS = Object.freeze(['primary', 'secondary', 'success', 'warning', 'error', 'info']);

/** Los de fábrica (Stackcraft), en mayúsculas como los deja el campo de color. */
export const STACKCRAFT_COLORS = Object.freeze(Object.fromEntries(Object.entries({
    primary: STACKCRAFT.forge,
    secondary: stackcraftLightPalette.secondary.main,
    success: stackcraftLightPalette.success.main,
    warning: stackcraftLightPalette.warning.main,
    error: stackcraftLightPalette.error.main,
    info: stackcraftLightPalette.info.main,
}).map(([key, color]) => [key, color.toUpperCase()])));

/** Las esquinas de fábrica del framework (px). */
export const DEFAULT_CORNER_RADIUS = 8;

// los colores de estado que en oscuro se aclaran, y cuánto (0 a 1) en cada tono
const STATUS_COLOR_KEYS = Object.freeze(['success', 'warning', 'error', 'info']);
const DARK_STATUS_LIGHTEN = Object.freeze({main: 0.35, light: 0.55, dark: 0.15});

/**
 * Un color de estado en oscuro: sus tres tonos más claros que el elegido. MUI saca el «dark» oscureciendo el main, y sobre
 * un fondo casi negro (la cifra de una tarjeta, el texto de un aviso) casi no se leía: aquí también va aclarado.
 *
 * @param {string} color
 * @returns {{main: string, light: string, dark: string}}
 */
export function darkStatusColorOf(color) {
    return {
        main: lighten(color, DARK_STATUS_LIGHTEN.main),
        light: lighten(color, DARK_STATUS_LIGHTEN.light),
        dark: lighten(color, DARK_STATUS_LIGHTEN.dark),
    };
}

/**
 * ¿Se aclara este color en oscuro? Los de estado sí; la marca no.
 *
 * @param {string} key
 * @returns {boolean}
 */
export function isStatusColor(key) {
    return STATUS_COLOR_KEYS.includes(key);
}

/**
 * Solo los colores que la persona cambió (distintos a los de fábrica).
 *
 * @param {Record<string, string>} colors
 * @returns {Record<string, string>}
 */
export function changedColorsOf(colors) {
    return Object.fromEntries(THEME_COLOR_KEYS
        .filter((key) => colors[key] && colors[key].toUpperCase() !== STACKCRAFT_COLORS[key])
        .map((key) => [key, colors[key]]));
}

/**
 * La paleta de un modo: la base con los colores dados.
 *
 * @param {object} basePalette stackcraftLightPalette o stackcraftDarkPalette
 * @param {Record<string, string>} colors {primary: '#FF6B1A', …}
 * @param {boolean} isDark
 * @returns {object}
 */
export function paletteWithColors(basePalette, colors, isDark) {
    const chosen = Object.fromEntries(THEME_COLOR_KEYS.filter((key) => colors[key]).map((key) => (
        [key, isDark && isStatusColor(key) ? darkStatusColorOf(colors[key]) : {main: colors[key]}]
    )));
    return {...basePalette, ...chosen};
}
