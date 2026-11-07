// Mover un renglón de lugar en una lista donde el orden es el dato (qué se hace primero, en qué orden pasa la ruta). Sin
// React ni MUI: lo usa SortableTable al soltar y con sus botones «Subir» y «Bajar», y la pantalla que quiera mover desde otra
// parte (un menú «Mandar al final»).
//
// Las posiciones van desde 0, como las del arreglo; lo que ve una persona («posición 3») es la de aquí más uno.
//
// Funciones puras, sin React: function (regla de la casa).

/**
 * La lista con un renglón movido a otro lugar. No toca la lista que recibe: regresa una nueva.
 *
 * Una posición fuera de la lista (o la misma) regresa una copia igual: nada que mover.
 *
 * @template T
 * @param {ReadonlyArray<T>} rows en su orden de hoy
 * @param {number} fromIndex dónde está el renglón (desde 0)
 * @param {number} toIndex dónde queda (desde 0, contado en la lista ya sin él, como lo da el arrastre)
 * @returns {T[]}
 */
export function moveRow(rows, fromIndex, toIndex) {
    const next = [...rows];
    const isInside = (index) => Number.isInteger(index) && index >= 0 && index < rows.length;
    // guard clause: posiciones que no existen o el mismo lugar
    if (!isInside(fromIndex) || !isInside(toIndex) || fromIndex === toIndex) {
        return next;
    }
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}
