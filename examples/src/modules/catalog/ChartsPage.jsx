// Catálogo · gráficas: las del framework (/charts: ColumnChart y BarList; CalendarHeatmap y MetricCard en la puerta
// principal) con las reglas de la guía de Apple para gráficas (HIG «Charts» y «Charting data»):
//   - los datos al frente: rejilla y ejes tenues, que den contexto «without competing with the data»;
//   - una serie, un color y sin leyenda: el título ya dice qué es; el color no va solo (cada valor tiene su número);
//   - un título que dice qué se aprende de la gráfica antes de ver el detalle, con la unidad en el título («move units into a
//     title»);
//   - accesible para todos: la gráfica lleva su descripción y una vista de tabla («Make every chart accessible»);
//   - lo de una misma serie se ve igual en todos lados («Prefer consistency across multiple charts»).
// Con el vidrio del tema, el tooltip de la gráfica flota de vidrio.
//
// Los datos son de mentira y fijos (sin azar), para que la página se vea igual cada vez.
//
// Lo renderiza la app: arrow (regla de la casa).
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import {
    CalendarHeatmap, MetricCard, PageHeading, SectionCard, TREND_DIRECTION, formatCurrency, formatMonthShortName, formatNumber, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {BarList, ColumnChart} from '@stackcraftmx/calcita/charts';

// pedidos por mes de abril a septiembre de 2026 (de mentira) y la meta del mes
const SAMPLE_YEAR = 2026;
const MONTHLY_ORDERS = Object.freeze([
    {month: 4, value: 121},
    {month: 5, value: 148},
    {month: 6, value: 149},
    {month: 7, value: 162},
    {month: 8, value: 158},
    {month: 9, value: 174},
]);
const MONTHLY_GOAL = 160;
// lo más vendido del mes, en centavos (como lo manda el API)
const TOP_PRODUCTS = Object.freeze([
    {key: 'chair', cents: 18620000},
    {key: 'desk', cents: 14136000},
    {key: 'monitor', cents: 10078400},
    {key: 'lamp', cents: 4139400},
    {key: 'keyboard', cents: 2698350},
]);
const CENTS_PER_UNIT = 100;
// el calendario de actividad: seis meses; cada día con pedidos sale de una cuenta fija (sin azar)
const HEATMAP_STARTS_ON = '2026-04-01';
const HEATMAP_ENDS_ON = '2026-09-30';
const HEATMAP_DAY_COUNT = 183;
const HEATMAP_PATTERN_MODULO = 11;
const SUNDAY_EVERY_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
// la altura de las gráficas de columnas: la de una tarjeta del tablero
const COLUMN_CHART_HEIGHT = 240;

/**
 * Los días con pedidos del calendario de ejemplo: una cuenta fija que da días de poco y de mucho, y los domingos sin pedidos.
 *
 * @returns {Array<{date: string, value: number}>}
 */
function sampleActivityDays() {
    const firstDay = Date.parse(`${HEATMAP_STARTS_ON}T00:00:00Z`);
    return Array.from({length: HEATMAP_DAY_COUNT}, (unused, index) => ({
        date: new Date(firstDay + index * MILLISECONDS_PER_DAY).toISOString().slice(0, 10),
        value: index % SUNDAY_EVERY_DAYS === 4 ? 0 : (index * 7) % HEATMAP_PATTERN_MODULO,
    })).filter((day) => day.value > 0);
}

const ACTIVITY_DAYS = sampleActivityDays();

export const ChartsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    const monthlyData = MONTHLY_ORDERS.map(({month, value}) => ({
        key: `${SAMPLE_YEAR}-${month}`,
        value,
        label: formatMonthShortName(month),
        tooltip: t('charts.columns.tooltip', {month: formatMonthShortName(month), count: formatNumber(value)}),
    }));
    const productItems = TOP_PRODUCTS.map(({key, cents}) => ({key, label: t(`charts.bars.products.${key}`), value: cents / CENTS_PER_UNIT}));
    const lastMonth = MONTHLY_ORDERS[MONTHLY_ORDERS.length - 1];

    return (
        <Stack spacing={3}>
            <PageHeading title={t('charts.title')} description={t('charts.description')} />

            <Grid container spacing={3}>
                <Grid size={{xs: 12, sm: 4}}>
                    <MetricCard label={t('charts.metrics.orders')} value={formatNumber(lastMonth.value)}
                                trend={{label: '+10.1 %', direction: TREND_DIRECTION.up, isGood: true}} caption={t('charts.metrics.vsLastMonth')} />
                </Grid>
                <Grid size={{xs: 12, sm: 4}}>
                    <MetricCard label={t('charts.metrics.canceled')} value={formatNumber(13)}
                                trend={{label: '−7.1 %', direction: TREND_DIRECTION.down, isGood: true}} caption={t('charts.metrics.vsLastMonth')} />
                </Grid>
                <Grid size={{xs: 12, sm: 4}}>
                    <MetricCard label={t('charts.metrics.average')} value={formatCurrency(6403.11)}
                                trend={{label: '0.0 %', direction: TREND_DIRECTION.flat}} caption={t('charts.metrics.vsLastMonth')} />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{xs: 12, md: 7}}>
                    <SectionCard title={t('charts.columns.title')}>
                        <ColumnChart data={monthlyData} periodLabel={t('charts.columns.period')} valueLabel={t('charts.columns.value')}
                                     ariaLabel={t('charts.columns.ariaLabel', {goal: MONTHLY_GOAL})} emptyLabel={t('charts.empty')} height={COLUMN_CHART_HEIGHT}
                                     referenceLine={{value: MONTHLY_GOAL, label: t('charts.columns.goal', {goal: MONTHLY_GOAL})}} />
                    </SectionCard>
                </Grid>
                <Grid size={{xs: 12, md: 5}}>
                    <SectionCard title={t('charts.bars.title')}>
                        <BarList items={productItems} emptyLabel={t('charts.empty')} />
                    </SectionCard>
                </Grid>
            </Grid>

            <SectionCard title={t('charts.heatmap.title')}>
                <Box sx={{overflowX: 'auto'}}>
                    <CalendarHeatmap startsOn={HEATMAP_STARTS_ON} endsOn={HEATMAP_ENDS_ON} days={ACTIVITY_DAYS}
                                     ariaLabel={t('charts.heatmap.ariaLabel')} valueLabel={t('charts.heatmap.value')}
                                     describeValue={(value) => t('charts.heatmap.describe', {count: value})}
                                     summary={t('charts.heatmap.summary', {days: ACTIVITY_DAYS.length})} />
                </Box>
            </SectionCard>
        </Stack>
    );
};
