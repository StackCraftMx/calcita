// Qué hacer cuando la app revisa qué versión del front está publicada (usePublishedBuildWatch):
//   - la misma que corre: nada;
//   - otra, y la app estuvo en segundo plano un buen rato (la abrió de nuevo desde el inicio del teléfono): recargar sola,
//     como una app nativa que se actualizó mientras no se usaba;
//   - otra, pero la persona solo salió un momento (a copiar un código del SMS) o la está usando: el aviso «Hay una versión
//     nueva · Actualizar» (NewBuildNotice). Recargar ahí le borraría lo que llevaba escrito.
//
// Puras, sin React ni el navegador: se prueban solas.
import {isAnotherBuild} from '@/observability/publishedBuild.js';

/** Lo que toca hacer al ver la versión publicada. */
export const BUILD_WATCH_ACTION = Object.freeze({none: 'none', notice: 'notice', reload: 'reload'});

/**
 * @param {object} watch
 * @param {string|null|undefined} watch.runningBuildId la versión de esta pestaña (buildId de ToolkitProvider)
 * @param {string|null|undefined} watch.publishedBuildId la que está publicada
 * @param {number} [watch.hiddenMilliseconds] cuánto estuvo la app en segundo plano antes de esta revisión (0: no estuvo)
 * @param {number|null} [watch.reloadAfterHiddenMilliseconds] desde cuánto tiempo fuera se recarga sola; null: nunca
 *     (solo el aviso)
 * @returns {string} un valor de BUILD_WATCH_ACTION
 */
export function buildWatchActionOf({runningBuildId, publishedBuildId, hiddenMilliseconds = 0, reloadAfterHiddenMilliseconds = null}) {
    if (!isAnotherBuild(runningBuildId, publishedBuildId)) {
        return BUILD_WATCH_ACTION.none;
    }
    const wasAwayLongEnough = reloadAfterHiddenMilliseconds !== null && hiddenMilliseconds >= reloadAfterHiddenMilliseconds;
    return wasAwayLongEnough ? BUILD_WATCH_ACTION.reload : BUILD_WATCH_ACTION.notice;
}

/**
 * La versión publicada que viene en el archivo de versión ({"buildId": "…"}); null si el archivo no la trae.
 *
 * @param {unknown} versionFile lo que se leyó del archivo (JSON ya convertido)
 * @returns {string|null}
 */
export function publishedBuildIdOf(versionFile) {
    const buildId = versionFile && typeof versionFile === 'object' ? versionFile.buildId : null;
    return typeof buildId === 'string' && buildId !== '' ? buildId : null;
}
