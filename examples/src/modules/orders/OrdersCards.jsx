// Un pedido en tarjeta (RecordCard del paquete), la otra vista de la lista de Pedidos: su cliente, su estado y su forma de
// pago arriba, sus datos agrupados, el total grande y, al desplegar «Ver seguimiento», su historial de entrega (se pide al
// servidor solo al abrirlo). La lista, la búsqueda, los filtros y las páginas son los de la tabla (ServerTable renderCard):
// cambiar de vista no pierde lo filtrado.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import Typography from '@mui/material/Typography';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import {
    ACTIONS_MENU_ROW, ICON_BADGE_VARIANT, IconBadge, RecordCard, StatusChip, formatDateTime, formatNumber, toastProblem, toastSuccess, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {Money} from '@stackcraftmx/calcita/money';

import {ORDER_STATUS} from '@/core';
import {DeliveryTimeline} from '@/modules/orders/DeliveryTimeline.jsx';
import {ORDER_FLAG, PAYMENT_METHOD} from '@/modules/orders/orderDictionaries.js';
import {getOrderEvents} from '@/modules/orders/ordersApi.js';
import {orderDetailPathOf} from '@/modules/orders/ordersPaths.js';


/**
 * El seguimiento de un pedido: se pide al servidor al desplegarlo (la tarjeta lo monta solo abierto).
 *
 * @param {{orderId: number}} props
 */
const OrderTracking = ({orderId}) => {
    const {t} = useToolkitTranslation('orders');
    const [events, setEvents] = useState(null);
    useEffect(() => {
        const controller = new AbortController();
        getOrderEvents(orderId, controller.signal).then(setEvents).catch((error) => error.name !== 'AbortError' && toastProblem(error));
        return () => controller.abort();
    }, [orderId]);
    return events ? <DeliveryTimeline events={events} /> : <Typography variant="body2" color="text.secondary">{t('cards.loadingTracking')}</Typography>;
};

/**
 * Un pedido en su tarjeta, para ServerTable renderCard.
 *
 * @param {{order: object}} props
 */
export const OrderCard = ({order}) => {
    const {t} = useToolkitTranslation('orders');
    const navigate = useNavigate();

    const copyNumber = async () => {
        try {
            await navigator.clipboard.writeText(order.number);
            toastSuccess(t('cards.copied', {number: order.number}));
        } catch {
            toastProblem(new Error(t('cards.copyFailed')));
        }
    };

    const total = Money.fromString(order.total);
    return (
        <RecordCard
            eyebrow={order.number}
            title={order.customer_name}
            subtitle={t('cards.productLine', {product: order.product_name, count: order.quantity})}
            avatar={order.customer_name}
            status={(
                <>
                    <StatusChip variant="chip" dictionary={ORDER_STATUS} value={order.status} />
                    <IconBadge dictionary={PAYMENT_METHOD} value={order.payment_method} variant={ICON_BADGE_VARIANT.soft} />
                </>
            )}
            onOpen={() => navigate(orderDetailPathOf(order.id))}
            openLabel={t('columns.openDetail', {number: order.number})}
            // el menú «⋯» con secciones y submenús (se abren dentro del mismo menú, con «Regresar»)
            actions={[
                {type: ACTIONS_MENU_ROW.section, key: 'orderSection', label: t('cards.menu.order')},
                // una pantalla de la app con `to`: el clic normal navega sin recargar y Cmd/Ctrl+clic la abre en otra pestaña
                {key: 'open', label: t('cards.open'), icon: <OpenInNewRoundedIcon fontSize="small" />, to: orderDetailPathOf(order.id)},
                {key: 'copy', label: t('cards.copyNumber'), icon: <ContentCopyRoundedIcon fontSize="small" />, onClick: copyNumber},
                {type: ACTIONS_MENU_ROW.divider, key: 'divider'},
                {key: 'documents', label: t('cards.menu.documents'), icon: <DescriptionOutlinedIcon fontSize="small" />, children: [
                    {key: 'receipt', label: t('cards.menu.receipt'), onClick: () => toastSuccess(t('cards.menu.requested', {document: t('cards.menu.receipt'), number: order.number}))},
                    {key: 'invoice', label: t('cards.menu.invoice'), description: t('cards.menu.invoiceHelp'),
                        onClick: () => toastSuccess(t('cards.menu.requested', {document: t('cards.menu.invoice'), number: order.number}))},
                ]},
                {key: 'contact', label: t('cards.menu.contact'), icon: <ContactMailOutlinedIcon fontSize="small" />, children: [
                    {key: 'email', label: t('cards.menu.email'), description: order.customer_email, href: `mailto:${order.customer_email}`},
                ]},
            ]}
            groups={[
                {key: 'amounts', title: t('cards.amounts'), facts: [
                    {label: t('cards.pieces'), value: formatNumber(order.quantity)},
                    {label: t('cards.unitPrice'), value: total.dividedBy(order.quantity).format()},
                ]},
                {key: 'dates', title: t('cards.dates'), facts: [
                    {label: t('cards.createdAt'), value: formatDateTime(order.created_at)},
                    ...(order.canceled_at ? [{label: t('cards.canceledAt'), value: formatDateTime(order.canceled_at)}] : []),
                ]},
            ]}
            highlight={{label: t('cards.total'), value: total.format()}}
            footer={order.needs_second_attempt ? <IconBadge dictionary={ORDER_FLAG} value="secondAttempt" /> : null}
            details={<OrderTracking orderId={order.id} />}
            detailsLabel={t('cards.tracking')}
        />
    );
};
