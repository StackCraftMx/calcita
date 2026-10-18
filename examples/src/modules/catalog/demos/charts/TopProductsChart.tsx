import {useToolkitTranslation} from '@stackcraftmx/calcita';
import {BarList} from '@stackcraftmx/calcita/charts';

// lo más vendido del mes, en centavos como lo manda el API (de mentira)
const TOP_PRODUCTS = [
    {key: 'chair', cents: 18620000},
    {key: 'desk', cents: 14136000},
    {key: 'monitor', cents: 10078400},
    {key: 'lamp', cents: 4139400},
    {key: 'keyboard', cents: 2698350},
];
const CENTS_PER_PESO = 100;

// cada barra con su número en la punta: el color no va solo
const TopProductsChart = () => {
    const {t} = useToolkitTranslation('catalog');
    const items = TOP_PRODUCTS.map(({key, cents}) => ({key, label: t(`charts.bars.products.${key}`), value: cents / CENTS_PER_PESO}));
    return <BarList items={items} emptyLabel={t('charts.empty')} />;
};

export default TopProductsChart;
