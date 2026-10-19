// Hecho en Calcita · descargas: el panel de descargas (DownloadManager) y startDownload. El ejemplo vivo manda archivos al
// panel (con avance, varios a la vez y uno que falla); el código enseña cómo montarlo una vez y cómo descargar desde una
// pantalla con la petición de la casa.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import DownloadPanelDemo from '@/modules/catalog/demos/downloads/DownloadPanelDemo.tsx';

const loadPanelDemo = () => import('@/modules/catalog/demos/downloads/DownloadPanelDemo.tsx?demo-source');
const loadSetup = () => import('@/modules/catalog/demos/downloads/DownloadManagerSetup.tsx?demo-source');
const loadFromApi = () => import('@/modules/catalog/demos/downloads/DownloadFromApi.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (downloads.<sección>.extend.<id>)
const PANEL_EXTENSIONS = [
    {id: 'label', option: 'label', example: "startDownload({label: 'Pedidos de octubre', …})"},
    {id: 'format', option: 'format', example: "format: 'xlsx'"},
    {id: 'request', option: 'request', example: "request: (options) => api.download('/orders/export', options)"},
    {id: 'onCompleted', option: 'onCompleted', example: 'onCompleted: (fileName) => reloadTable()'},
    {id: 'onFailed', option: 'onFailed · onCanceled', example: "onFailed: (error) => reportError(error), onCanceled: () => analytics.track('download_canceled')"},
    {id: 'fileTypes', option: 'ToolkitProvider fileTypes', example: "fileTypes={{zip: {Icon: FolderZipOutlinedIcon, color: 'warning.main', label: 'ZIP', hint: 'Todas las facturas'}}}"},
    {id: 'errors', option: '(error del servidor)', example: "throw new ApiError({status: 503, problem: {detail: 'Todavía no se cierra el mes.'}})"},
];
const SETUP_EXTENSIONS = [
    {id: 'manager', option: '<DownloadManager />', example: '<DownloadManager />  // en la raíz, junto a <Toaster />'},
];
const FROM_API_EXTENSIONS = [
    {id: 'download', option: 'api.download(path, {signal, onDownloadProgress})', example: "request: ({signal, onDownloadProgress}) => api.download('/orders/export', {signal, onDownloadProgress})"},
    {id: 'noAwait', option: 'void startDownload(…)', example: 'run: async () => { void startDownload({…}); }'},
    {id: 'params', option: 'params', example: "api.download('/orders/export', {params: {month: '2026-10'}, …})"},
];

export const DownloadsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `downloads.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('downloads.title')} description={t('downloads.description')} />
            <DemoSection title={t('downloads.panel.title')} description={t('downloads.panel.description')}
                         extensions={rowsOf('panel', PANEL_EXTENSIONS)} Demo={DownloadPanelDemo} loadSource={loadPanelDemo} />
            <CodeSection title={t('downloads.setup.title')} description={t('downloads.setup.description')}
                         extensions={rowsOf('setup', SETUP_EXTENSIONS)} loadSource={loadSetup} />
            <CodeSection title={t('downloads.fromApi.title')} description={t('downloads.fromApi.description')}
                         extensions={rowsOf('fromApi', FROM_API_EXTENSIONS)} loadSource={loadFromApi} />
        </Stack>
    );
};
