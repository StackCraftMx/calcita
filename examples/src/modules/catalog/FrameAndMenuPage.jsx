// Hecho en Calcita · el marco y el menú: AppLayout, el menu.js de cada módulo (composeMenu), los numeritos del menú y el
// regreso a la lista como estaba. Solo código: el marco vivo es el de esta misma app.
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection} from '@/modules/catalog/DemoSection.jsx';

const loadLayout = () => import('@/modules/catalog/demos/shell/AppShellSetup.tsx?demo-source');
const loadMenu = () => import('@/modules/catalog/demos/shell/moduleMenu.tsx?demo-source');
const loadBack = () => import('@/modules/catalog/demos/shell/BackToList.tsx?demo-source');

export const FrameAndMenuPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('shell.title')} description={t('shell.description')} />
            <CodeSection title={t('shell.layout.title')} description={t('shell.layout.description')}
                         loadSource={loadLayout} />
            <CodeSection title={t('shell.menu.title')} description={t('shell.menu.description')}
                         loadSource={loadMenu} />
            <CodeSection title={t('shell.back.title')} description={t('shell.back.description')}
                         loadSource={loadBack} />
        </Stack>
    );
};
