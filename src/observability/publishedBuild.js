// «Hay una versión nueva»: saber cuándo se publicó una compilación del front distinta a la que corre en esta pestaña.
//
// Una pestaña que lleva horas abierta sigue corriendo el front con que se abrió. Dos datos lo resuelven, y los dos los
// pone el proyecto:
//   - la compilación de ESTA pestaña: la prop buildId de ToolkitProvider (de una variable de entorno al construir, o la
//     que escribe el servidor en la página al abrirla);
//   - la compilación PUBLICADA: el servidor la anuncia en cada respuesta del API (por ejemplo, en un header) y el cliente
//     HTTP del proyecto se la entrega aquí con reportPublishedBuild.
// Cuando llega una distinta a la de la pestaña, el aviso (NewBuildNotice) se prende y ya no se apaga: lo único que lo
// quita es recargar, que trae la compilación nueva.
//
// No hace peticiones propias: se entera con las respuestas que las pantallas ya piden.
//
//   axiosClient.interceptors.response.use((response) => {
//       reportPublishedBuild(response.headers['x-frontend-build']);
//       return response;
//   });
//
// Funciones puras y un hook genérico: function (regla de la casa).
import {useSyncExternalStore} from 'react';
import {toolkitSettings} from '@/toolkit/toolkitSettings.js';

// quién quiere enterarse cuando el aviso se prende (los componentes que usan useNewBuildPublished)
const listeners = new Set();
let newBuildPublished = false;

/**
 * Si el servidor publica una compilación distinta a la que corre en la pestaña.
 *
 * @param {string|null|undefined} runningBuildId compilación de esta pestaña; vacía en desarrollo
 * @param {string|null|undefined} publishedBuildId compilación que anuncia el servidor; vacía si la respuesta no la trae
 * @returns {boolean} false si falta cualquiera de los dos: sin los dos no hay nada que comparar
 */
export function isAnotherBuild(runningBuildId, publishedBuildId) {
    // guard clause: en desarrollo no hay compilación, y una respuesta sin el dato no dice nada
    if (!runningBuildId || !publishedBuildId) {
        return false;
    }
    return runningBuildId !== publishedBuildId;
}

/**
 * Recibe la compilación que anunció una respuesta del servidor y prende el aviso si ya no es la de la pestaña.
 *
 * @param {string|null|undefined} publishedBuildId la que anunció la respuesta
 * @param {string|null|undefined} [runningBuildId] la de esta pestaña; por omisión, el buildId de ToolkitProvider
 * @returns {void}
 */
export function reportPublishedBuild(publishedBuildId, runningBuildId = toolkitSettings().buildId) {
    // guard clause: el aviso ya está prendido, o la publicada sigue siendo la de la pestaña
    if (newBuildPublished || !isAnotherBuild(runningBuildId, publishedBuildId)) {
        return;
    }
    newBuildPublished = true;
    listeners.forEach((listener) => listener());
}

/**
 * Si ya se supo que hay una compilación nueva publicada.
 *
 * @returns {boolean}
 */
export function isNewBuildPublished() {
    return newBuildPublished;
}

/**
 * Avisa a quien se suscriba cuando el aviso se prende (contrato de useSyncExternalStore).
 *
 * @param {() => void} listener función que se llama al prenderse
 * @returns {() => void} función para dejar de escuchar
 */
export function subscribeToNewBuild(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/**
 * Pintando en el servidor (Next.js) no hay pestaña que comparar: sin aviso.
 *
 * @returns {boolean}
 */
function isNewBuildPublishedOnServer() {
    return false;
}

/**
 * Para un componente: si hay una compilación nueva publicada. El componente se vuelve a pintar cuando el aviso se prende.
 *
 * @returns {boolean}
 */
export function useNewBuildPublished() {
    return useSyncExternalStore(subscribeToNewBuild, isNewBuildPublished, isNewBuildPublishedOnServer);
}
