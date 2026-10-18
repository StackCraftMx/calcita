import {formatMonthShortName, formatNumber, useToolkitTranslation} from '@stackcraftmx/calcita';
import {ColumnChart} from '@stackcraftmx/calcita/charts';

// pedidos por mes de abril a septiembre (de mentira) y la meta del mes
const YEAR = 2026;
const MONTHLY_ORDERS = [
    {month: 4, value: 121},
    {month: 5, value: 148},
    {month: 6, value: 149},
    {month: 7, value: 162},
    {month: 8, value: 158},
    {month: 9, value: 174},
];
const MONTHLY_GOAL = 160;
const CHART_HEIGHT = 240;

// Reglas de Apple para gráficas: los datos al frente (rejilla tenue), una serie y un color sin leyenda, la unidad en el
// título y una descripción para el lector de pantalla (ariaLabel), con vista de tabla
const MonthlyOrdersChart = () => {
    const {t} = useToolkitTranslation('catalog');
    const data = MONTHLY_ORDERS.map(({month, value}) => ({
        key: `${YEAR}-${month}`,
        value,
        label: formatMonthShortName(month),
        tooltip: t('charts.columns.tooltip', {month: formatMonthShortName(month), count: formatNumber(value)}),
    }));

    return (
        <ColumnChart data={data} periodLabel={t('charts.columns.period')} valueLabel={t('charts.columns.value')}
                     ariaLabel={t('charts.columns.ariaLabel', {goal: MONTHLY_GOAL})} emptyLabel={t('charts.empty')} height={CHART_HEIGHT}
                     referenceLine={{value: MONTHLY_GOAL, label: t('charts.columns.goal', {goal: MONTHLY_GOAL})}} />
    );
};

export default MonthlyOrdersChart;
