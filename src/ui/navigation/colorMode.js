// A qué modo lleva el interruptor de claro / oscuro (ui/navigation/ColorSchemeToggle.jsx) y en qué modo pintar lo
// que no es de MUI (el Toaster de sonner).
//
// Aparte del componente para probarlo sin navegador (colorMode.test.js).
//
// Funciones puras, no renderizan: function (regla de la casa).

const COLOR_MODES = ['light', 'dark'];

/**
 * El modo que SE ESTÁ viendo. Con mode 'system' manda lo que diga el sistema operativo; antes de montar en el cliente
 * MUI todavía no sabe el modo y regresa undefined.
 *
 * @param {string|undefined} mode 'light' | 'dark' | 'system' (useColorScheme de MUI)
 * @param {string|undefined} systemMode 'light' | 'dark' (lo que dice el sistema operativo)
 * @returns {'light'|'dark'} el modo visible; 'light' si todavía no se sabe
 */
export function resolvedColorModeOf(mode, systemMode) {
    const visibleMode = mode === 'system' ? systemMode : mode;
    return COLOR_MODES.includes(visibleMode) ? visibleMode : 'light';
}

/**
 * El modo al que lleva el interruptor: siempre el contrario del que se ve. Dos estados y no tres: un «Sistema» en la
 * barra le agrega una decisión al usuario sin resolverle nada.
 *
 * @param {string|undefined} mode 'light' | 'dark' | 'system'
 * @param {string|undefined} systemMode 'light' | 'dark'
 * @returns {'light'|'dark'}
 */
export function nextColorModeOf(mode, systemMode) {
    return resolvedColorModeOf(mode, systemMode) === 'dark' ? 'light' : 'dark';
}
