// Declaración compacta de los chips de filtros activos (FilterChips).
//
// Cada valor trae su chip y su ×: un filtro de varios valores no se resume en UN chip ("estado: 3") porque para quitar
// uno solo habría que abrir el filtro de la columna. Así se desarma un filtro en la práctica: de a uno.
//
//   text        → un chip; la × lo vacía.
//   multiSelect → un chip POR VALOR; la × quita ese valor y deja los demás.
//
// Las etiquetas llegan YA traducidas (quien declara usa t()); por eso se declara dentro del componente o con una
// función que recibe t.
//
// Función pura, no renderiza: function (regla de la casa).

/**
 * @param {object} declaration
 * @param {Array<{key: string, label: string, format?: (value: string) => string}>} [declaration.text]
 * @param {Array<{key: string, label: string, itemLabel?: (value: string) => string}>} [declaration.multiSelect]
 * @returns {Array<{key: string, isActive: (value: unknown) => boolean, chipsFor: Function}>}
 */
export function buildChipConfig({text = [], multiSelect = []} = {}) {
    return [
        // format: cómo se lee el valor en el chip (una fecha viaja como 2026-08-01 y el chip dice "1 ago 2026")
        ...text.map(({key, label, format = (value) => value}) => ({
            key,
            isActive: (value) => Boolean(value),
            chipsFor: (value, setFilter) => [{
                id: key,
                label: `${label}: ${format(value)}`,
                onDelete: () => setFilter(key, ''),
            }],
        })),
        ...multiSelect.map(({key, label, itemLabel = (value) => value}) => ({
            key,
            isActive: (value) => value?.length > 0,
            chipsFor: (value, setFilter) => value.map((selectedValue) => ({
                id: `${key}:${selectedValue}`,
                label: `${label}: ${itemLabel(selectedValue)}`,
                onDelete: () => setFilter(key, value.filter((currentValue) => currentValue !== selectedValue)),
            })),
        })),
    ];
}
