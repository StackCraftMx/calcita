// Ejemplo de métricas, gráficas y calendario.
//
// Lo que se ve aquí:
//   - MetricCard con `to`: la tarjeta entera lleva a la tabla de pedidos ya filtrada, donde el número cuadra;
//   - ColumnChart por mes con su línea de meta y SegmentedControl para elegir qué se cuenta; el importe se grafica en
//     centavos enteros y se escribe con Money (formatValue), así ni la gráfica pasa el dinero por decimales;
//   - PeriodRangeSelector para el rango de meses;
//   - BarList por producto: cada barra lleva a sus pedidos en la tabla;
//   - CalendarHeatmap con los pedidos de cada día. Toda gráfica trae su «Ver como tabla».
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
    CalendarHeatmap, MetricCard, PageHeading, PeriodRangeSelector, SectionCard, SegmentedControl, formatDate, formatMonthName,
    formatNumber, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {BarList, ColumnChart} from '@stackcraftmx/calcita/charts';
import {Money} from '@stackcraftmx/calcita/money';

import {ORDER_STATUS, ordersListFilteredBy} from '@/core';
import {getOrderMetrics} from '@/modules/metrics/metricsApi.js';

/** Qué cuentan las columnas por mes. */
const MONTHLY_MEASURES = Object.freeze({orders: 'orders', amount: 'amount'});

// la meta de pedidos de cada mes (la línea punteada de la gráfica)
const MONTHLY_ORDERS_GOAL = 150;

// la llave con que el servidor manda el total de todos los pedidos, junto a la de cada estado (status_totals)
const ALL_ORDERS_KEY = 'all';

// las tarjetas: lo que cuentan, su tono y si llevan a la tabla filtrada por ese estado
const STATUS_CARDS = Object.freeze([
    {status: ALL_ORDERS_KEY, tone: 'info', opensTable: false},
    {status: ORDER_STATUS.pending.value, tone: 'warning', opensTable: true},
    {status: ORDER_STATUS.delivered.value, tone: 'success', opensTable: true},
    {status: ORDER_STATUS.canceled.value, tone: 'error', opensTable: true},
]);

/**
 * El nombre corto de un mes del servidor ('2026-03' → «Mar 2026»), en el idioma activo.
 *
 * @param {string} month
 * @returns {string}
 */
function monthLabelOf(month) {
    const [year, monthNumber] = month.split('-').map(Number);
    return formatMonthName(year, monthNumber, {style: 'short', capitalize: true});
}

