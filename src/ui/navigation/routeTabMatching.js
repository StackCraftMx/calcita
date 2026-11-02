// Qué pestaña va activa según la dirección, para las pestañas por ruta (RouteTabs):
//   por ruta     cada pestaña es una página: gana la que coincide con la ruta, o la más larga de la que es parte
//                ('/clientes/123/pagos/abril' activa '/clientes/123/pagos'); exact solo con la ruta idéntica
//   por consulta pestañas dentro de una misma pantalla, en ?tab=pagos: se puede compartir la liga a la pestaña
//
// Puro (sin React): se prueba con node (routeTabMatching.test.js).
//
// Genérico del paquete: function (regla de la casa).

/**
 * @param {Array<{to: string, exact?: boolean}>} tabs
 * @param {string} pathname
 * @returns {string|null} el `to` de la pestaña activa
 */
export function activeRouteTabOf(tabs, pathname) {
    const path = pathname.replace(/\/+$/, '') || '/';
    const matching = tabs.filter(({to, exact}) => {
        const tabPath = to.replace(/\/+$/, '') || '/';
        return path === tabPath || (!exact && path.startsWith(`${tabPath === '/' ? '' : tabPath}/`));
    });
    // la más específica: la de la ruta más larga
    return matching.sort((first, second) => second.to.length - first.to.length)[0]?.to ?? null;
}

/**
 * @param {Array<{value: string}>} tabs
 * @param {string} search la consulta de la dirección ('?tab=pagos&page=2')
 * @param {string} paramName 'tab'
 * @returns {string|null} la pestaña de la consulta si existe; si no, la primera
 */
export function queryTabOf(tabs, search, paramName) {
    const wanted = new URLSearchParams(search).get(paramName);
    return tabs.find((tab) => tab.value === wanted)?.value ?? tabs[0]?.value ?? null;
}

/**
 * La consulta con otra pestaña, sin perder lo demás que traía (?page=2 se queda).
 *
 * @param {string} search
 * @param {string} paramName
 * @param {string} value
 * @returns {string} '?tab=pagos&page=2'
 */
export function searchWithTab(search, paramName, value) {
    const params = new URLSearchParams(search);
    params.set(paramName, value);
    return `?${params.toString()}`;
}
