// Hecho en Calcita · el tablero kanban (KanbanBoard de /kanban): el ejemplo vivo y su código en JS y TS (para copiar).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import TaskBoard from '@/modules/catalog/demos/kanban/TaskBoard.tsx';

const loadSource = () => import('@/modules/catalog/demos/kanban/TaskBoard.tsx?demo-source');

export const KanbanPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('kanban.title')} description={t('kanban.description')} />
            <DemoSection title={t('kanban.demo.title')} description={t('kanban.demo.description')} Demo={TaskBoard} loadSource={loadSource} />
        </Stack>
    );
};
