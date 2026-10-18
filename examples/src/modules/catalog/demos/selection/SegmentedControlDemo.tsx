import {useState} from 'react';
import {SegmentedControl, useToolkitTranslation} from '@stackcraftmx/calcita';

const PERIODS = ['day', 'week', 'month'];

// el control segmentado de Apple: opciones del mismo ancho y la elegida en su gota; un clic en la elegida no la apaga
const SegmentedControlDemo = () => {
    const {t} = useToolkitTranslation('catalog');
    const [period, setPeriod] = useState('week');
    const periodOptions = PERIODS.map((value) => ({value, label: t(`selection.periods.${value}`)}));

    return <SegmentedControl options={periodOptions} value={period} onChange={setPeriod} ariaLabel={t('selection.toggle.period')} />;
};

export default SegmentedControlDemo;
