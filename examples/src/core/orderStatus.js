// El estado de un pedido que llega del API → etiqueta, tooltip y color. Vive en core porque lo usan dos módulos: la
// tabla de pedidos (chips y filtros) y las métricas (las tarjetas que abren la tabla filtrada por estado). Sus textos
// están en coreTexts.js.
//
// El color es información: verde lo que terminó bien, ámbar lo que espera a alguien, rojo lo que no siguió.
import {dictionaryEntryOf} from '@stackcraftmx/calcita';

export const ORDER_STATUS = Object.freeze({
    // con palabra corta: en la columna angosta de la tabla dice «Pendiente» y el tooltip dice el nombre completo
    pending: dictionaryEntryOf('pending', 'orderStatus.pending', 'warning', {hasShortLabel: true}),
    paid: dictionaryEntryOf('paid', 'orderStatus.paid', 'default'),
    shipped: dictionaryEntryOf('shipped', 'orderStatus.shipped', 'info'),
    delivered: dictionaryEntryOf('delivered', 'orderStatus.delivered', 'success'),
    canceled: dictionaryEntryOf('canceled', 'orderStatus.canceled', 'error'),
});
