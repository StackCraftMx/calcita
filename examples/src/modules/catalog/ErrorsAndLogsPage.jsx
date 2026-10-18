// Hecho en Calcita · errores y registro: las páginas de error, el registro sin datos personales y el aviso de versión
// nueva.
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import ErrorPages from '@/modules/catalog/demos/errors/ErrorPages.tsx';

const loadPages = () => import('@/modules/catalog/demos/errors/ErrorPages.tsx?demo-source');
const loadLogs = () => import('@/modules/catalog/demos/errors/LoggerAndBuild.ts?demo-source');
const loadSentry = () => import('@/modules/catalog/demos/errors/SendErrorsToSentry.ts?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (errorsAndLogs.<sección>.extend.<id>)
const PAGES_EXTENSIONS = [
    {id: 'kind', option: 'kind', example: '<ErrorPage kind={ERROR_PAGE_KIND.notFound} />'},
    {id: 'texts', option: 'title · text', example: '<ErrorPage kind={…} title="Ese pedido ya no existe" text="Quizá se canceló." />'},
    {id: 'homePath', option: 'homePath', example: 'homePath="/dashboard"'},
    {id: 'onRetry', option: 'onRetry', example: 'onRetry={() => window.location.reload()}'},
    {id: 'router', option: "path: '*' · ErrorBoundary", example: "{path: '*', element: <ErrorPage kind={ERROR_PAGE_KIND.notFound} />}"},
];
const LOGS_EXTENSIONS = [
    {id: 'logger', option: 'createLogger(namespace)', example: "createLogger('orders').warn('No se pudo cancelar', {orderId, status, requestId})"},
    {id: 'level', option: 'setLogLevel', example: "if (import.meta.env.DEV) setLogLevel('debug');"},
    {id: 'notice', option: '<NewBuildNotice />', example: '<NewBuildNotice variant={NEW_BUILD_NOTICE_VARIANT.floating} />'},
    {id: 'buildId', option: 'ToolkitProvider buildId', example: 'buildId={import.meta.env.VITE_BUILD_ID}'},
    {id: 'reportBuild', option: 'reportPublishedBuild', example: "reportPublishedBuild(response.headers.get('X-Frontend-Build'))"},
    {id: 'watch', option: 'usePublishedBuildWatch({url, buildId})', example: 'usePublishedBuildWatch({url: `${import.meta.env.BASE_URL}version.json`, buildId: APP_BUILD_ID})'},
    {id: 'watchOptions', option: 'checkEveryMinutes · reloadAfterHiddenMinutes · onReload', example: 'usePublishedBuildWatch({…, reloadAfterHiddenMinutes: null})'},
];

const SENTRY_EXTENSIONS = [
    {id: 'console', option: 'captureConsoleIntegration', example: "Sentry.init({dsn, integrations: [Sentry.captureConsoleIntegration({levels: ['error']})]})"},
    {id: 'apiErrors', option: 'createApiClient onError', example: 'onError: (error, {method, url}) => Sentry.captureException(error, {extra: {url, requestId: error.requestId}})'},
    {id: 'render', option: 'createRoot onUncaughtError · onCaughtError', example: 'createRoot(container, {onUncaughtError: Sentry.reactErrorHandler(), onCaughtError: Sentry.reactErrorHandler()})'},
    {id: 'other', option: 'su herramienta', example: "onError: (error) => fetch('/api/client-errors', {method: 'POST', body: JSON.stringify({status: error.status})})"},
];

export const ErrorsAndLogsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `errorsAndLogs.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('errorsAndLogs.title')} description={t('errorsAndLogs.description')} />
            <DemoSection title={t('errorsAndLogs.pages.title')} description={t('errorsAndLogs.pages.description')}
                         extensions={rowsOf('pages', PAGES_EXTENSIONS)} Demo={ErrorPages} loadSource={loadPages} />
            <CodeSection title={t('errorsAndLogs.logs.title')} description={t('errorsAndLogs.logs.description')}
                         extensions={rowsOf('logs', LOGS_EXTENSIONS)} loadSource={loadLogs} />
            <CodeSection title={t('errorsAndLogs.sentry.title')} description={t('errorsAndLogs.sentry.description')}
                         extensions={rowsOf('sentry', SENTRY_EXTENSIONS)} loadSource={loadSentry} />
        </Stack>
    );
};
