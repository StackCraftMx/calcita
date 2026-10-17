// La navegación por omisión: la del navegador, para usar el paquete sin router.
//
// Los componentes que navegan (BackButton, MetricCard, el regreso a la última lista) no importan react-router ni
// Next.js: le piden al proveedor una navegación con tres piezas, las mismas que trae react-router:
//   useNavigate()  regresa navigate(destino), donde destino es una ruta o -1 para regresar;
//   useLocation()  regresa {pathname, search, key} de la página actual;
//   Link           el enlace, que recibe `to` con la ruta.
// Un proyecto con router pasa su adaptador (@stackcraftmx/calcita/react-router); sin él, esta cambia de página como un
// enlace normal.
//
// OJO: aquí cada navegación recarga la página. Para una aplicación de una sola página se usa el adaptador de su router.
import {createElement, useSyncExternalStore} from 'react';

const HISTORY_BACK = -1;

/**
 * Cambia de página: -1 regresa en el historial; una ruta abre esa ruta.
 *
 * @param {string|number} destination
 * @returns {void}
 */
function navigateInBrowser(destination) {
    if (destination === HISTORY_BACK) {
        window.history.back();
        return;
    }

    window.location.assign(destination);
}

/**
 * Avisa cuando cambia la página por el historial (atrás y adelante).
 *
 * @param {Function} onChange
 * @returns {Function} para dejar de escuchar
 */
function subscribeToHistory(onChange) {
    window.addEventListener('popstate', onChange);

    return () => window.removeEventListener('popstate', onChange);
}

/**
 * La dirección actual como texto, para saber si cambió.
 *
 * @returns {string}
 */
function currentHref() {
    return window.location.href;
}

/**
 * La página actual, como la da react-router: la ruta, la búsqueda y una llave por página.
 *
 * @returns {{pathname: string, search: string, key: string}}
 */
function useBrowserLocation() {
    const href = useSyncExternalStore(subscribeToHistory, currentHref, () => '');
    const url = href ? new URL(href) : null;

    return {pathname: url?.pathname ?? '/', search: url?.search ?? '', key: href};
}

/**
 * El enlace sin router: un <a> con href.
 *
 * @param {{to: string}} props lo demás pasa al <a>
 * @returns {import('react').ReactElement}
 */
function BrowserLink({to, ...props}) {
    return createElement('a', {href: to, ...props});
}

export const browserNavigation = Object.freeze({
    useNavigate: () => navigateInBrowser,
    useLocation: useBrowserLocation,
    Link: BrowserLink,
});
