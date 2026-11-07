// El comprobante de un pedido: lo que se imprime o se manda al cliente.
//
// Vive en su propia dirección (/receipts/15) y no debajo de /orders, porque es la liga que se comparte. Por la dirección el
// menú no sabría a qué entrada pertenece y se quedaría sin marca; la pantalla lo dice con useActiveMenuPath y el menú, la
// barra del teléfono y las migas marcan «Tabla», la lista de pedidos de donde viene.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useParams} from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import {
    BackButton, DefinitionList, DictionaryText, PageHeading, SectionCard, formatDateTime, useActiveMenuPath, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {Money} from '@stackcraftmx/calcita/money';

import {APP_PATHS} from '@/core';
import {PAYMENT_METHOD} from '@/modules/orders/orderDictionaries.js';
import {orderDetailPathOf} from '@/modules/orders/ordersPaths.js';
import {ORDER_DETAIL_STATUS, useOrderDetail} from '@/modules/orders/useOrderDetail.js';

// el comprobante no cambia después de cargar: no se vuelve a pedir
const NO_RELOAD = 0;

export const OrderReceiptPage = () => {
    const {orderId} = useParams();
    const {t, language} = useToolkitTranslation('orders');
    const {status, order, error} = useOrderDetail(orderId, language, NO_RELOAD);
    // la entrada del menú de esta pantalla: la lista de pedidos, aunque la dirección sea /receipts/15
    useActiveMenuPath(APP_PATHS.orders);

    const backButton = <BackButton fallbackTo={orderDetailPathOf(orderId)} sx={{mb: 1}} />;

    // guard clause: no se encontró o falló; el mensaje ya viene traducido del servidor
    if (status === ORDER_DETAIL_STATUS.failed) {
        return (
            <>
                {backButton}
                <Alert severity="error" role="alert">{error.message}</Alert>
            </>
        );
    }

    // guard clause: todavía no llega la respuesta
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

    const receiptEntries = [
        {label: t('detail.customer'), value: `${order.customer_name} · ${order.customer_email}`},
        {label: t('detail.product'), value: order.product_name},
        {label: t('detail.quantity'), value: order.quantity},
        {label: t('detail.total'), value: Money.fromString(order.total).format()},
        {label: t('detail.paymentMethod'), value: <DictionaryText dictionary={PAYMENT_METHOD} value={order.payment_method} />},
        {label: t('detail.createdAt'), value: formatDateTime(order.created_at)},
    ];

    return (
        <>
            {backButton}
            <PageHeading title={t('receipt.title', {number: order.number})} description={t('receipt.description')}
                         actions={<Button variant="outlined" startIcon={<PrintOutlinedIcon />} onClick={() => window.print()}>{t('receipt.print')}</Button>} />
            <SectionCard title={t('detail.dataTitle')}>
                <DefinitionList entries={receiptEntries} />
            </SectionCard>
        </>
    );
};
