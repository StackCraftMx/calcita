// Catálogo · servidor (API): la petición de la casa (createApiClient) con un servidor de mentira para ver cada caso
// (200, 422, 401, 404, 500, sin red, lenta y cancelada), las descargas al panel, cómo se arma el cliente del proyecto y la
// recuperación cuando se publica una versión con la pestaña abierta (withChunkRecovery y RouteErrorScreen).
//
// Los dos primeros son ejemplos vivos; los demás solo enseñan su código, abierto de entrada.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import ApiClientDemo from '@/modules/catalog/demos/api/ApiClientDemo.tsx';
import ApiDownloadDemo from '@/modules/catalog/demos/api/ApiDownloadDemo.tsx';

const loadClientSetup = () => import('@/modules/catalog/demos/api/ApiClientSetup.ts?demo-source');
const loadRouterSetup = () => import('@/modules/catalog/demos/api/RouterSetup.tsx?demo-source');

export const ApiPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('api.title')} description={t('api.description')} />

            <DemoSection title={t('api.client.title')} description={t('api.client.description')}
                         Demo={ApiClientDemo} loadSource={() => import('@/modules/catalog/demos/api/ApiClientDemo.tsx?demo-source')} />
            <DemoSection title={t('api.download.title')} description={t('api.download.description')}
                         Demo={ApiDownloadDemo} loadSource={() => import('@/modules/catalog/demos/api/ApiDownloadDemo.tsx?demo-source')} />
            <CodeSection title={t('api.setup.title')} description={t('api.setup.description')} loadSource={loadClientSetup} />
            <CodeSection title={t('api.stale.title')} description={t('api.stale.description')} loadSource={loadRouterSetup} />
        </Stack>
    );
};
