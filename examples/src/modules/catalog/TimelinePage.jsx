// Catálogo · línea de tiempo: Timeline de @mui/lab (simple, alternada, con la hora del otro lado y con íconos de colores)
// y GroupedTimeline del framework (/timeline): el historial agrupado por intento, con el vigente resaltado y los
// anteriores apagados y plegados.
//
// Cada sección pinta su ejemplo de demos/timeline y lo enseña con «Ver código» (DemoSection).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import DetailedTimelines from '@/modules/catalog/demos/timeline/DetailedTimelines.tsx';
import GroupedTimelineDemo from '@/modules/catalog/demos/timeline/GroupedTimelineDemo.tsx';
import MuiTimelines from '@/modules/catalog/demos/timeline/MuiTimelines.tsx';

export const TimelinePage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('timeline.title')} description={t('timeline.description')} />

            <DemoSection title={t('timeline.mui.title')} description={t('timeline.mui.description')}
                         Demo={MuiTimelines} loadSource={() => import('@/modules/catalog/demos/timeline/MuiTimelines.tsx?demo-source')} />
            <DemoSection title={t('timeline.detail.title')} description={t('timeline.detail.description')}
                         Demo={DetailedTimelines} loadSource={() => import('@/modules/catalog/demos/timeline/DetailedTimelines.tsx?demo-source')} />
            <DemoSection title={t('frameworkTitle')} description={t('timeline.framework.description')}
                         Demo={GroupedTimelineDemo} loadSource={() => import('@/modules/catalog/demos/timeline/GroupedTimelineDemo.tsx?demo-source')} />
        </Stack>
    );
};
