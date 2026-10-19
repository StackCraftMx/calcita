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
