// Lo que jsdom (el navegador de mentira de las pruebas) no trae y la app sí usa.
//
// Cada hueco se llena con lo mínimo para que la pantalla se dibuje. Ninguna prueba depende de que esto haga algo de
// verdad: jsdom no mide ni pinta, así que tamaños, scroll y medidas de pantalla no se prueban aquí (eso es de un navegador
// de verdad, con Playwright).
//
// Funciones puras, no renderizan: function (regla de la casa).

/**
 * Los archivos que la pantalla mandó guardar (una descarga), en orden: {fileName, href}. jsdom no sabe descargar; aquí se
 * anota el nombre para que la prueba revise qué se habría guardado.
 */
export const savedFiles = [];

/** Observador de tamaño o de vista que nunca avisa: en jsdom todo mide 0 y no cambia. */
class SilentObserver {
    observe() {}

    unobserve() {}

    disconnect() {}

    takeRecords() {
        return [];
    }
}

/**
 * Consulta de medios que nunca coincide: la pantalla se dibuja como en escritorio y en modo claro.
 *
 * @param {string} media la consulta, p. ej. '(prefers-color-scheme: dark)'
 * @returns {MediaQueryList}
 */
function neverMatchingMediaQuery(media) {
    return {
        matches: false,
        media,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent() {
            return false;
        },
    };
}

/** Llena los huecos de jsdom. */
export function fillBrowserGaps() {
    window.ResizeObserver ??= SilentObserver;
    window.IntersectionObserver ??= SilentObserver;
    window.matchMedia ??= neverMatchingMediaQuery;
    // ir arriba al cambiar de pantalla y llevar a la vista lo elegido
    window.scrollTo = () => {};
    window.HTMLElement.prototype.scrollTo ??= function scrollTo() {};
    window.HTMLElement.prototype.scrollIntoView ??= function scrollIntoView() {};
    // descargas y vistas previas de archivos: una dirección de mentira
    window.URL.createObjectURL ??= () => 'blob:prueba';
    window.URL.revokeObjectURL ??= () => {};
    // la liga de descarga se anota en savedFiles en lugar de navegar (jsdom no navega y lo diría con un error)
    const followLink = window.HTMLAnchorElement.prototype.click;
    window.HTMLAnchorElement.prototype.click = function click() {
        if (this.hasAttribute('download')) {
            savedFiles.push({fileName: this.getAttribute('download'), href: this.href});
            return;
        }
        followLink.call(this);
    };
}
