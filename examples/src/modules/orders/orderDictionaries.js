// Los valores cerrados de un pedido que llegan del API (su forma de pago, lo que le pasó) → etiqueta, tooltip y color.
// El texto no va aquí: va en ordersTexts.js (namespace dictionaries), así cambia de idioma sin tocar esto. El estado
// del pedido vive en core (ORDER_STATUS) porque también lo usan las métricas.
//
// El color es información: verde lo que terminó bien, ámbar lo que espera a alguien, rojo lo que no siguió.
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import {dictionaryEntryOf} from '@stackcraftmx/calcita';

import {ORDER_STATUS} from '@/core';

// la forma de pago, con su ícono para la insignia del detalle (IconBadge)
export const PAYMENT_METHOD = Object.freeze({
    card: dictionaryEntryOf('card', 'paymentMethod.card', 'default', {icon: CreditCardOutlinedIcon}),
    transfer: dictionaryEntryOf('transfer', 'paymentMethod.transfer', 'default', {icon: AccountBalanceOutlinedIcon}),
    cash: dictionaryEntryOf('cash', 'paymentMethod.cash', 'default', {icon: PaymentsOutlinedIcon}),
});

// lo que destaca de un pedido en su encabezado: se pinta como insignia solo si al pedido le aplica
export const ORDER_FLAG = Object.freeze({
    secondAttempt: dictionaryEntryOf('secondAttempt', 'orderFlag.secondAttempt', 'warning', {icon: ReplayOutlinedIcon}),
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
