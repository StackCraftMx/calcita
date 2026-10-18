// Hecho en Calcita · el tablero kanban (KanbanBoard de /kanban): el ejemplo vivo y su código en JS y TS (para copiar).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import TaskBoard from '@/modules/catalog/demos/kanban/TaskBoard.tsx';

const loadSource = () => import('@/modules/catalog/demos/kanban/TaskBoard.tsx?demo-source');

// «Cómo se extiende»: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts (kanban.demo.extend.<id>)
const KANBAN_EXTENSIONS = [
    {id: 'columns', option: 'columns', example: "columns={[{id: 'todo', title: 'Por hacer'}, {id: 'doing', title: 'En proceso', limit: 2}]}"},
    {id: 'cards', option: 'cards', example: "cards={[{id: 't1', columnId: 'todo', title: 'Llamar al proveedor', tags: ['Compras']}]}"},
    {id: 'onMove', option: 'onMove', example: 'onMove={({cardId, toColumnId, toIndex}) => tasksApi.move(cardId, toColumnId, toIndex)}'},
    {id: 'renderCard', option: 'renderCard', example: 'renderCard={(card) => <TaskCardContent task={card} />}'},
    {id: 'onCardClick', option: 'onCardClick', example: 'onCardClick={(cardId) => openTask(cardId)}'},
    {id: 'ariaLabel', option: 'ariaLabel', example: 'ariaLabel="Tareas del equipo"'},
];

export const KanbanPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('kanban.title')} description={t('kanban.description')} />
            <DemoSection title={t('kanban.demo.title')} description={t('kanban.demo.description')}
                         extensions={extensionRowsOf(t, 'kanban.demo', KANBAN_EXTENSIONS)} Demo={TaskBoard} loadSource={loadSource} />
        </Stack>
    );
};
