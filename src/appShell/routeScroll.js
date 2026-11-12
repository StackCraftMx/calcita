// Dónde queda la página al cambiar de pantalla dentro del marco (AppLayout, prop scrollRestoration):
//   - a otra pantalla (otra dirección): arriba. Sin esto el navegador conserva lo deslizado, y el detalle que se abría desde
//     la mitad de una lista empezaba a media altura, con su encabezado fuera de la vista;
//   - de regreso («atrás» o «adelante» del navegador): donde iba la persona en esa pantalla;
//   - si solo cambia la consulta de la dirección (?page=3, los filtros de una tabla), la página se queda donde está: es la
//     misma pantalla y la tabla guarda ahí su página y sus filtros. Si no, cada «Siguiente» de la tabla brincaría arriba.
//
// Lo que se recuerda es cuánto iba deslizada cada pantalla, por su dirección SIN la consulta (/orders, no /orders?page=2), en
// la sesión de la pestaña (sessionStorage): sobrevive a recargar la página, como lo del navegador, y se borra al cerrar la
// pestaña. OJO: la consulta no sirve para reconocer la pantalla: la tabla (nuqs) la cambia sin avisarle al router, y la
// posición se guardaba con la dirección vieja (medido en Pedidos: al recargar en la página 2 se iba hasta arriba).
//
// Funciones puras, no renderizan: function (regla de la casa). Pruebas en routeScroll.test.js; el hook que las usa es
// useRouteScroll.js.

/** Qué hace la página al cambiar de pantalla: arriba, a donde iba (regreso) o se queda (misma pantalla). */
export const ROUTE_SCROLL = Object.freeze({top: 'top', restore: 'restore', stay: 'stay'});

// cuántas pantallas se recuerdan: las más viejas se olvidan. Cada una pesa unos bytes, pero una pestaña puede vivir días
export const MAX_REMEMBERED_SCREENS = 50;

/**
 * Qué hace la página al pintarse otra pantalla.
 *
 * @param {object} change
 * @param {string} change.previousPathname la dirección de la pantalla que se veía (sin la consulta)
 * @param {string} change.pathname la de la que se va a ver
 * @param {boolean} change.isHistoryMove llegó por «atrás» o «adelante» del navegador
 * @returns {'top'|'restore'|'stay'} uno de ROUTE_SCROLL
 */
export function routeScrollOf({previousPathname, pathname, isHistoryMove}) {
    if (isHistoryMove) {
        return ROUTE_SCROLL.restore;
    }
    return previousPathname === pathname ? ROUTE_SCROLL.stay : ROUTE_SCROLL.top;
}

/**
 * Las posiciones recordadas con la de una pantalla al día. La recién guardada va al final; si ya son más de
 * MAX_REMEMBERED_SCREENS, se olvidan las que llevan más tiempo sin visitarse.
 *
 * @param {Record<string, number>} positions {dirección de la pantalla: px deslizados}
 * @param {string} screenKey la dirección sin la consulta
 * @param {number} top lo deslizado, en px
 * @returns {Record<string, number>} uno nuevo; el que llega no se toca
 */
export function withRememberedPosition(positions, screenKey, top) {
    const {[screenKey]: unusedPrevious, ...others} = positions;
    const otherKeys = Object.keys(others);
    const keptKeys = otherKeys.slice(Math.max(0, otherKeys.length - (MAX_REMEMBERED_SCREENS - 1)));
    const kept = Object.fromEntries(keptKeys.map((key) => [key, others[key]]));
    return {...kept, [screenKey]: Math.max(0, Math.round(top))};
}

/**
 * Las posiciones guardadas en la sesión, leídas con cuidado: lo que no sea {texto: número} se ignora (otra versión del
 * paquete, alguien que lo editó a mano). Nunca truena: sin posiciones, la página solo empieza arriba.
 *
 * @param {string|null} storedText lo que hay en sessionStorage
 * @returns {Record<string, number>}
 */
export function rememberedPositionsOf(storedText) {
    if (!storedText) {
        return {};
    }
    let stored;
    try {
        stored = JSON.parse(storedText);
    } catch {
        return {};
    }
    if (stored === null || typeof stored !== 'object' || Array.isArray(stored)) {
        return {};
    }
    return Object.fromEntries(Object.entries(stored).filter(([, top]) => Number.isFinite(top) && top >= 0));
}
