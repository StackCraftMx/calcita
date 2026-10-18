// Que la app se entere sola de que se publicó otra versión del front, sin depender del API. Hace falta sobre todo con la
// app anclada al inicio del iPhone: al abrirla, el iPhone NO vuelve a pedir la página, retoma la que tenía en memoria (aunque
// haya pasado un día), así que la persona se quedaba con la versión vieja hasta cerrarla a la fuerza.
//
// Cómo: al construir, el proyecto deja un archivo con su versión ({"buildId": "…"}, por omisión /version.json) y la misma
// versión en ToolkitProvider (buildId). Esta app vuelve a leer el archivo:
//   - cada vez que regresa del segundo plano (justo cuando el iPhone la despierta), y
//   - cada tanto mientras se usa (checkEveryMinutes).
// Si ya hay otra (buildWatchActionOf): si estuvo fuera al menos reloadAfterHiddenMinutes, se recarga sola; si no, sale el
// aviso «Hay una versión nueva · Actualizar» (NewBuildNotice, que el marco ya pinta) para no borrar lo que llevaba escrito.
//
// Se monta UNA vez, en la raíz de la app:
//   usePublishedBuildWatch({url: import.meta.env.PROD ? '/version.json' : null});
// Sin url no hace nada (en desarrollo no hay versión que comparar).
//
// OJO: el archivo se pide con cache 'no-store' y el servidor no debe guardarlo (en el nginx de los ejemplos, «location /»
// ya va con no-cache). Sin red (el teléfono en el metro) no pasa nada: se vuelve a intentar en la siguiente revisión.
//
// Gancho genérico del paquete: function (regla de la casa).
import {useEffect} from 'react';

import {BUILD_WATCH_ACTION, buildWatchActionOf, publishedBuildIdOf} from '@/observability/buildWatch.js';
import {createLogger} from '@/observability/logger.js';
import {reportPublishedBuild} from '@/observability/publishedBuild.js';
import {toolkitSettings} from '@/toolkit/toolkitSettings.js';

const log = createLogger('build-watch');
const MILLISECONDS_PER_MINUTE = 60 * 1000;
// por omisión: revisar cada 5 minutos mientras se usa, y recargar sola si estuvo fuera 15 minutos o más
const DEFAULT_CHECK_EVERY_MINUTES = 5;
const DEFAULT_RELOAD_AFTER_HIDDEN_MINUTES = 15;

/** Lo que hace si el proyecto no dice otra cosa: recargar la página, que trae la versión nueva. */
function reloadPage() {
    window.location.reload();
}

/**
 * @param {object} [options]
 * @param {string|null} [options.url] dónde está el archivo de versión ({"buildId": "…"}); null: no vigila
 * @param {number} [options.checkEveryMinutes] cada cuánto revisa mientras se usa; por omisión 5
 * @param {number|null} [options.reloadAfterHiddenMinutes] desde cuántos minutos fuera se recarga sola al volver; por
 *     omisión 15. null: nunca se recarga sola, siempre el aviso
 * @param {() => void} [options.onReload] cómo recargar (p. ej. guardar un borrador antes). OJO: con useCallback; una
 *     función nueva en cada pintada volvería a armar la vigilancia
 * @returns {void}
 */
export function usePublishedBuildWatch({
    url = null, checkEveryMinutes = DEFAULT_CHECK_EVERY_MINUTES, reloadAfterHiddenMinutes = DEFAULT_RELOAD_AFTER_HIDDEN_MINUTES, onReload = reloadPage,
} = {}) {
    useEffect(() => {
        if (!url || typeof document === 'undefined') {
            return undefined;
        }
        let hiddenSince = null;
        let isChecking = false;

        const check = async (hiddenMilliseconds = 0) => {
            // una revisión a la vez: al volver del segundo plano pueden llegar dos avisos del navegador juntos
            if (isChecking) {
                return;
            }
            isChecking = true;
            try {
                const response = await fetch(url, {cache: 'no-store', headers: {Accept: 'application/json'}});
                const publishedBuildId = response.ok ? publishedBuildIdOf(await response.json()) : null;
                const action = buildWatchActionOf({
                    runningBuildId: toolkitSettings().buildId,
                    publishedBuildId,
                    hiddenMilliseconds,
                    reloadAfterHiddenMilliseconds: reloadAfterHiddenMinutes === null ? null : reloadAfterHiddenMinutes * MILLISECONDS_PER_MINUTE,
                });
                if (action === BUILD_WATCH_ACTION.reload) {
                    onReload();
                } else if (action === BUILD_WATCH_ACTION.notice) {
                    reportPublishedBuild(publishedBuildId);
                }
            } catch (error) {
                // sin red o con un archivo que no es JSON: no es algo que la persona pueda arreglar; queda en el registro
                log.info('No se pudo revisar la versión publicada', {url, reason: error.message});
            } finally {
                isChecking = false;
            }
        };

        // al irse a segundo plano se anota la hora; al volver se revisa con cuánto tiempo estuvo fuera
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                hiddenSince = Date.now();
                return;
            }
            const hiddenMilliseconds = hiddenSince === null ? 0 : Date.now() - hiddenSince;
            hiddenSince = null;
            check(hiddenMilliseconds);
        };
        // mientras se usa (en segundo plano el teléfono detiene los relojes de la página de todos modos)
        const timer = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                check();
            }
        }, checkEveryMinutes * MILLISECONDS_PER_MINUTE);

        check();
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [url, checkEveryMinutes, reloadAfterHiddenMinutes, onReload]);
}
