// Cómo se ve la lista de la tabla: en tabla o en tarjetas (ServerTable con renderCard). Con `prefix` vive en la dirección
// (?orders_view=cards: se comparte la liga y sobrevive a recargar) y cambiarla REEMPLAZA la entrada del historial: es la misma
// lista vista de otra forma, «atrás» sale de ella. Sin prefijo, en memoria. Con `view` la decide la pantalla.
//
// Hook genérico: function (regla de la casa).
import {useState} from 'react';
import {parseAsStringLiteral, useQueryState} from 'nuqs';

/** Las dos vistas de la lista. */
export const TABLE_VIEW = Object.freeze({table: 'table', cards: 'cards'});
const VIEWS = Object.freeze(Object.values(TABLE_VIEW));

/**
 * @param {object} options
 * @param {string} [options.prefix] el de la tabla: con él, la vista va en la dirección
 * @param {'table'|'cards'} [options.view] la vista que decide la pantalla (controlada)
 * @param {'table'|'cards'} [options.defaultView] por omisión 'table'
 * @param {(view: 'table'|'cards') => void} [options.onViewChange]
 * @returns {{view: 'table'|'cards', setView: (view: 'table'|'cards') => void}}
 */
export function useTableView({prefix, view, defaultView = TABLE_VIEW.table, onViewChange}) {
    // OJO: los dos se piden siempre (un hook no puede ir dentro de un if); se usa el que toca
    const [urlView, setUrlView] = useQueryState(`${prefix ?? 'table'}_view`,
        parseAsStringLiteral(VIEWS).withDefault(defaultView).withOptions({history: 'replace'}));
    const [localView, setLocalView] = useState(defaultView);
    const currentView = view ?? (prefix ? urlView : localView);

    const setView = (nextView) => {
        if (view === undefined) {
            if (prefix) {
                setUrlView(nextView === defaultView ? null : nextView);
            } else {
                setLocalView(nextView);
            }
        }
        onViewChange?.(nextView);
    };
    return {view: currentView, setView};
}
