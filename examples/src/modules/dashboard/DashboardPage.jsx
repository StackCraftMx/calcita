// El tablero, como el de las plantillas de MUI: cuatro tarjetas con la cifra del mes y su tendencia contra el anterior
// (MetricCard con trend), lo vendido por mes (ColumnChart), lo más pedido en el mes (BarList) y los últimos pedidos.
//
// La tendencia dice si es buena o mala, no solo si subió: más cancelados es subir y es malo (isGood en rojo). El dinero
// se compara y se grafica en centavos enteros (Money), sin pasar por decimales.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import {Link as RouterLink} from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {
    MetricCard, PageHeading, SectionCard, StatusChip, TREND_DIRECTION, formatDateTime, formatMonthName, formatNumber, formatPercent,
    useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {BarList, ColumnChart} from '@stackcraftmx/calcita/charts';
import {Money} from '@stackcraftmx/calcita/money';

import {useAccount} from '@stackcraftmx/calcita/account';

import {APP_PATHS, ORDER_STATUS, orderDetailPathOf} from '@/core';
import {getDashboard} from '@/modules/dashboard/dashboardApi.js';

// la tendencia se escribe con un decimal: «+12.4 %»
const TREND_FRACTION_DIGITS = 1;
const TREND_ROUNDING = 10 ** TREND_FRACTION_DIGITS;
const PERCENT = 100;

/**
 * El nombre de un mes del servidor ('2026-09' → «Septiembre 2026» o «Sep 2026»), en el idioma activo.
 *
 * @param {string} month AAAA-MM
 * @param {'long'|'short'} [style]
 * @returns {string}
 */
const monthLabelOf = (month, style = 'long') => {
    const [year, monthNumber] = month.split('-').map(Number);
    return formatMonthName(year, monthNumber, {style, capitalize: true});
};

/**
 * Cuánto cambió una cifra contra el mes anterior, para MetricCard: el cambio en por ciento y si es bueno.
 *
 * @param {number} current
 * @param {number} previous
 * @param {{isGoodWhenUp?: boolean}} [options] para lo que es malo que suba (cancelados): false
 * @returns {{label: string, direction: string, isGood: boolean}|undefined} sin el mes anterior no hay contra qué comparar
 */
const trendOf = (current, previous, {isGoodWhenUp = true} = {}) => {
    if (previous === 0) {
        return undefined;
    }
    const change = Math.round(((current - previous) / previous) * PERCENT * TREND_ROUNDING) / TREND_ROUNDING;
    const direction = change > 0 ? TREND_DIRECTION.up : (change < 0 ? TREND_DIRECTION.down : TREND_DIRECTION.flat);
    const sign = change > 0 ? '+' : '';
    return {
        label: `${sign}${formatPercent(change, {fractionDigits: TREND_FRACTION_DIGITS})}`,
        direction,
        isGood: isGoodWhenUp ? direction === TREND_DIRECTION.up : direction === TREND_DIRECTION.down,
    };
};

