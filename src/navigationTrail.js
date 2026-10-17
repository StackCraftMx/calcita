// Cómo se llama cada página para el botón «Regresar» de la página que sigue.
//
// Sin esto, el botón dice un texto fijo («Regresar a la lista») aunque regrese a otra página. BackButton regresa con
// navigate(-1), a la entrada anterior del historial de esta pestaña; para que su TEXTO diga a dónde va, cada página
// anota aquí su nombre de regreso («Regresar al detalle del pedido 15») junto a su posición en el historial
// (history.state.idx que pone react-router), y BackButton lee el de la posición anterior. Sin historial (enlace pegado, pestaña nueva, recarga después
// de iniciar sesión) no hay nada que leer y BackButton usa el texto de siempre.
//
// OJO: una posición se reusa. Si el usuario regresa y entra a otra página, la nueva ocupa la misma posición. Por eso
// useNavigationTrail (montado una sola vez en el layout de la aplicación) borra el nombre de la posición en cuanto cambia la página, ANTES de
// que la página nueva anote el suyo: el borrado va en un efecto de layout y la anotación en un efecto normal, y React
// corre todos los de layout antes que los normales. Una página que no anota su nombre deja su posición vacía, y el
// BackButton de la siguiente usa el texto que le pasen.
//
// Se guarda la llave del texto con sus valores y no el texto: así un cambio de idioma lo traduce. sessionStorage por lo
// mismo que lastListUrl.js: es de esta pestaña y se borra al cerrarla.
//
// Funciones puras y hooks, no renderizan: function (regla de la casa).
import {useEffect, useLayoutEffect, useRef} from 'react';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';

const STORAGE_KEY = 'calcita:navigationTrail';

/**
 * El almacenamiento de esta pestaña; null si el navegador lo bloquea o si no hay ventana (pruebas).
 *
 * @returns {Storage|null}
 */
function tabStorage() {
    try {
        return typeof window === 'undefined' ? null : (window.sessionStorage ?? null);
    } catch {
        return null;
    }
}

/**
 * Posición de la página actual en el historial de esta pestaña: 0 es la primera página de la app.
 *
 * @returns {number}
 */
export function currentHistoryIndex() {
    if (typeof window === 'undefined') {
        return 0;
    }
    return window.history.state?.idx ?? 0;
}

/**
 * El camino guardado; uno roto o ilegible cuenta como vacío (el botón vuelve a su texto de siempre).
 *
 * @param {Storage|null} storage
 * @returns {Record<string, {labelKey: string, params: object}>}
 */
function readTrail(storage) {
    try {
        const storedTrail = storage?.getItem(STORAGE_KEY);
        const trail = storedTrail ? JSON.parse(storedTrail) : {};
        return trail !== null && typeof trail === 'object' && !Array.isArray(trail) ? trail : {};
    } catch {
        return {};
    }
}

/**
 * @param {Storage|null} storage
 * @param {Record<string, {labelKey: string, params: object}>} trail
 */
function writeTrail(storage, trail) {
    try {
        storage?.setItem(STORAGE_KEY, JSON.stringify(trail));
    } catch {
        // almacenamiento lleno o bloqueado: el botón vuelve a su texto de siempre
    }
}

/**
 * El camino sin las posiciones posteriores a la que se toca: al entrar a una página en esa posición, el navegador ya
 * descartó las que seguían (y si el usuario avanza con el botón del navegador, esas páginas vuelven a anotar su nombre).
 *
 * @param {Record<string, {labelKey: string, params: object}>} trail
 * @param {number} index
 * @returns {Record<string, {labelKey: string, params: object}>}
 */
function trailUpTo(trail, index) {
    return Object.fromEntries(Object.entries(trail).filter(([position]) => Number(position) <= index));
}

/**
 * Anota el nombre de regreso de la página que está en esa posición del historial.
 *
 * @param {number} index posición en el historial (currentHistoryIndex)
 * @param {{labelKey: string, params?: object}} pageName llave de i18n con su espacio, p. ej. 'upload-control:detail.backToList'
 * @param {Storage|null} [storage] el de la pestaña; las pruebas pasan uno de mentiras
 */
export function rememberPageName(index, pageName, storage = tabStorage()) {
    const trail = trailUpTo(readTrail(storage), index);
    trail[index] = {labelKey: pageName.labelKey, params: pageName.params ?? {}};
    writeTrail(storage, trail);
}

/**
 * Borra el nombre de esa posición (y los de las posteriores): una página nueva la ocupa.
 *
 * @param {number} index
 * @param {Storage|null} [storage]
 */
export function forgetPageName(index, storage = tabStorage()) {
    const trail = trailUpTo(readTrail(storage), index);
    delete trail[index];
    writeTrail(storage, trail);
}

/**
 * El nombre de regreso anotado en esa posición; null si la página no anotó ninguno.
 *
 * @param {number} index
 * @param {Storage|null} [storage]
 * @returns {{labelKey: string, params: object}|null}
 */
export function pageNameAt(index, storage = tabStorage()) {
    const pageName = readTrail(storage)[index];
    return pageName && typeof pageName.labelKey === 'string' ? pageName : null;
}

/**
 * Se monta UNA vez en el layout de la aplicación: cuando cambia la página (otra posición u otra ruta), borra el nombre que tenía esa posición
 * antes de que la página nueva anote el suyo. Cambiar solo los parámetros de la URL en la misma posición (una pestaña,
 * un filtro) no cuenta como otra página.
 */
export function useNavigationTrail() {
    const {useLocation} = useToolkitNavigation();
    const {pathname} = useLocation();
    const shownPage = useRef(null);

    useLayoutEffect(() => {
        const index = currentHistoryIndex();
        if (shownPage.current?.index === index && shownPage.current?.pathname === pathname) {
            return;
        }
        forgetPageName(index);
        shownPage.current = {index, pathname};
    });
}

/**
 * Se monta en una página: anota cómo se llama para el botón «Regresar» de la página que sigue. Mientras sus datos no
 * llegan (labelKey null) no anota nada.
 *
 * @param {string|null} labelKey llave de i18n con su espacio, p. ej. 'upload-control:detail.backToList'
 * @param {object} [params] valores de la llave, ya listos para pintarse
 */
export function usePageName(labelKey, params) {
    const {useLocation} = useToolkitNavigation();
    const {key} = useLocation();
    const paramsText = JSON.stringify(params ?? {});

    useEffect(() => {
        if (!labelKey) {
            return;
        }
        rememberPageName(currentHistoryIndex(), {labelKey, params: JSON.parse(paramsText)});
    }, [labelKey, paramsText, key]);
}
