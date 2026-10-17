// Contexto que comparten los encabezados de columna con la tabla.
//
// Existe para que renderHeader de cada columna no reciba media docena de props: el encabezado pide lo que necesita
// (el filtro de SU campo, el orden y las facetas del servidor) y la tabla no se entera.
//
// Funciones puras, no renderizan: function (regla de la casa).
import {createContext, useContext} from 'react';

export const TableFilterContext = createContext(null);

/**
 * @returns {{filters: object, setFilter: Function, clearFilter: Function, sortOrders: Array, toggleSort: Function, clearSort: Function, facets: object}}
 */
export function useTableFilter() {
    const tableFilterValue = useContext(TableFilterContext);
    if (!tableFilterValue) {
        // mejor tronar aquí que pintar un encabezado muerto que no filtra y nadie entiende por qué
        throw new Error('Un encabezado de columna se montó fuera de <ServerTable>.');
    }
    return tableFilterValue;
}
