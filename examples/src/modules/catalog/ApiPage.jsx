// Hecho en Calcita · servidor (API): la petición de la casa (createApiClient) con un servidor de mentira para ver cada caso
// (200, 422, 401, 404, 500, sin red, lenta y cancelada), las descargas al panel, cómo se arma el cliente del proyecto y la
// recuperación cuando se publica una versión con la pestaña abierta (withChunkRecovery y RouteErrorScreen). Cada sección
// dice para qué sirve en una línea, enseña el código mínimo y trae su tabla «Cómo se extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import ApiClientDemo from '@/modules/catalog/demos/api/ApiClientDemo.tsx';
import ApiDownloadDemo from '@/modules/catalog/demos/api/ApiDownloadDemo.tsx';

const loadClientDemo = () => import('@/modules/catalog/demos/api/ApiClientDemo.tsx?demo-source');
const loadDownloadDemo = () => import('@/modules/catalog/demos/api/ApiDownloadDemo.tsx?demo-source');
const loadClientSetup = () => import('@/modules/catalog/demos/api/ApiClientSetup.ts?demo-source');
const loadRouterSetup = () => import('@/modules/catalog/demos/api/RouterSetup.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (api.<sección>.extend.<id>)
const CLIENT_EXTENSIONS = [
    {id: 'methods', option: 'get · post · put · patch · delete', example: "await api.post('/orders', {customerId: 7})"},
    {id: 'params', option: 'params', example: "api.get('/orders', {params: {page: 2, status: 'paid'}})"},
    {id: 'body', option: 'body', example: "api.post('/files', formData)"},
    {id: 'signal', option: 'signal', example: "api.get('/orders', {signal: controller.signal})"},
    {id: 'requestHeaders', option: 'headers', example: "api.get('/orders', {headers: {'X-Branch': 'MTY'}})"},
    {id: 'parse', option: 'parse', example: "api.get('/logo', {parse: 'blob'})"},
    {id: 'timeout', option: 'timeoutMilliseconds', example: "api.post('/close-month', data, {timeoutMilliseconds: 180000})"},
    {id: 'skipUnauthenticated', option: 'skipUnauthenticatedHandler', example: "api.get('/auth/session', {skipUnauthenticatedHandler: true})"},
    {id: 'errorText', option: 'error.title · error.message', example: '<Alert>{error.message}</Alert>'},
    {id: 'errorKinds', option: 'isOffline · isUnauthenticated · isConflict · isGone · isValidation', example: 'if (error.isConflict) { reload(); }'},
    {id: 'fieldErrors', option: 'fieldErrorsOf(error.problem)', example: 'fieldErrorsOf(error.problem).email  // ["Ya existe"]'},
    {id: 'requestId', option: 'error.requestId', example: 'Referencia {error.requestId}'},
    {id: 'toast', option: 'toastProblem(error)', example: 'catch (error) { toastProblem(error); }'},
];
const DOWNLOAD_EXTENSIONS = [
    {id: 'download', option: 'api.download(path)', example: "const {blob, fileName} = await api.download('/orders/export');"},
    {id: 'progress', option: 'onDownloadProgress', example: 'api.download(path, {onDownloadProgress: ({loaded, total}) => …})'},
    {id: 'fallbackFileName', option: 'fallbackFileName', example: "api.download(path, {fallbackFileName: 'pedidos.csv'})"},
    {id: 'downloadTimeout', option: 'timeoutMilliseconds', example: 'api.download(path, {timeoutMilliseconds: 600000})'},
    {id: 'startDownload', option: 'startDownload({label, format, request})', example: "startDownload({label: 'Pedidos', format: 'csv', request: (options) => api.download(path, options)})"},
];
const SETUP_EXTENSIONS = [
    {id: 'baseUrl', option: 'baseUrl', example: "createApiClient({baseUrl: '/api/v1'})"},
    {id: 'credentials', option: 'credentials', example: "createApiClient({credentials: 'include'})"},
    {id: 'getToken', option: 'getToken', example: "createApiClient({getToken: () => localStorage.getItem('token')})"},
    {id: 'headers', option: 'headers', example: "createApiClient({headers: {'X-App-Version': '2.4.0'}})"},
    {id: 'csrf', option: 'csrf', example: "createApiClient({csrf: {refreshPath: '/sanctum/csrf-cookie'}})"},
    {id: 'publishedBuild', option: 'publishedBuildHeader', example: "createApiClient({publishedBuildHeader: 'X-Frontend-Build'})"},
    {id: 'clientTimeout', option: 'timeoutMilliseconds', example: 'createApiClient({timeoutMilliseconds: 30000})'},
    {id: 'onUnauthenticated', option: 'onUnauthenticated', example: "createApiClient({onUnauthenticated: () => navigate('/sign-in')})"},
    {id: 'events', option: 'onRequest · onResponse · onError', example: 'createApiClient({onError: (error, {url}) => reportError(error, url)})'},
    {id: 'toProblem', option: 'toProblem', example: 'createApiClient({toProblem: (body) => ({title: body.message, errors: body.errors})})'},
    {id: 'mapResponse', option: 'mapResponse', example: 'createApiClient({mapResponse: (body) => body.data ?? body})'},
    {id: 'fetch', option: 'fetch', example: 'createApiClient({fetch: fakeServerFetch})'},
];
const STALE_EXTENSIONS = [
    {id: 'chunkRecovery', option: 'withChunkRecovery(routes)', example: 'children: withChunkRecovery([{path: "orders", lazy: …}])'},
    {id: 'routeError', option: 'RouteErrorScreen', example: "{path: '/', ErrorBoundary: RouteErrorScreen, …}"},
    {id: 'buildWatch', option: 'usePublishedBuildWatch', example: 'usePublishedBuildWatch({url: `${import.meta.env.BASE_URL}version.json`, buildId})'},
];

export const ApiPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `api.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('api.title')} description={t('api.description')} />
            <DemoSection title={t('api.client.title')} description={t('api.client.description')}
                         extensions={rowsOf('client', CLIENT_EXTENSIONS)} Demo={ApiClientDemo} loadSource={loadClientDemo} />
            <DemoSection title={t('api.download.title')} description={t('api.download.description')}
                         extensions={rowsOf('download', DOWNLOAD_EXTENSIONS)} Demo={ApiDownloadDemo} loadSource={loadDownloadDemo} />
            <CodeSection title={t('api.setup.title')} description={t('api.setup.description')}
                         extensions={rowsOf('setup', SETUP_EXTENSIONS)} loadSource={loadClientSetup} />
            <CodeSection title={t('api.stale.title')} description={t('api.stale.description')}
                         extensions={rowsOf('stale', STALE_EXTENSIONS)} loadSource={loadRouterSetup} />
        </Stack>
    );
};
