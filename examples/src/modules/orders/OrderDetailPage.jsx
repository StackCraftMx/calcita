// El detalle de un pedido: encabezado con su estado, sus datos, la línea de tiempo de la entrega, el historial en un
// diálogo (AuditTrailDialog, paginado en el servidor) y la cancelación con confirmación y motivo.
//
// Lo que se ve aquí del paquete: BackButton (regresa a la lista tal como estaba y su texto dice a dónde), DetailHeader,
// SectionCard, DefinitionList, GroupedTimeline, AuditTrailDialog, useConfirmAction + ConfirmDialog y, mientras llega el pedido,
// DetailHeaderSkeleton y DefinitionListSkeleton (la forma de la ficha en lugar de una rueda). Solo se puede
// cancelar lo que no ha salido del almacén; aun así el servidor lo vuelve a revisar (un 409 sale en el diálogo).
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import {Link, useParams} from 'react-router';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import HistoryIcon from '@mui/icons-material/History';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import {
    BackButton, ConfirmDialog, CopyButton, DefinitionList, DefinitionListSkeleton, DetailHeader, DetailHeaderSkeleton, DictionaryText, ICON_BADGE_VARIANT, IconBadge, SectionCard, StatusChip,
    formatDateTime,
    tableRowTextOf, toastSuccess,
    usePageName, useConfirmAction, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {AuditTrailDialog} from '@stackcraftmx/calcita/table';
import {Money} from '@stackcraftmx/calcita/money';

import {APP_PATHS, ORDER_STATUS} from '@/core';
import {DeliveryTimeline} from '@/modules/orders/DeliveryTimeline.jsx';
import {
    CANCELABLE_ORDER_STATUSES, CANCEL_REASON_MAX_LENGTH, ORDER_EVENT, ORDER_FLAG, PAYMENT_METHOD,
} from '@/modules/orders/orderDictionaries.js';
import {cancelOrder, getOrderHistoryPage} from '@/modules/orders/ordersApi.js';
import {ORDERS_LIST_KEY, orderReceiptPathOf} from '@/modules/orders/ordersPaths.js';
import {ORDER_DETAIL_STATUS, useOrderDetail} from '@/modules/orders/useOrderDetail.js';

export const OrderDetailPage = () => {
    const {orderId} = useParams();
    const {t, language} = useToolkitTranslation('orders');
    const [reloadToken, setReloadToken] = useState(0);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const {status, order, events, error} = useOrderDetail(orderId, language, reloadToken);
    // el «Regresar» de la página que sigue dice «Regresar al pedido P-1001» (mientras no llega, no anota nada)
    usePageName(order ? 'orders:detail.backLabel' : null, {number: order?.number});

    // confirmar antes de cancelar: la máquina garantiza que cerrar no cancela y que un doble clic no manda dos peticiones
    const cancelAction = useConfirmAction({
        run: ({subject, details}) => cancelOrder(subject.id, details.reason),
        onDone: (response) => {
            toastSuccess(response.message);
            setReloadToken((currentToken) => currentToken + 1);
        },
    });

    const backButton = <BackButton fallbackTo={APP_PATHS.orders} listKey={ORDERS_LIST_KEY} sx={{mb: 1}} />;

    // guard clause: no se encontró o falló; el mensaje ya viene traducido del servidor
    if (status === ORDER_DETAIL_STATUS.failed) {
        return (
            <>
                {backButton}
                <Alert severity="error" role="alert">{error.message}</Alert>
            </>
        );
    }

    // guard clause: todavía no llega la primera respuesta. La forma de la ficha y no una rueda: lo que ya se sabe (los títulos
    // de las tarjetas) va de verdad, y lo que falta, en gris donde va a caer. Así nada brinca cuando llega el pedido
    if (!order) {
        return (
            <>
                {backButton}
                <DetailHeaderSkeleton badges={2} texts={{skeleton: {loading: t('detail.loading')}}} />
                <Grid container spacing={2}>
                    <Grid size={{xs: 12, md: 6}}>
                        <SectionCard title={t('detail.dataTitle')}><DefinitionListSkeleton rows={6} /></SectionCard>
                    </Grid>
                    <Grid size={{xs: 12, md: 6}}>
                        <SectionCard title={t('detail.deliveryTitle')}><DefinitionListSkeleton rows={4} layout="stacked" /></SectionCard>
                    </Grid>
                </Grid>
            </>
        );
    }

    const canCancel = CANCELABLE_ORDER_STATUSES.includes(order.status);
    const openCancel = () => {
        setCancelReason('');
        cancelAction.open(order);
    };

    const dataEntries = [
        {label: t('detail.customer'), value: `${order.customer_name} · ${order.customer_email}`},
        {label: t('detail.product'), value: order.product_name},
        {label: t('detail.quantity'), value: order.quantity},
        {label: t('detail.total'), value: Money.fromString(order.total).format()},
        {label: t('detail.paymentMethod'), value: <DictionaryText dictionary={PAYMENT_METHOD} value={order.payment_method} />},
        {label: t('detail.createdAt'), value: formatDateTime(order.created_at)},
        ...(order.canceled_at ? [{label: t('detail.canceledAt'), value: formatDateTime(order.canceled_at)}] : []),
        ...(order.cancel_reason ? [{label: t('detail.cancelReason'), value: order.cancel_reason}] : []),
    ];

    return (
        <>
            {backButton}
            <DetailHeader
                eyebrow={t('detail.eyebrow')}
                title={t('detail.title', {number: order.number})}
                // el estatus y las insignias de lo que destaca del pedido: su forma de pago y, si le pasó, el segundo intento
                badges={(
                    <>
                        <StatusChip variant="chip" dictionary={ORDER_STATUS} value={order.status} />
                        <IconBadge dictionary={PAYMENT_METHOD} value={order.payment_method} variant={ICON_BADGE_VARIANT.soft} />
                        {order.needs_second_attempt && <IconBadge dictionary={ORDER_FLAG} value="secondAttempt" />}
                    </>
                )}
                actions={(
                    <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                        {/* el pedido en un renglón separado por tabuladores: al pegarlo en Excel cada dato cae en su celda.
                            Se arma al picar (value como función) */}
                        <CopyButton label={t('detail.copyRow')} size="medium" value={() => tableRowTextOf([
                            order.number, order.customer_name, order.customer_email, order.product_name, order.quantity,
                            Money.fromString(order.total).format(), formatDateTime(order.created_at),
                        ])} />
                        <Button variant="outlined" startIcon={<HistoryIcon />} onClick={() => setIsHistoryOpen(true)}>
                            {t('detail.history')}
                        </Button>
                        {/* el comprobante vive en /receipts/…: el menú sigue marcando «Tabla» porque esa pantalla lo declara */}
                        <Button variant="outlined" startIcon={<ReceiptOutlinedIcon />} component={Link} to={orderReceiptPathOf(orderId)}>
                            {t('detail.receipt')}
                        </Button>
                        {canCancel && (
                            <Button variant="outlined" color="error" onClick={openCancel}>{t('detail.cancel')}</Button>
                        )}
                    </Stack>
                )}
            />

            <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 6}}>
                    <SectionCard title={t('detail.dataTitle')}>
                        <DefinitionList entries={dataEntries} />
                        <Typography variant="caption" color="text.secondary" component="p" sx={{mt: 2}}>
                            {t('detail.timeZoneNote')}
                        </Typography>
                    </SectionCard>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <SectionCard title={t('detail.deliveryTitle')}>
                        <DeliveryTimeline events={events} />
                    </SectionCard>
                </Grid>
            </Grid>

            <AuditTrailDialog
                open={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                title={t('history.title', {number: order.number})}
                subtitle={t('history.subtitle')}
                subjectKey={String(order.id)}
                fetchPage={(request, signal) => getOrderHistoryPage(order.id, request, signal)}
                eventDictionary={ORDER_EVENT}
                extraColumns={[{
                    field: 'note', headerName: t('history.note'), flex: 1, minWidth: 240, sortable: false,
                    valueFormatter: (value) => value ?? '—',
                }]}
            />

            <ConfirmDialog
                {...cancelAction.dialogProps}
                title={t('cancel.title', {number: order.number})}
                description={t('cancel.description')}
                confirmLabel={t('cancel.confirm')}
                cancelLabel={t('cancel.keep')}
                tone="error"
                // el motivo viaja como «details» hasta run: lo pide el diálogo, lo usa la petición
                onConfirm={() => cancelAction.confirm({reason: cancelReason.trim()})}
                isConfirmDisabled={!cancelReason.trim()}
            >
                <TextField
                    label={t('cancel.reasonLabel')}
                    helperText={t('cancel.reasonHelp')}
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    disabled={cancelAction.isRunning}
                    slotProps={{htmlInput: {maxLength: CANCEL_REASON_MAX_LENGTH}}}
                    multiline
                    minRows={2}
                    fullWidth
                    autoFocus
                    sx={{mt: 2}}
                />
            </ConfirmDialog>
        </>
    );
};
