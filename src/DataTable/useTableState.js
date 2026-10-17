// Filtros, orden y página de una tabla. Con prefijo, la URL es la fuente de verdad (nuqs).
//
// Dos modos con la misma forma de salida, para que la tabla no sepa cuál está usando:
//   con `prefix`  el estado vive en la URL: la pantalla se comparte por enlace, sobrevive a recargar y el botón
//                 Atrás del detalle regresa a la lista tal como estaba;
//   sin `prefix`  estado local, para tablas embebidas (un diálogo) donde reflejar filtros en la URL solo ensucia.
//
// El prefijo permite dos tablas en la misma pantalla sin pisarse (loads_year contra users_year). Las llaves que se
// ven en la barra de direcciones son <prefijo>_<campo>.
//
// Hooks y funciones puras, no renderizan: function (regla de la casa).
import {useMemo, useState} from 'react';
import {parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates} from 'nuqs';

export const FILTER_KINDS = Object.freeze({
    text: 'text',
    multiSelect: 'multiSelect',
});

// el orden viaja como columna:dirección, legible en la barra de direcciones
const SORT_SEPARATOR = ':';

const DEFAULT_PAGE_SIZE = 25;

/**
 * ¿El filtro está puesto? Un texto vacío o una lista vacía no cuentan.
 *
 * @param {string|undefined} kind uno de FILTER_KINDS
 * @param {unknown} value valor del filtro
 * @returns {boolean}
 */
export function isFilterActive(kind, value) {
    if (value === null || value === undefined) {
        return false;
    }
    if (kind === FILTER_KINDS.multiSelect) {
        return value.length > 0;
    }
    return value !== '';
}

/**
 * Parser de nuqs según el tipo de filtro.
 *
 * @param {string|undefined} kind uno de FILTER_KINDS
 * @param {unknown} defaultValue valor cuando la URL no trae el parámetro
 */
function parserFor(kind, defaultValue) {
    if (kind === FILTER_KINDS.multiSelect) {
        return parseAsArrayOf(parseAsString).withDefault(defaultValue);
    }
    return parseAsString.withDefault(defaultValue);
}

/**
 * "year:desc" → [{column: 'year', direction: 'desc'}].
 *
 * @param {string} sortValue valor de la URL
 * @returns {Array<{column: string, direction: 'asc'|'desc'}>}
 */
export function parseSortValue(sortValue) {
    if (!sortValue) {
        return [];
    }
    const [column, direction] = sortValue.split(SORT_SEPARATOR);
    return column ? [{column, direction: direction === 'asc' ? 'asc' : 'desc'}] : [];
}

/**
 * [{column: 'year', direction: 'desc'}] → "year:desc" ('' sin orden).
 *
 * @param {Array<{column: string, direction: 'asc'|'desc'}>} sortOrders
 * @returns {string}
 */
export function serializeSortOrders(sortOrders) {
    return sortOrders.length ? `${sortOrders[0].column}${SORT_SEPARATOR}${sortOrders[0].direction}` : '';
}

/**
 * Filtros con los que arranca una tabla cuando cambia el CONJUNTO que muestra (otro producto, otra pestaña).
 *
 * Por qué existe: los filtros, el orden y la página pertenecen al conjunto que se estaba viendo. Si al cambiar de
 * producto se conservan, la tabla nueva sale filtrada por un estado o un formato que la persona eligió para el otro
 * producto y parece que "no hay datos". Todo vuelve a su default salvo lo que el cambio fija (p. ej. el producto).
 *
 * @param {Record<string, unknown>} filterDefaults campo → valor sin filtro
 * @param {Record<string, unknown>} values lo que fija el cambio de conjunto ({product: 'SHOES'})
 * @returns {Record<string, unknown>} todos los filtros en su default más los valores fijados
 */
export function filtersForDatasetSwitch(filterDefaults, values) {
    return {...filterDefaults, ...values};
}

