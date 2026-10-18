// Hecho en Calcita · descargas: el panel de descargas (DownloadManager) y startDownload. El ejemplo vivo manda archivos al
// panel (con avance, varios a la vez y uno que falla); el código enseña cómo montarlo una vez y cómo descargar desde una
// pantalla con la petición de la casa.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import DownloadPanelDemo from '@/modules/catalog/demos/downloads/DownloadPanelDemo.tsx';

const loadPanelDemo = () => import('@/modules/catalog/demos/downloads/DownloadPanelDemo.tsx?demo-source');
const loadSetup = () => import('@/modules/catalog/demos/downloads/DownloadManagerSetup.tsx?demo-source');
const loadFromApi = () => import('@/modules/catalog/demos/downloads/DownloadFromApi.tsx?demo-source');

export const DownloadsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('downloads.title')} description={t('downloads.description')} />
            <DemoSection title={t('downloads.panel.title')} description={t('downloads.panel.description')} Demo={DownloadPanelDemo} loadSource={loadPanelDemo} />
            <CodeSection title={t('downloads.setup.title')} description={t('downloads.setup.description')} loadSource={loadSetup} />
            <CodeSection title={t('downloads.fromApi.title')} description={t('downloads.fromApi.description')} loadSource={loadFromApi} />
        </Stack>
    );
};
