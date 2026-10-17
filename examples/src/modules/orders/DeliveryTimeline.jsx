// La línea de tiempo de un pedido (GroupedTimeline): lo del pedido arriba y cada intento de entrega en su grupo.
//
// El intento vigente va resaltado y los anteriores apagados y plegados, para que el ojo se vaya a lo que importa
// ahora. El ícono y el tono de cada evento salen de aquí y del diccionario de eventos, no de la línea de tiempo: ella no
// sabe de pedidos.
//
// Lo renderiza la app: arrow (regla de la casa).
import Typography from '@mui/material/Typography';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import {DictionaryText, formatDateTime, lookup, useToolkitTranslation} from '@stackcraftmx/calcita';
import {GroupedTimeline, TIMELINE_EMPHASIS} from '@stackcraftmx/calcita/timeline';

import {ORDER_EVENT} from '@/modules/orders/orderDictionaries.js';

// el ícono dentro del punto de cada evento
const ICON_BY_EVENT = Object.freeze({
    [ORDER_EVENT.created.value]: ShoppingCartOutlinedIcon,
    [ORDER_EVENT.paid.value]: PaymentsOutlinedIcon,
    [ORDER_EVENT.packed.value]: Inventory2OutlinedIcon,
    [ORDER_EVENT.out_for_delivery.value]: LocalShippingOutlinedIcon,
    [ORDER_EVENT.delivery_failed.value]: ReportProblemOutlinedIcon,
    [ORDER_EVENT.delivered.value]: CheckCircleOutlineIcon,
    [ORDER_EVENT.canceled.value]: CancelOutlinedIcon,
});

// el color del diccionario (el de los chips) → el tono del punto; «default» no existe en la línea de tiempo
const TONE_BY_DICTIONARY_COLOR = Object.freeze({default: 'grey'});

/**
 * @param {{events: object[]}} props el historial completo del pedido, en orden (getOrderEvents)
 */
export const DeliveryTimeline = ({events}) => {
    const {t} = useToolkitTranslation('orders');

    const itemOf = (event) => {
        const color = lookup(ORDER_EVENT, event.event).color;
        // sin actor lo hizo un proceso automático (el banco confirmó el pago): se dice así, sin «Por»
        const actorText = event.actor ? t('delivery.byActor', {name: event.actor.name}) : t('delivery.automaticActor');
        return {
            key: event.id,
            icon: ICON_BY_EVENT[event.event],
            tone: TONE_BY_DICTIONARY_COLOR[color] ?? color,
            title: <DictionaryText dictionary={ORDER_EVENT} value={event.event} />,
            timestamp: formatDateTime(event.occurred_at),
            details: (
                <Typography variant="body2" color="text.secondary">
                    {actorText}
                    {event.note && ` · ${event.note}`}
                </Typography>
            ),
        };
    };

    // los intentos de entrega, del primero al último
    const attempts = [...new Set(events.filter((event) => event.attempt !== null).map((event) => event.attempt))];
    const lastAttempt = attempts.at(-1);

    const groups = [
        {key: 'order', title: t('delivery.orderGroup'), items: events.filter((event) => event.attempt === null).map(itemOf)},
        ...attempts.map((attempt) => {
            const attemptEvents = events.filter((event) => event.attempt === attempt);
            const isCurrent = attempt === lastAttempt;
            return {
                key: `attempt-${attempt}`,
                title: t('delivery.attempt', {number: attempt}),
                badge: isCurrent ? t('delivery.currentAttempt') : undefined,
                summary: t('delivery.eventCount', {count: attemptEvents.length}),
                emphasis: isCurrent ? TIMELINE_EMPHASIS.highlighted : TIMELINE_EMPHASIS.muted,
                // los intentos viejos arrancan plegados: lo que ya pasó no obliga a bajar
                isCollapsible: !isCurrent,
                defaultExpanded: isCurrent,
                items: attemptEvents.map(itemOf),
            };
        }),
    ];

    return (
        <>
            <GroupedTimeline groups={groups} />
            {attempts.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>{t('delivery.notShipped')}</Typography>
            )}
        </>
    );
};