function useUrlTableState(prefix, filterDefaults, filterKinds, defaultPageSize) {
    const parsers = useMemo(() => Object.fromEntries([
        ...Object.entries(filterDefaults).map(([field, defaultValue]) => [field, parserFor(filterKinds[field], defaultValue)]),
        ['sort', parseAsString.withDefault('')],
        ['page', parseAsInteger.withDefault(0)],
        ['pageSize', parseAsInteger.withDefault(defaultPageSize)],
    ]), [filterDefaults, filterKinds, defaultPageSize]);

    const [urlState, setUrlState] = useQueryStates(parsers, {
        urlKeys: Object.fromEntries(Object.keys(parsers).map((key) => [key, `${prefix}_${key}`])),
        // replace: filtrar no llena el historial de entradas intermedias; el Atrás del detalle regresa a la lista
        history: 'replace',
        // lo que vale su default no se escribe en la URL
        clearOnDefault: true,
    });

    const filters = useMemo(
        () => Object.fromEntries(Object.keys(filterDefaults).map((field) => [field, urlState[field]])),
        [urlState, filterDefaults],
    );

    const sortOrders = useMemo(() => parseSortValue(urlState.sort), [urlState.sort]);

    return {
        filters,
        sortOrders,
        page: urlState.page,
        pageSize: urlState.pageSize,
        // IMPORTANTE: filtrar SIEMPRE regresa a la página 0; quedarse en la 3 de un resultado que ahora tiene una
        // sola página deja la tabla vacía y parece que el filtro no encontró nada
        setFilter: (field, value) => setUrlState({[field]: value, page: 0}),
        // varios en UNA escritura: en dos, la tabla consultaría una vez con la mitad del cambio
        setFilters: (values) => setUrlState({...values, page: 0}),
        clearFilter: (field) => setUrlState({[field]: filterDefaults[field], page: 0}),
        clearAll: () => setUrlState({...filterDefaults, page: 0}),
        setSort: (orders) => setUrlState({sort: serializeSortOrders(orders), page: 0}),
        // cambio de conjunto (otro producto): filtros, orden y página a su default en UNA escritura; el tamaño de
        // página se respeta porque es preferencia de quien mira, no del conjunto
        switchDataset: (values) => setUrlState({...filtersForDatasetSwitch(filterDefaults, values), sort: '', page: 0}),
        setPage: (page) => setUrlState({page}),
        setPageSize: (pageSize) => setUrlState({pageSize, page: 0}),
    };
}

function useLocalTableState(filterDefaults, defaultPageSize) {
    const [filters, setFilters] = useState(filterDefaults);
    const [sortOrders, setSortOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    return {
        filters,
        sortOrders,
        page,
        pageSize,
        setFilter: (field, value) => {
            setFilters((currentFilters) => ({...currentFilters, [field]: value}));
            setPage(0);
        },
        setFilters: (values) => {
            setFilters((currentFilters) => ({...currentFilters, ...values}));
            setPage(0);
        },
        clearFilter: (field) => {
            setFilters((currentFilters) => ({...currentFilters, [field]: filterDefaults[field]}));
            setPage(0);
        },
        clearAll: () => {
            setFilters(filterDefaults);
            setPage(0);
        },
        setSort: (orders) => {
            setSortOrders(orders);
            setPage(0);
        },
        switchDataset: (values) => {
            setFilters(filtersForDatasetSwitch(filterDefaults, values));
            setSortOrders([]);
            setPage(0);
        },
        setPage,
        setPageSize: (nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(0);
        },
    };
}

/**
 * Estado de una tabla de servidor.
 *
 * OJO: filterDefaults y filterKinds se pasan como constantes de módulo (fuera del componente). Un objeto nuevo en
 * cada render arma parsers nuevos en cada render.
 *
 * @param {object} options
 * @param {string} [options.prefix] con prefijo, en la URL; sin él, en memoria
 * @param {Record<string, unknown>} [options.filterDefaults] campo → valor sin filtro ('' o [])
 * @param {Record<string, string>} [options.filterKinds] campo → FILTER_KINDS
 * @param {number} [options.defaultPageSize]
 */
export function useTableState({prefix, filterDefaults = {}, filterKinds = {}, defaultPageSize = DEFAULT_PAGE_SIZE}) {
    // los dos hooks se llaman SIEMPRE (regla de los hooks); el que no aplica no se usa
    const urlTableState = useUrlTableState(prefix ?? 'table', filterDefaults, filterKinds, defaultPageSize);
    const localTableState = useLocalTableState(filterDefaults, defaultPageSize);
    return prefix ? urlTableState : localTableState;
}
