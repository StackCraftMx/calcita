// Hecho en Calcita · gráficas: las del framework (/charts: ColumnChart y BarList; CalendarHeatmap y MetricCard en la puerta
// principal) con las reglas de la guía de Apple para gráficas (HIG «Charts» y «Charting data»):
//   - los datos al frente: rejilla y ejes tenues, que den contexto «without competing with the data»;
//   - una serie, un color y sin leyenda: el título ya dice qué es; el color no va solo (cada valor tiene su número);
//   - un título que dice qué se aprende de la gráfica antes de ver el detalle, con la unidad en el título («move units into a
//     title»): por eso el título de cada sección es el de su gráfica, con su número;
//   - accesible para todos: la gráfica lleva su descripción y una vista de tabla («Make every chart accessible»);
//   - lo de una misma serie se ve igual en todos lados («Prefer consistency across multiple charts»).
// Con el vidrio del tema, el tooltip de la gráfica flota de vidrio.
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo y trae su tabla «Cómo se extiende». Van una debajo
// de otra (antes, dos lado a lado como en un tablero): la tabla «Cómo se extiende» no cabía en media pantalla.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import ActivityHeatmap from '@/modules/catalog/demos/charts/ActivityHeatmap.tsx';
import MonthlyMetrics from '@/modules/catalog/demos/charts/MonthlyMetrics.tsx';
import MonthlyOrdersChart from '@/modules/catalog/demos/charts/MonthlyOrdersChart.tsx';
import SalesAndReturnsChart from '@/modules/catalog/demos/charts/SalesAndReturnsChart.tsx';
import TopProductsChart from '@/modules/catalog/demos/charts/TopProductsChart.tsx';

