// Las rutas de la navegación sin router, para sistemas que ya existen (una página de PHP, JSP o .NET con React en un pedazo):
//   - con prefijo: la app vive en /portal/… detrás de un proxy, y los componentes hablan de /pedidos sin saberlo;
//   - con # en la dirección (/app.php#/pedidos): el servidor viejo no sabe responder /pedidos al recargar, y todo lo que va
//     después del # se queda en el navegador.
//
// Funciones puras, no renderizan: function (regla de la casa).

const HASH_SIGN = '#';
const ROOT_PATH = '/';

/**
 * El prefijo limpio: '' sin prefijo; si no, empieza con / y no termina con / ('portal/' → '/portal').
 *
 * @param {string|null|undefined} basePath
 * @returns {string}
 */
export function normalizedBasePath(basePath) {
    const trimmed = (basePath ?? '').trim().replace(/\/+$/, '');
    if (!trimmed) {
        return '';
    }
    return trimmed.startsWith(ROOT_PATH) ? trimmed : `${ROOT_PATH}${trimmed}`;
}

/**
 * ¿Es una ruta de la app ('/pedidos')? Una dirección de afuera ('https://…', '//otro.sitio') o relativa ('?pagina=2') no.
 *
 * @param {string} destination
 * @returns {boolean}
 */
function isAppPath(destination) {
    return destination.startsWith(ROOT_PATH) && !destination.startsWith('//');
}

/**
 * La dirección real de una ruta de la app con el prefijo puesto: '/pedidos' → '/portal/pedidos'. Lo que no es ruta de la
 * app se queda como viene.
 *
 * @param {string} basePath
 * @param {string} destination
 * @returns {string}
 */
export function pathWithBase(basePath, destination) {
    const base = normalizedBasePath(basePath);
    return base && isAppPath(destination) ? `${base}${destination}` : destination;
}

/**
 * La ruta de la app de una dirección real, sin el prefijo: '/portal/pedidos' → '/pedidos'; el prefijo solo → '/'. Una
 * dirección de fuera del prefijo se queda como viene.
 *
 * @param {string} basePath
 * @param {string} pathname
 * @returns {string}
 */
export function pathWithoutBase(basePath, pathname) {
    const base = normalizedBasePath(basePath);
    if (!base) {
        return pathname;
    }
    if (pathname === base) {
        return ROOT_PATH;
    }
    return pathname.startsWith(`${base}${ROOT_PATH}`) ? pathname.slice(base.length) : pathname;
}

/**
 * La página de la app que va después del # ('#/pedidos?estado=pendiente' → {pathname: '/pedidos', search: '?estado=pendiente'}).
 * Sin nada después del #, el inicio.
 *
 * @param {string} hash el de la dirección (location.hash), con o sin #
 * @returns {{pathname: string, search: string}}
 */
export function hashLocationOf(hash) {
    const route = (hash ?? '').replace(/^#/, '');
    if (!route) {
        return {pathname: ROOT_PATH, search: ''};
    }
    const searchStart = route.indexOf('?');
    const pathname = searchStart === -1 ? route : route.slice(0, searchStart);
    return {
        pathname: pathname.startsWith(ROOT_PATH) ? pathname : `${ROOT_PATH}${pathname}`,
        search: searchStart === -1 ? '' : route.slice(searchStart),
    };
}

/**
 * El enlace de una ruta de la app con # ('/pedidos' → '#/pedidos'). Lo que no es ruta de la app se queda como viene.
 *
 * @param {string} destination
 * @returns {string}
 */
export function hashHrefOf(destination) {
    return isAppPath(destination) ? `${HASH_SIGN}${destination}` : destination;
}

// el botón principal del ratón (el izquierdo)
const MAIN_MOUSE_BUTTON = 0;

/**
 * Si un clic en un enlace es el normal: el botón principal, sin Cmd/Ctrl/Shift/Alt y sin que nadie lo haya detenido.
 * Solo ese se hace por dentro (cambiar de pantalla, reemplazar el historial); con Cmd/Ctrl+clic, Shift+clic o el botón de en
 * medio el navegador hace lo suyo (otra pestaña, otra ventana), como con cualquier liga.
 *
 * @param {{button?: number, metaKey?: boolean, ctrlKey?: boolean, shiftKey?: boolean, altKey?: boolean, defaultPrevented?: boolean}} event
 * @param {string} [target] el target del enlace: con _blank tampoco se hace por dentro
 * @returns {boolean}
 */
export function isPlainLeftClick(event, target) {
    if (target && target !== '_self') {
        return false;
    }
    return event.button === MAIN_MOUSE_BUTTON && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.defaultPrevented;
}

/**
 * El prefijo con que el servidor sirvió la página, leído al abrirla de su <base href> ('/ventas'), o null si la página no
 * trae <base>. Así UNA compilación sirve detrás de cualquier prefijo que decida el servidor (Laravel lo pone con
 * config('app.url'), un proxy con su ruta): el prefijo no se fija al compilar. Para el basename del router y para
 * createBrowserNavigation({basePath}).
 *
 *   <base href="{{ rtrim(config('app.url'), '/') . '/' }}">          (en la vista que sirve la app)
 *   createBrowserRouter(routes, {basename: documentBasePath() || '/'})
 *
 * OJO: con <base>, todo lo relativo de la página (imágenes, ligas «#sección») se lee desde ese prefijo.
 *
 * @param {{baseURI?: string, querySelector?: (selector: string) => unknown}} [currentDocument] por omisión el de la página
 * @returns {string|null} '' en la raíz; null sin <base> (o sin navegador)
 */
export function documentBasePath(currentDocument = globalThis.document) {
    if (!currentDocument?.querySelector?.('base[href]') || !currentDocument.baseURI) {
        return null;
    }
    return normalizedBasePath(new URL(currentDocument.baseURI).pathname);
}
