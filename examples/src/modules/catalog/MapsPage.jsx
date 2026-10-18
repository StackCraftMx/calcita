// Hecho en Calcita · el mapa (MapView de /maps): el ejemplo vivo y su código en JS y TS (para copiar).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import BranchMap from '@/modules/catalog/demos/maps/BranchMap.tsx';

const loadSource = () => import('@/modules/catalog/demos/maps/BranchMap.tsx?demo-source');

export const MapsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('maps.title')} description={t('maps.description')} />
            <DemoSection title={t('maps.demo.title')} description={t('maps.demo.description')} Demo={BranchMap} loadSource={loadSource} />
        </Stack>
    );
};
