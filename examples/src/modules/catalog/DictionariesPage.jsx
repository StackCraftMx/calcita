// Hecho en Calcita · diccionarios y etiquetas: un código del API → su texto, su explicación y su color, escrito una
// vez por catálogo (StatusChip, DictionaryText, labelOf) y las etiquetas (Tag).
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import OrderStatusDictionary from '@/modules/catalog/demos/dictionaries/OrderStatusDictionary.tsx';

const loadDemo = () => import('@/modules/catalog/demos/dictionaries/OrderStatusDictionary.tsx?demo-source');
const loadTexts = () => import('@/modules/catalog/demos/dictionaries/orderStatusTexts.ts?demo-source');

export const DictionariesPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('dictionaries.title')} description={t('dictionaries.description')} />
            <DemoSection title={t('dictionaries.demo.title')} description={t('dictionaries.demo.description')}
                         Demo={OrderStatusDictionary} loadSource={loadDemo} />
            <CodeSection title={t('dictionaries.texts.title')} description={t('dictionaries.texts.description')}
                         loadSource={loadTexts} />
        </Stack>
    );
};