/** Los últimos pedidos: el número lleva a su detalle. */
const RecentOrders = ({orders, currency}) => {
    const {t} = useToolkitTranslation('dashboard');
    return (
        <TableContainer>
            <Table size="small" aria-label={t('recent.ariaLabel')}>
                <TableHead>
                    <TableRow>
                        {['number', 'customer', 'product', 'total', 'status', 'createdAt'].map((column) => (
                            <TableCell key={column} align={column === 'total' ? 'right' : 'left'} sx={{fontWeight: 600, whiteSpace: 'nowrap'}}>
                                {t(`recent.${column}`)}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id} hover>
                            <TableCell><Link component={RouterLink} to={orderDetailPathOf(order.id)}>{order.number}</Link></TableCell>
                            <TableCell sx={{whiteSpace: 'nowrap'}}>{order.customer_name}</TableCell>
                            <TableCell>{order.product_name}</TableCell>
                            <TableCell align="right" sx={{fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
                                {Money.fromString(order.total, {currency}).format()}
                            </TableCell>
                            <TableCell><StatusChip dictionary={ORDER_STATUS} value={order.status} short /></TableCell>
                            <TableCell sx={{whiteSpace: 'nowrap'}}>{formatDateTime(order.created_at)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export const DashboardPage = () => {
    const {t} = useToolkitTranslation('dashboard');
    const {session} = useAccount();
    const [dashboard, setDashboard] = useState(null);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const abortController = new AbortController();
        getDashboard(abortController.signal)
            .then(setDashboard)
            .catch((error) => {
                if (!abortController.signal.aborted) {
                    setLoadError(error);
                }
            });
        return () => abortController.abort();
    }, []);

    // guard clause: falló; el mensaje ya viene traducido
    if (loadError) {
        return <Alert severity="error" role="alert">{loadError.message}</Alert>;
    }

    // guard clause: todavía no llegan las cifras
    if (!dashboard) {
        return (
            <Box role="status" sx={{display: 'grid', placeItems: 'center', py: 8}}>
                <CircularProgress aria-label={t('page.loading')} />
            </Box>
        );
    }

    const {current, previous, currency} = dashboard;
    const moneyOf = (amount) => Money.fromString(amount, {currency});
    // el importe va a la gráfica en centavos enteros y se escribe con Money
    const formatCents = (cents) => Money.fromMinorUnits(Math.round(cents), {currency}).format();
    const previousMonthLabel = monthLabelOf(dashboard.previous_month);

    const cards = [
        {
            key: 'sold', tone: 'success', value: moneyOf(current.sold_amount).format(), previousValue: moneyOf(previous.sold_amount).format(),
            trend: trendOf(moneyOf(current.sold_amount).minorUnits, moneyOf(previous.sold_amount).minorUnits),
        },
        {
            key: 'orders', tone: 'info', value: formatNumber(current.orders), previousValue: formatNumber(previous.orders),
            trend: trendOf(current.orders, previous.orders),
        },
        {
            key: 'averageTicket', tone: 'info', value: moneyOf(current.average_ticket).format(), previousValue: moneyOf(previous.average_ticket).format(),
            trend: trendOf(moneyOf(current.average_ticket).minorUnits, moneyOf(previous.average_ticket).minorUnits),
        },
        {
            key: 'canceled', tone: 'error', value: formatNumber(current.canceled), previousValue: formatNumber(previous.canceled),
            trend: trendOf(current.canceled, previous.canceled, {isGoodWhenUp: false}),
        },
    ];

    const columns = dashboard.monthly.map((figures) => {
        const cents = moneyOf(figures.sold_amount).minorUnits;
        return {
            key: figures.month,
            value: cents,
            label: monthLabelOf(figures.month, 'short'),
            tooltip: t('monthly.tooltip', {month: monthLabelOf(figures.month), value: formatCents(cents)}),
        };
    });

    const productBars = dashboard.top_products.map((product) => ({key: product.product_name, label: product.product_name, value: product.orders}));

    return (
        <>
            <PageHeading title={t('page.title')}
                         description={t('page.subtitle', {
                             name: session.user.name.split(' ')[0], month: monthLabelOf(dashboard.current_month), previousMonth: previousMonthLabel,
                         })} />

            <Grid container spacing={2} sx={{mb: 2}}>
                {cards.map((card) => (
                    <Grid key={card.key} size={{xs: 12, sm: 6, lg: 3}}>
                        <MetricCard label={t(`cards.${card.key}`)} value={card.value} tone={card.tone} trend={card.trend}
                                    caption={t('cards.previous', {month: previousMonthLabel, value: card.previousValue})} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={2} sx={{mb: 2}}>
                <Grid size={{xs: 12, md: 7}}>
                    <SectionCard title={t('monthly.title')}>
                        <ColumnChart data={columns} periodLabel={t('monthly.period')} valueLabel={t('monthly.value')} ariaLabel={t('monthly.ariaLabel')}
                                     emptyLabel={t('monthly.empty')} tone="success" formatValue={formatCents} />
                    </SectionCard>
                </Grid>
                {/* la lista de barras necesita su ancho: el nombre del producto, la barra y el número */}
                <Grid size={{xs: 12, md: 5}}>
                    <SectionCard title={t('products.title', {month: monthLabelOf(dashboard.current_month)})}>
                        <BarList items={productBars} emptyLabel={t('products.empty')} />
                    </SectionCard>
                </Grid>
            </Grid>

            <SectionCard title={t('recent.title')} action={<Button component={RouterLink} to={APP_PATHS.orders} size="small">{t('recent.seeAll')}</Button>}>
                <RecentOrders orders={dashboard.recent_orders} currency={currency} />
            </SectionCard>
        </>
    );
};
