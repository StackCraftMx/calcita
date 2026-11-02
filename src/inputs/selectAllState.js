// «Elegir todos» de una lista de varias opciones: si su casilla va marcada, a medias o vacía, y qué queda al picarla.
// Lo comparten la lista desplegable, el catálogo con buscador y el grupo de casillas.
//
// «Todos» son los candidatos: todas las opciones, o las que coinciden con lo buscado. Picarlo con todos ya elegidos los
// quita; si no, agrega los que faltan al final (lo que ya estaba elegido se queda en su orden).
//
// Puro (sin React): se prueba con node (selectAllState.test.js).
//
// Genérico del paquete: function (regla de la casa).

/**
 * @template T
 * @param {T[]} selectedValues lo elegido hoy
 * @param {T[]} candidateValues lo que abarca «todos» (sin las opciones apagadas)
 * @returns {{allChosen: boolean, someChosen: boolean, toggled: () => T[]}} someChosen: algunos sí y otros no (casilla a medias)
 */
export function selectAllStateOf(selectedValues, candidateValues) {
    const selected = new Set(selectedValues);
    const chosenCount = candidateValues.filter((value) => selected.has(value)).length;
    const allChosen = candidateValues.length > 0 && chosenCount === candidateValues.length;
    return {
        allChosen,
        someChosen: chosenCount > 0 && !allChosen,
        toggled: () => {
            if (allChosen) {
                const candidates = new Set(candidateValues);
                return selectedValues.filter((value) => !candidates.has(value));
            }
            return [...selectedValues, ...candidateValues.filter((value) => !selected.has(value))];
        },
    };
}
