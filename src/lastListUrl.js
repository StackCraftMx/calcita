// La última URL de una lista (con sus filtros, orden, pestaña y página), para que el detalle sepa a dónde regresar.
//
// BackButton usa navigate(-1) cuando hay historial. Esto es el RESPALDO para cuando no lo hay: el detalle se abrió en
// una pestaña nueva, se recargó, o se llegó después de iniciar sesión. Se guarda al SALIR de la lista (desmontar).
//
// Por qué sessionStorage y no localStorage: es de esta pestaña y se borra al cerrarla. La URL de una lista no trae
// datos personales, pero no tiene por qué sobrevivir en una máquina compartida.
//
// Funciones puras y un hook, no renderizan: function (regla de la casa).
import {useEffect, useRef} from 'react';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';

import {safeInternalPath} from '@/navigation.js';

const STORAGE_KEY_PREFIX = 'calcita:lastListUrl:';

/**
 * Anota la URL de una lista.
 *
 * @param {string} listKey p. ej. 'upload-control'
 * @param {string} listUrl pathname + search
 */
export function rememberListUrl(listKey, listUrl) {
    const safeListUrl = safeInternalPath(listUrl);
    if (!safeListUrl) {
        return;
    }
    try {
        window.sessionStorage?.setItem(`${STORAGE_KEY_PREFIX}${listKey}`, safeListUrl);
    } catch {
        // almacenamiento bloqueado o ventana privada: sin respaldo, BackButton usa fallbackTo
    }
}

/**
 * La última URL anotada de una lista, ya validada como ruta interna; null si no hay.
 *
 * @param {string} listKey
 * @returns {string|null}
 */
export function recallListUrl(listKey) {
    try {
        return safeInternalPath(window.sessionStorage?.getItem(`${STORAGE_KEY_PREFIX}${listKey}`));
    } catch {
        return null;
    }
}

/**
 * Se monta en la página de la lista: al salir de ella guarda la URL con la que se estaba viendo.
 *
 * @param {string} listKey
 */
export function useRememberListUrl(listKey) {
    const {useLocation} = useToolkitNavigation();
    const {pathname, search} = useLocation();
    const currentListUrl = useRef(`${pathname}${search}`);
    currentListUrl.current = `${pathname}${search}`;

    useEffect(() => () => rememberListUrl(listKey, currentListUrl.current), [listKey]);
}
