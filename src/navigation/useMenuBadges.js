// Los conteos de los badges del menú (lo pendiente de cada pantalla), pedidos al servidor del proyecto: AppLayout los pinta
// por el badgeKey de cada entrada (navigation/appMenu.js, menuBadgeOf).
//
//   const {menuBadges, refreshMenuBadges} = useMenuBadges(() => api.get('/users/badges'));
//   <AppLayout menuBadges={menuBadges} …>
//
// El servidor puede contestar una lista [{badgeKey, count}] o un objeto {badgeKey: count}: los dos se aceptan.
// refreshMenuBadges() los vuelve a pedir (después de aprobar o rechazar algo); si se llama varias veces seguidas, se pide
// una sola vez: las demás esperan la misma respuesta. Si la petición falla, se quedan los conteos de antes (un badge viejo
// es mejor que un menú que truena).
//
// Genérico del paquete: function (regla de la casa).
import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * La respuesta del servidor como {badgeKey: conteo}.
 *
 * @param {unknown} response
 * @returns {Record<string, number>}
 */
export function menuBadgesFrom(response) {
    // OJO: Number(null) es 0 y pasaría como conteo: lo que llega vacío no es un número
    const isCount = (count) => count !== null && count !== undefined && count !== '' && Number.isFinite(Number(count));
    const list = Array.isArray(response) ? response : (Array.isArray(response?.badges) ? response.badges : null);
    if (list) {
        return Object.fromEntries(list
            .filter((item) => item?.badgeKey && isCount(item.count))
            .map((item) => [item.badgeKey, Number(item.count)]));
    }
    if (response && typeof response === 'object') {
        return Object.fromEntries(Object.entries(response).filter(([, count]) => isCount(count)).map(([key, count]) => [key, Number(count)]));
    }
    return {};
}

/**
 * @param {() => Promise<unknown>} loadBadges pide los conteos al servidor
 * @returns {{menuBadges: Record<string, number>, refreshMenuBadges: () => Promise<void>, isLoading: boolean}}
 */
export function useMenuBadges(loadBadges) {
    const [menuBadges, setMenuBadges] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    // la petición en curso: si ya hay una, las demás llamadas esperan esa
    const inflight = useRef(null);
    // la función más reciente del proyecto, sin volver a pedir cada que se pinta
    const loadRef = useRef(loadBadges);
    loadRef.current = loadBadges;

    const refreshMenuBadges = useCallback(() => {
        if (inflight.current) {
            return inflight.current;
        }
        setIsLoading(true);
        inflight.current = (async () => {
            try {
                setMenuBadges(menuBadgesFrom(await loadRef.current()));
            } catch {
                // se quedan los conteos de antes
            } finally {
                setIsLoading(false);
                inflight.current = null;
            }
        })();
        return inflight.current;
    }, []);

    useEffect(() => {
        refreshMenuBadges();
    }, [refreshMenuBadges]);

    return {menuBadges, refreshMenuBadges, isLoading};
}
