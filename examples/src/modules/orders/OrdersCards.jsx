// Los pedidos en tarjetas (RecordCard del paquete), la otra vista de la lista: cada pedido con su cliente, su estado y su
// forma de pago arriba, sus datos agrupados, el total grande y, al desplegar «Ver seguimiento», su historial de entrega
// (se pide al servidor solo al abrirlo). Pagina en el servidor como la tabla; mientras llega, esqueletos con su forma.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import {
    ACTIONS_MENU_ROW, ICON_BADGE_VARIANT, IconBadge, RecordCard, RecordCardSkeleton, StatusChip, formatDateTime, formatNumber, toastProblem, toastSuccess,
    useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {Money} from '@stackcraftmx/calcita/money';

import {ORDER_STATUS} from '@/core';
import {DeliveryTimeline} from '@/modules/orders/DeliveryTimeline.jsx';
import {ORDER_FLAG, PAYMENT_METHOD} from '@/modules/orders/orderDictionaries.js';
import {getOrderEvents, getOrdersPage} from '@/modules/orders/ordersApi.js';
import {orderDetailPathOf} from '@/modules/orders/ordersPaths.js';

const CARDS_PER_PAGE = 6;

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

export const OrdersCards = () => {
    const {t} = useToolkitTranslation('orders');
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        setResult(null);
        getOrdersPage({filters: {}, sortOrders: [], page, pageSize: CARDS_PER_PAGE}, controller.signal)
            .then(setResult)
            .catch((error) => error.name !== 'AbortError' && toastProblem(error));
        return () => controller.abort();
    }, [page]);

    const copyNumber = async (order) => {
        try {
            await navigator.clipboard.writeText(order.number);
            toastSuccess(t('cards.copied', {number: order.number}));
        } catch {
            toastProblem(new Error(t('cards.copyFailed')));
        }
    };

    if (!result) {
        return (
            <Stack spacing={1.5}>
                {Array.from({length: 3}, (unused, index) => <RecordCardSkeleton key={index} groups={2} />)}
            </Stack>
        );
    }
    const pageCount = Math.ceil(result.total / CARDS_PER_PAGE);
    return (
        <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">{t('count', {count: result.total, total: formatNumber(result.total)})}</Typography>
            {result.rows.map((order) => {
                const total = Money.fromString(order.total);
                return (
                    <RecordCard
                        key={order.id}
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
                            {key: 'open', label: t('cards.open'), icon: <OpenInNewRoundedIcon fontSize="small" />, onClick: () => navigate(orderDetailPathOf(order.id))},
                            {key: 'copy', label: t('cards.copyNumber'), icon: <ContentCopyRoundedIcon fontSize="small" />, onClick: () => copyNumber(order)},
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
            })}
            {pageCount > 1 && (
                <Pagination count={pageCount} page={page + 1} onChange={(event, nextPage) => setPage(nextPage - 1)} sx={{alignSelf: 'center'}}
                            getItemAriaLabel={(type, itemPage) => t(`cards.pagination.${type}`, {page: itemPage})} />
            )}
        </Stack>
    );
};
