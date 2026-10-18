// Los valores cerrados de un pedido que llegan del API (su forma de pago, lo que le pasó) → etiqueta, tooltip y color.
// El texto no va aquí: va en ordersTexts.js (namespace dictionaries), así cambia de idioma sin tocar esto. El estado
// del pedido vive en core (ORDER_STATUS) porque también lo usan las métricas.
//
// El color es información: verde lo que terminó bien, ámbar lo que espera a alguien, rojo lo que no siguió.
import {dictionaryEntryOf} from '@stackcraftmx/calcita';

import {ORDER_STATUS} from '@/core';

export const PAYMENT_METHOD = Object.freeze({
    card: dictionaryEntryOf('card', 'paymentMethod.card', 'default'),
    transfer: dictionaryEntryOf('transfer', 'paymentMethod.transfer', 'default'),
    cash: dictionaryEntryOf('cash', 'paymentMethod.cash', 'default'),
});

export const ORDER_EVENT = Object.freeze({
    created: dictionaryEntryOf('created', 'orderEvent.created', 'default'),
    paid: dictionaryEntryOf('paid', 'orderEvent.paid', 'success'),
    packed: dictionaryEntryOf('packed', 'orderEvent.packed', 'info'),
    out_for_delivery: dictionaryEntryOf('out_for_delivery', 'orderEvent.outForDelivery', 'info'),
    delivery_failed: dictionaryEntryOf('delivery_failed', 'orderEvent.deliveryFailed', 'warning'),
    delivered: dictionaryEntryOf('delivered', 'orderEvent.delivered', 'success'),
    canceled: dictionaryEntryOf('canceled', 'orderEvent.canceled', 'error'),
});

/** Lo más largo que se guarda del motivo de una cancelación: es corto porque va en el historial del pedido. */
export const CANCEL_REASON_MAX_LENGTH = 200;

/** Los estados en que un pedido todavía se puede cancelar: no ha salido del almacén. El servidor lo vuelve a revisar. */
export const CANCELABLE_ORDER_STATUSES = Object.freeze([ORDER_STATUS.pending.value, ORDER_STATUS.paid.value]);
