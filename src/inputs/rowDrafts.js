// Lo capturado y todavía sin guardar de los renglones de una tabla del servidor, por renglón (useEditableServerRows de
// /forms y de /react-hook-form). Vive fuera de la tabla porque la tabla desmonta sus renglones al cambiar de página, de
// filtro o de orden: así lo capturado regresa al volver a esa página y «Guardar todos» lo encuentra aunque no se vea.
//
// Qué pasa con lo capturado al cambiar de página lo escoge quien programa (UNSAVED_ROWS):
//   - keep (por omisión): se recuerda, y la barra dice cuántos renglones tienen cambios, con «Guardar todos» y «Descartar»;
//   - confirm: antes de cambiar de página, filtro u orden se pregunta «¿Descartar los cambios sin guardar?».
//
// Funciones puras, no renderizan: function (regla de la casa). Pruebas en rowDrafts.test.js.

/** Qué pasa con lo capturado y sin guardar al cambiar de página, filtro u orden: se recuerda (keep) o se pregunta (confirm). */
export const UNSAVED_ROWS = Object.freeze({keep: 'keep', confirm: 'confirm'});

/**
 * Un almacén de lo capturado por renglón: {llave del renglón: {values, row}} (los valores de ahora y el renglón como lo
 * mandó el servidor). Avisa a quien escucha cada vez que cambia (para useSyncExternalStore).
 *
 * @returns {{
 *   get: (rowId: string|number) => {values: object, row: object}|null,
 *   set: (rowId: string|number, draft: {values: object, row: object}) => void,
 *   remove: (rowId: string|number) => void,
 *   clear: () => void,
 *   entries: () => Array<[string|number, {values: object, row: object}]>,
 *   size: () => number,
 *   subscribe: (listener: () => void) => () => void,
 * }}
 */
export function createRowDraftsStore() {
    let drafts = new Map();
    const listeners = new Set();
    const notify = () => listeners.forEach((listener) => listener());
    return {
        get: (rowId) => drafts.get(rowId) ?? null,
        set: (rowId, draft) => {
            drafts = new Map(drafts).set(rowId, draft);
            notify();
        },
        remove: (rowId) => {
            if (!drafts.has(rowId)) {
                return;
            }
            const next = new Map(drafts);
            next.delete(rowId);
            drafts = next;
            notify();
        },
        clear: () => {
            if (drafts.size === 0) {
                return;
            }
            drafts = new Map();
            notify();
        },
        entries: () => [...drafts.entries()],
        size: () => drafts.size,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
