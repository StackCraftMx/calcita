// Dos series que se comparan en el tiempo (LineChart): ventas y devoluciones por mes. Cada una con su color y su trazo, leyenda
// abajo y el globo de cada mes con las dos cifras. Con una sola serie no lleva leyenda.
import {formatMonthShortName, useToolkitTranslation} from '@stackcraftmx/calcita';
import {LineChart} from '@stackcraftmx/calcita/charts';

// 1. Los datos: un renglón por mes con el valor de cada serie en su llave (de mentira)
const YEAR = 2026;
const MONTHLY = [
    {month: 4, sales: 121, returns: 14},
    {month: 5, sales: 148, returns: 12},
    {month: 6, sales: 149, returns: 11},
    {month: 7, sales: 162, returns: 9},
    {month: 8, sales: 158, returns: 7},
    {month: 9, sales: 174, returns: 6},
];
const CHART_HEIGHT = 240;

const SalesAndReturnsChart = () => {
    const {t} = useToolkitTranslation('catalog');
    const data = MONTHLY.map(({month, sales, returns}) => ({key: `${YEAR}-${month}`, label: formatMonthShortName(month), sales, returns}));
    // 2. Las series: su llave en data, su nombre y su color (sin color, el que sigue del tema)
    const series = [
        {key: 'sales', label: t('charts.lines.sales')},
        {key: 'returns', label: t('charts.lines.returns'), tone: 'error' as const},
    ];

    // 3. La gráfica: con su descripción para el lector de pantalla y su vista de tabla
    return (
        <LineChart data={data} series={series} periodLabel={t('charts.lines.period')} ariaLabel={t('charts.lines.ariaLabel')}
                   emptyLabel={t('charts.empty')} height={CHART_HEIGHT} />
    );
};

export default SalesAndReturnsChart;
