// Hecho en Calcita · formatos, fechas y dinero: cada número, fecha y tamaño en el idioma y la zona del producto, y Money
// (de /money) para operar importes sin errores de decimales.
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import FormatsDemo from '@/modules/catalog/demos/formats/FormatsDemo.tsx';
import MoneyDemo from '@/modules/catalog/demos/formats/MoneyDemo.tsx';

const loadFormats = () => import('@/modules/catalog/demos/formats/FormatsDemo.tsx?demo-source');
const loadMoney = () => import('@/modules/catalog/demos/formats/MoneyDemo.tsx?demo-source');

export const FormatsAndMoneyPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('formats.title')} description={t('formats.description')} />
            <DemoSection title={t('formats.formats.title')} description={t('formats.formats.description')}
                         Demo={FormatsDemo} loadSource={loadFormats} />
            <DemoSection title={t('formats.money.title')} description={t('formats.money.description')}
                         Demo={MoneyDemo} loadSource={loadMoney} />
        </Stack>
    );
};
