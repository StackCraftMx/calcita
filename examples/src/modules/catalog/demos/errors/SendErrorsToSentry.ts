// Mandar los errores a Sentry (o a la herramienta que use: Datadog, LogRocket, un endpoint propio). Calcita no trae ninguna ni
// obliga a una: deja los tres lugares por donde pasan TODOS los errores y ahí se conecta la suya.
//   1. lo que anota el registro (createLogger: log.error('…', {requestId})) sale por console.error: Sentry lo toma con
//      captureConsoleIntegration. Solo los errores: por omisión tomaría también log, info y debug;
//   2. cada error de la API en un solo lugar: onError de createApiClient. Los 4xx son parte del flujo (un 422 es un
//      formulario, un 401 al arrancar es «sin sesión»): se mandan los 5xx y «sin red», con su request_id para buscarlo en
//      el registro del servidor;
//   3. lo que truena al pintar (una pantalla, una ruta): los avisos de React 19 en createRoot, con reactErrorHandler.
// Los nombres de Sentry salen de su documentación (docs.sentry.io, guía de React y captureConsoleIntegration).
import {createRoot} from 'react-dom/client';
import {ApiError, createApiClient} from '@stackcraftmx/calcita';

// en su proyecto: import * as Sentry from '@sentry/react';  (aquí solo su forma, para que el ejemplo compile sin instalarlo)
declare const Sentry: {
    init: (options: {dsn: string, integrations?: unknown[]}) => void,
    captureConsoleIntegration: (options?: {levels?: string[]}) => unknown,
    captureException: (error: unknown, context?: {tags?: Record<string, string>, extra?: Record<string, unknown>}) => void,
    reactErrorHandler: () => (error: unknown, errorInfo: unknown) => void,
};

// 1. Sentry al arrancar, con lo que el registro anota como error
Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.captureConsoleIntegration({levels: ['error']})],
});

// 2. cada error de la API en un solo lugar: los que no son parte del flujo
const SERVER_ERROR_STATUS = 500;
export const apiClient = createApiClient({
    baseUrl: '/api',
    onError: (error: ApiError, {method, url}: {method: string, url: string}) => {
        if (error.isOffline || error.status >= SERVER_ERROR_STATUS) {
            Sentry.captureException(error, {tags: {status: String(error.status)}, extra: {method, url, requestId: error.requestId}});
        }
    },
});

// 3. lo que truena al pintar: React 19 avisa aquí, con o sin ErrorBoundary (RouteErrorScreen, ErrorPage)
export const startApp = (container: HTMLElement) => createRoot(container, {
    onUncaughtError: Sentry.reactErrorHandler(),
    onCaughtError: Sentry.reactErrorHandler(),
});
