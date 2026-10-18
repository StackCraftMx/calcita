// Hecho en Calcita · la tabla de servidor (ServerTable de /table): pagina, filtra y ordena en el servidor, con el total
// real y las opciones de cada filtro con su conteo.
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import OrdersTableDemo from '@/modules/catalog/demos/table/OrdersTableDemo.tsx';

const loadDemo = () => import('@/modules/catalog/demos/table/OrdersTableDemo.tsx?demo-source');
const loadApi = () => import('@/modules/catalog/demos/table/OrdersTableApi.ts?demo-source');

export const ServerTablePage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('serverTable.title')} description={t('serverTable.description')} />
            <DemoSection title={t('serverTable.demo.title')} description={t('serverTable.demo.description')}
                         Demo={OrdersTableDemo} loadSource={loadDemo} />
            <CodeSection title={t('serverTable.api.title')} description={t('serverTable.api.description')}
                         loadSource={loadApi} />
        </Stack>
    );
};
