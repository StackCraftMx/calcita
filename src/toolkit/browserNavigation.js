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
// Para un sistema que ya existe, sin router:
//   - con prefijo (la app detrás de un proxy en /portal): createBrowserNavigation({basePath: '/portal'}). Los componentes
//     siguen hablando de '/pedidos' y la dirección real lleva el prefijo;
//   - con # en la dirección (un servidor que no sabe responder /pedidos al recargar): createHashNavigation(), en
//     hashNavigation.js.
//
// OJO: aquí cada navegación recarga la página. Para una aplicación de una sola página se usa el adaptador de su router (o la
// de #, que no recarga).
import {createElement, useSyncExternalStore} from 'react';

import {pathWithBase, pathWithoutBase} from '@/toolkit/navigationPaths.js';

const HISTORY_BACK = -1;

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
 * La navegación del navegador, con o sin prefijo.
 *
 * @param {{basePath?: string}} [options] basePath: donde vive la app detrás de un proxy ('/portal'); sin él, la raíz
 * @returns {{useNavigate: () => (destination: string|number) => void, useLocation: () => {pathname: string, search: string, key: string}, Link: import('react').ElementType}}
 */
export function createBrowserNavigation({basePath = ''} = {}) {
    // cambia de página: -1 regresa en el historial; una ruta de la app abre esa ruta con el prefijo
    const navigate = (destination) => {
        if (destination === HISTORY_BACK) {
            window.history.back();
            return;
        }
        window.location.assign(pathWithBase(basePath, destination));
    };

    // la página actual como la da react-router (la ruta SIN el prefijo, la búsqueda y una llave por página)
    const useBrowserLocation = () => {
        const href = useSyncExternalStore(subscribeToHistory, currentHref, () => '');
        const url = href ? new URL(href) : null;
        return {pathname: url ? pathWithoutBase(basePath, url.pathname) : '/', search: url?.search ?? '', key: href};
    };

    // el enlace sin router: un <a> con la dirección real
    const BrowserLink = ({to, ...props}) => createElement('a', {href: pathWithBase(basePath, to), ...props});

    return Object.freeze({useNavigate: () => navigate, useLocation: useBrowserLocation, Link: BrowserLink});
}

/** La de omisión: sin prefijo. */
export const browserNavigation = createBrowserNavigation();