const loadMetrics = () => import('@/modules/catalog/demos/charts/MonthlyMetrics.tsx?demo-source');
const loadColumns = () => import('@/modules/catalog/demos/charts/MonthlyOrdersChart.tsx?demo-source');
const loadLines = () => import('@/modules/catalog/demos/charts/SalesAndReturnsChart.tsx?demo-source');
const loadBars = () => import('@/modules/catalog/demos/charts/TopProductsChart.tsx?demo-source');
const loadHeatmap = () => import('@/modules/catalog/demos/charts/ActivityHeatmap.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (charts.<sección>.extend.<id>)
const METRICS_EXTENSIONS = [
    {id: 'metric', option: '<MetricCard label value trend to>', example: "<MetricCard label=\"Pedidos\" value={formatNumber(174)} trend={{label: '+10 %', direction: TREND_DIRECTION.up, isGood: true}} />"},
    {id: 'grid', option: '<Grid size>', example: '<Grid size={{xs: 12, sm: 4}}><MetricCard … /></Grid>'},
];
const COLUMNS_EXTENSIONS = [
    {id: 'data', option: 'data', example: "data={[{key: '2026-9', value: 174, label: 'sep', tooltip: 'sep: 174 pedidos'}]}"},
    {id: 'labels', option: 'periodLabel · valueLabel', example: 'periodLabel="Mes" valueLabel="Pedidos"'},
    {id: 'ariaLabel', option: 'ariaLabel', example: 'ariaLabel="Pedidos por mes de abril a septiembre"'},
    {id: 'referenceLine', option: 'referenceLine', example: "referenceLine={{value: 160, label: 'Meta: 160 pedidos'}}"},
    {id: 'formatValue', option: 'formatValue', example: 'formatValue={(value) => formatCurrency(value)}'},
    {id: 'tone', option: 'tone', example: 'tone="success"'},
    {id: 'onSelect', option: 'onSelect', example: 'onSelect={(item) => navigate(`/orders?month=${item.key}`)}'},
    {id: 'size', option: 'height · emptyLabel', example: 'height={240} emptyLabel="No hay datos en este periodo."'},
    {id: 'series', option: 'series', example: "series={[{key: 'sales', label: 'Ventas'}, {key: 'returns', label: 'Devoluciones', tone: 'error'}]}"},
    {id: 'renderTooltip', option: 'renderTooltip', example: 'renderTooltip={(row) => `${row.label}: ${row.value} pedidos`}'},
    {id: 'texts', option: 'texts', example: "texts={{charts: {viewAsTable: 'Ver cifras'}}}"},
    {id: 'custom', option: 'recharts · ChartTooltip', example: "<Tooltip content={<ChartTooltip render={(row) => row.label} />} />  // import {ChartTooltip} from '@stackcraftmx/calcita/charts'"},
];
const LINES_EXTENSIONS = [
    {id: 'data', option: 'data', example: "data={[{key: '2026-4', label: 'abr', sales: 121, returns: 14}]}"},
    {id: 'series', option: 'series[].key · label · tone · dash', example: "series={[{key: 'sales', label: 'Ventas'}, {key: 'returns', label: 'Devoluciones', tone: 'error', dash: '6 4'}]}"},
    {id: 'onSelect', option: 'onSelect', example: 'onSelect={(row) => navigate(`/orders?month=${row.key}`)}'},
    {id: 'referenceLine', option: 'referenceLine', example: "referenceLine={{value: 160, label: 'Meta: 160'}}"},
    {id: 'formatValue', option: 'formatValue', example: 'formatValue={(value) => formatCurrency(value)}'},
    {id: 'renderTooltip', option: 'renderTooltip', example: 'renderTooltip={(row) => `${row.label}: ${row.sales} ventas`}'},
    {id: 'texts', option: 'texts', example: "texts={{charts: {legend: 'Series'}}}"},
];
const BARS_EXTENSIONS = [
    {id: 'items', option: 'items', example: "items={[{key: 'chair', label: 'Silla de oficina', value: 182400, detail: '96 piezas'}]}"},
    {id: 'tone', option: 'tone', example: 'tone="info"'},
    {id: 'onSelect', option: 'onSelect', example: 'onSelect={(item) => navigate(`/products/${item.key}`)}'},
    {id: 'emptyLabel', option: 'emptyLabel', example: 'emptyLabel="Todavía no hay ventas."'},
];
const HEATMAP_EXTENSIONS = [
    {id: 'range', option: 'startsOn · endsOn', example: 'startsOn="2026-04-01" endsOn="2026-09-30"'},
    {id: 'days', option: 'days', example: "days={[{date: '2026-09-15', value: 12, detail: '3 cancelados'}]}"},
    {id: 'describeValue', option: 'describeValue', example: "describeValue={(value) => t('orders', {count: value})}"},
    {id: 'table', option: 'ariaLabel · valueLabel', example: 'ariaLabel="Pedidos por día" valueLabel="Pedidos"'},
    {id: 'summary', option: 'summary', example: 'summary="152 días con pedidos"'},
    {id: 'tone', option: 'tone · emptyLabel', example: 'tone="success"'},
];

export const ChartsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `charts.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('charts.title')} description={t('charts.description')} />
            <DemoSection title={t('charts.metrics.title')} description={t('charts.metrics.description')}
                         extensions={rowsOf('metrics', METRICS_EXTENSIONS)} Demo={MonthlyMetrics} loadSource={loadMetrics} />
            <DemoSection title={t('charts.columns.title')} description={t('charts.columns.description')}
                         extensions={rowsOf('columns', COLUMNS_EXTENSIONS)} Demo={MonthlyOrdersChart} loadSource={loadColumns} />
            <DemoSection title={t('charts.lines.title')} description={t('charts.lines.description')}
                         extensions={rowsOf('lines', LINES_EXTENSIONS)} Demo={SalesAndReturnsChart} loadSource={loadLines} />
            <DemoSection title={t('charts.bars.title')} description={t('charts.bars.description')}
                         extensions={rowsOf('bars', BARS_EXTENSIONS)} Demo={TopProductsChart} loadSource={loadBars} />
            <DemoSection title={t('charts.heatmap.title')} description={t('charts.heatmap.description')}
                         extensions={rowsOf('heatmap', HEATMAP_EXTENSIONS)} Demo={ActivityHeatmap} loadSource={loadHeatmap} />
        </Stack>
    );
};
