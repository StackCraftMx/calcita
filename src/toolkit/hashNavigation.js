// La navegación con # en la dirección (/app.php#/pedidos), sin router: para meter Calcita en un sistema que ya existe y cuyo
// servidor no sabe responder /pedidos al recargar. Todo lo que va después del # se queda en el navegador: cambiar de
// pantalla no recarga la página ni pide nada al servidor, y atrás y adelante funcionan.
//
//   <ToolkitProvider navigation={createHashNavigation()}>   // una vez, fuera del componente
//
// Con react-router se usa su createHashRouter con el adaptador de siempre (@stackcraftmx/calcita/react-router).
//
// Funciones genéricas: function (regla de la casa).
import {createElement, useSyncExternalStore} from 'react';

import {hashHrefOf, hashLocationOf} from '@/toolkit/navigationPaths.js';

const HISTORY_BACK = -1;

/** Avisa cuando cambia lo que va después del # (un enlace, atrás o adelante). */
function subscribeToHash(onChange) {
    window.addEventListener('hashchange', onChange);
    window.addEventListener('popstate', onChange);
    return () => {
        window.removeEventListener('hashchange', onChange);
        window.removeEventListener('popstate', onChange);
    };
}

function currentHref() {
    return window.location.href;
}

/**
 * @returns {{useNavigate: () => (destination: string|number) => void, useLocation: () => {pathname: string, search: string, key: string}, Link: import('react').ElementType}}
 */
export function createHashNavigation() {
    // -1 regresa en el historial; una ruta de la app cambia lo que va después del # (sin recargar)
    const navigate = (destination) => {
        if (destination === HISTORY_BACK) {
            window.history.back();
            return;
        }
        const href = hashHrefOf(destination);
        if (href.startsWith('#')) {
            window.location.hash = href;
            return;
        }
        // una dirección de afuera: como un enlace normal
        window.location.assign(href);
    };

    // la página de la app, leída de lo que va después del #
    const useHashLocation = () => {
        const href = useSyncExternalStore(subscribeToHash, currentHref, () => '');
        const {pathname, search} = hashLocationOf(href ? new URL(href).hash : '');
        return {pathname, search, key: href};
    };

    const HashLink = ({to, ...props}) => createElement('a', {href: hashHrefOf(to), ...props});

    return Object.freeze({useNavigate: () => navigate, useLocation: useHashLocation, Link: HashLink});
}
