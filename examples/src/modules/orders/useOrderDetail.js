// Pide el pedido y su historial para la pantalla de detalle, y los vuelve a pedir cuando cambia el pedido, el idioma o
// después de una acción.
//
// Por qué también al cambiar de idioma: el servidor manda ya traducidas las notas del historial («Nadie recibió el
// paquete»). Con lo que ya había llegado se quedarían en el idioma anterior.
//
// Sin librería de datos a propósito: un efecto con su AbortController. Si la persona se va antes de que llegue la
// respuesta, la petición se cancela y no pinta nada en una pantalla que ya no está.
//
// Hook del módulo, no renderiza: function (regla de la casa).
import {useEffect, useState} from 'react';

import {getOrder, getOrderEvents} from '@/modules/orders/ordersApi.js';

/** En qué va la consulta del detalle. */
export const ORDER_DETAIL_STATUS = Object.freeze({loading: 'loading', loaded: 'loaded', failed: 'failed'});

/**
 * @param {string} orderId el de la dirección
 * @param {string} language el idioma activo
 * @param {number} reloadToken cambia para volver a pedir (después de cancelar)
 * @returns {{status: string, order: object|null, events: object[], error: Error|null}}
 */
export function useOrderDetail(orderId, language, reloadToken) {
    const [detail, setDetail] = useState({status: ORDER_DETAIL_STATUS.loading, order: null, events: [], error: null});

    useEffect(() => {
        const abortController = new AbortController();
        // lo que ya se veía se queda en pantalla mientras llega lo nuevo (después de cancelar no parpadea)
        setDetail((currentDetail) => ({...currentDetail, status: ORDER_DETAIL_STATUS.loading}));

        Promise.all([getOrder(orderId, abortController.signal), getOrderEvents(orderId, abortController.signal)])
            .then(([order, events]) => setDetail({status: ORDER_DETAIL_STATUS.loaded, order, events, error: null}))
            .catch((error) => {
                // guard clause: la cancelamos nosotros al salir; no es un error que enseñar
                if (abortController.signal.aborted) {
                    return;
                }
                setDetail({status: ORDER_DETAIL_STATUS.failed, order: null, events: [], error});
            });

        return () => abortController.abort();
    }, [orderId, language, reloadToken]);

    return detail;
}
