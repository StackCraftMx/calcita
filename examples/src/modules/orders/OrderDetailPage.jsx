// El detalle de un pedido: encabezado con su estado, sus datos, la línea de tiempo de la entrega, el historial en un
// diálogo (AuditTrailDialog, paginado en el servidor) y la cancelación con confirmación y motivo.
//
// Lo que se ve aquí del paquete: BackButton (regresa a la lista tal como estaba y su texto dice a dónde), DetailHeader,
// SectionCard, DefinitionList, GroupedTimeline, AuditTrailDialog y useConfirmAction + ConfirmDialog. Solo se puede
// cancelar lo que no ha salido del almacén; aun así el servidor lo vuelve a revisar (un 409 sale en el diálogo).
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import {useParams} from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import HistoryIcon from '@mui/icons-material/History';
import {
    BackButton, ConfirmDialog, DefinitionList, DetailHeader, DictionaryText, SectionCard, StatusChip, formatDateTime, toastSuccess,
    usePageName, useConfirmAction, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {AuditTrailDialog} from '@stackcraftmx/calcita/table';
import {Money} from '@stackcraftmx/calcita/money';

import {APP_PATHS, ORDER_STATUS} from '@/core';
import {DeliveryTimeline} from '@/modules/orders/DeliveryTimeline.jsx';
import {CANCELABLE_ORDER_STATUSES, ORDER_EVENT, PAYMENT_METHOD} from '@/modules/orders/orderDictionaries.js';
import {cancelOrder, getOrderHistoryPage} from '@/modules/orders/ordersApi.js';
import {ORDERS_LIST_KEY} from '@/modules/orders/ordersPaths.js';
import {ORDER_DETAIL_STATUS, useOrderDetail} from '@/modules/orders/useOrderDetail.js';

// el motivo es corto: va en el historial
const CANCEL_REASON_MAX_LENGTH = 200;

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

    // guard clause: todavía no llega la primera respuesta
    if (!order) {
        return (
            <>
                {backButton}
                <Box role="status" sx={{display: 'grid', placeItems: 'center', py: 8}}>
                    <CircularProgress aria-label={t('detail.loading')} />
                </Box>
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
                badges={<StatusChip variant="chip" dictionary={ORDER_STATUS} value={order.status} />}
                actions={(
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<HistoryIcon />} onClick={() => setIsHistoryOpen(true)}>
                            {t('detail.history')}
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
