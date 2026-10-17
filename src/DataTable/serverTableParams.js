// Traductor del estado de ServerTable a la query del backend (contrato ServerTable del API).
//
//   {filters, sortOrders, page, pageSize}  →  {page, page_size, sort, direction, <filtro>: valor}
//
// Lo que se decide aquí y no en cada pantalla:
//   - page: la tabla cuenta desde 0 (DataGrid) y el API desde 1;
//   - un filtro vacío ('' o []) NO viaja: el backend lo leería como "filtrar por vacío";
//   - un filtro múltiple viaja como arreglo; axios lo serializa como status[]=a&status[]=b, que es lo que valida Laravel.
//
// Pura: sin imports; se prueba con node --test (serverTableParams.test.js).

/**
 * @param {{filters?: object, sortOrders?: Array<{column: string, direction: 'asc'|'desc'}>, page: number, pageSize: number}} tableRequest
 * @param {{parameterNames?: Record<string, string>}} [options] campo de la tabla → nombre del parámetro en el API
 * @returns {Record<string, unknown>} params para getInfo
 */
export function toServerTableParams({filters = {}, sortOrders = [], page, pageSize}, {parameterNames = {}} = {}) {
    const params = {page: page + 1, page_size: pageSize};

    if (sortOrders.length > 0) {
        params.sort = sortOrders[0].column;
        params.direction = sortOrders[0].direction;
    }

    for (const [field, value] of Object.entries(filters)) {
        const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
        // guard clause: un filtro sin valor no se manda
        if (isEmpty) {
            continue;
        }
        params[parameterNames[field] ?? field] = value;
    }

    return params;
}