export const MetricsPage = () => {
    const {t} = useToolkitTranslation('metrics');
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [measure, setMeasure] = useState(MONTHLY_MEASURES.orders);
    const [monthRange, setMonthRange] = useState({from: null, to: null});

    useEffect(() => {
        const abortController = new AbortController();
        getOrderMetrics(abortController.signal)
            .then((response) => {
                setMetrics(response);
                // el rango arranca con todos los meses
                setMonthRange({from: response.months[0]?.month ?? null, to: response.months.at(-1)?.month ?? null});
            })
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
    if (!metrics) {
        return (
            <Box role="status" sx={{display: 'grid', placeItems: 'center', py: 8}}>
                <CircularProgress aria-label={t('page.loading')} />
            </Box>
        );
    }

    const moneyOf = (amount) => Money.fromString(amount, {currency: metrics.currency});
    // el importe va a la gráfica en centavos enteros y se escribe con Money, sin pasar por decimales
    const formatCents = (cents) => Money.fromMinorUnits(Math.round(cents), {currency: metrics.currency}).format();
    const isAmount = measure === MONTHLY_MEASURES.amount;

    const monthOptions = metrics.months.map(({month}) => ({value: month, label: monthLabelOf(month), disabled: false}));
    const monthsInRange = metrics.months.filter(({month}) => month >= monthRange.from && month <= monthRange.to);
    const columns = monthsInRange.map((figures) => {
        const value = isAmount ? moneyOf(figures.sold_amount).minorUnits : figures.received;
        const valueText = isAmount ? formatCents(value) : formatNumber(value);
        return {
            key: figures.month,
            value,
            label: monthLabelOf(figures.month),
            tooltip: t(isAmount ? 'monthly.amountTooltip' : 'monthly.ordersTooltip', {month: monthLabelOf(figures.month), value: valueText}),
        };
    });

    const productBars = metrics.products.map((product) => {
        const amountText = moneyOf(product.sold_amount).format();
        return {
            key: product.product_name,
            label: product.product_name,
            value: product.orders,
            detail: t('products.detail', {amount: amountText}),
            tooltip: t('products.tooltip', {product: product.product_name, orders: formatNumber(product.orders), amount: amountText}),
        };
    });

    const calendarDays = metrics.days.map((day) => ({date: day.date, value: day.orders}));
    const busiestDay = Math.max(0, ...metrics.days.map((day) => day.orders));

    return (
        <>
            <PageHeading title={t('page.title')} description={t('page.subtitle')} />

            <Grid container spacing={2} sx={{mb: 2}}>
                {STATUS_CARDS.map((card) => (
                    <Grid key={card.status} size={{xs: 12, sm: 6, md: 3}}>
                        <MetricCard
                            label={t(`cards.${card.status}`)}
                            value={formatNumber(metrics.status_totals[card.status])}
                            caption={card.opensTable
                                ? t(`cards.${card.status}Caption`)
                                : t('cards.allCaption', {from: formatDate(metrics.first_date), to: formatDate(metrics.last_date)})}
                            tone={card.tone}
                            to={card.opensTable ? ordersListFilteredBy('status', card.status) : undefined}
                        />
                    </Grid>
                ))}
            </Grid>

            <Stack spacing={2}>
                <SectionCard title={t('monthly.title')}>
                    {/* alineados por la orilla de abajo: los campos llevan su etiqueta arriba y el control segmentado no */}
                    <Stack direction={{xs: 'column', md: 'row'}} spacing={2} useFlexGap sx={{mb: 2, alignItems: {md: 'flex-end'}, flexWrap: 'wrap'}}>
                        <SegmentedControl
                            ariaLabel={t('monthly.measureLabel')}
                            value={measure}
                            onChange={(nextMeasure) => setMeasure(nextMeasure ?? measure)}
                            options={[
                                {value: MONTHLY_MEASURES.orders, label: t('monthly.orders')},
                                {value: MONTHLY_MEASURES.amount, label: t('monthly.amount')},
                            ]}
                        />
                        <PeriodRangeSelector id="monthly-range" options={monthOptions} from={monthRange.from} to={monthRange.to}
                                             fromLabel={t('monthly.from')} toLabel={t('monthly.to')} onChange={setMonthRange} />
                    </Stack>
                    <ColumnChart
                        data={columns}
                        periodLabel={t('monthly.period')}
                        valueLabel={isAmount ? t('monthly.amount') : t('monthly.orders')}
                        ariaLabel={t('monthly.ariaLabel')}
                        emptyLabel={t('monthly.empty')}
                        tone={isAmount ? 'success' : 'primary'}
                        formatValue={isAmount ? formatCents : formatNumber}
                        referenceLine={isAmount ? undefined : {
                            value: MONTHLY_ORDERS_GOAL, label: t('monthly.goal', {value: formatNumber(MONTHLY_ORDERS_GOAL)}),
                        }}
                    />
                </SectionCard>

                <SectionCard title={t('products.title')}>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>{t('products.hint')}</Typography>
                    <BarList items={productBars} emptyLabel={t('products.empty')}
                             onSelect={(bar) => navigate(ordersListFilteredBy('product_name', bar.key))} />
                </SectionCard>

                <SectionCard title={t('calendar.title')}>
                    <CalendarHeatmap
                        startsOn={metrics.first_date}
                        endsOn={metrics.last_date}
                        days={calendarDays}
                        ariaLabel={t('calendar.ariaLabel')}
                        valueLabel={t('calendar.valueLabel')}
                        describeValue={(value) => t('calendar.describe', {count: value})}
                        summary={t('calendar.summary', {days: formatNumber(calendarDays.length), max: formatNumber(busiestDay)})}
                        emptyLabel={t('calendar.empty')}
                    />
                </SectionCard>
            </Stack>
        </>
    );
};
