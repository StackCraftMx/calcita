// Los tamaños de letra que la persona puede elegir (del tema de walk-ot). Todo el tema está en rem, así que basta con
// cambiar la letra de la raíz (<html>) para que crezca toda la pantalla, también las tablas y los diálogos.
//
// Funciones puras, sin React: function (regla de la casa).

/** La letra de la raíz del navegador: la base de los rem. Con menos de 16 px el iPhone hace zoom al entrar a un campo. */
export const ROOT_FONT_SIZE_PIXELS = 16;

/** Dónde se recuerda la elección en este navegador. */
export const FONT_SIZE_STORAGE_KEY = 'calcita:fontSize';

/** Los niveles: su llave, cuánto crece la letra y su texto. */
export const FONT_SIZE_LEVELS = Object.freeze([
    {key: 'normal', multiplier: 1, labelKey: 'layout:fontSize.normal'},
    {key: 'large', multiplier: 1.15, labelKey: 'layout:fontSize.large'},
    {key: 'xLarge', multiplier: 1.3, labelKey: 'layout:fontSize.xLarge'},
]);

export const DEFAULT_FONT_SIZE_LEVEL = 'normal';

/**
 * La letra de la raíz para un nivel; con una llave que no existe, la normal.
 *
 * @param {string} levelKey
 * @returns {string} p. ej. '18.4px'
 */
export function rootFontSizeOf(levelKey) {
    const level = FONT_SIZE_LEVELS.find((candidate) => candidate.key === levelKey);
    return `${ROOT_FONT_SIZE_PIXELS * (level?.multiplier ?? 1)}px`;
}

/**
 * ¿Es un nivel que existe? (lo guardado en el navegador puede venir de otra versión).
 *
 * @param {unknown} levelKey
 * @returns {boolean}
 */
export function isFontSizeLevel(levelKey) {
    return FONT_SIZE_LEVELS.some((level) => level.key === levelKey);
}
