// Armadores de columna para ServerTable: la definición del DataGrid + su encabezado con orden y filtro.
//
// El filtro vive en el ENCABEZADO de su columna porque ahí está el dato. Aquí solo se COMPONE: el encabezado, el
// globo y cada tipo de filtro viven en ColumnFilters/, uno por archivo.
//
// OJO: sortable y filterable del DataGrid van en false siempre. El orden y el filtro los pide la tabla al SERVIDOR;
// los nativos del DataGrid ordenarían y filtrarían solo la página que ya llegó.
//
// Armadores genéricos: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import {MultiSelectColumnFilter, SortableFilterHeader, TextColumnFilter} from '@/DataTable/ColumnFilters';
import {useTableFilter} from '@/DataTable/filterContext.js';
import {FILTER_KINDS, isFilterActive} from '@/DataTable/useTableState.js';

/** Cuántos valores tiene puestos esta columna (lo que muestra el badge). */
function activeCountOf(kind, value) {
    if (!isFilterActive(kind, value)) {
        return 0;
    }
    return kind === FILTER_KINDS.multiSelect ? value.length : 1;
}

/** Lo que todo encabezado necesita del contexto de la tabla. */
function useColumnHeader(field, kind) {
    const {filters, setFilter, clearFilter, sortOrders, toggleSort, clearSort, facets} = useTableFilter();

    return {
        value: filters[field],
        setValue: (value) => setFilter(field, value),
        onClear: () => clearFilter(field),
        sortEntry: sortOrders.find((sortOrder) => sortOrder.column === field),
        onSort: () => toggleSort(field),
        onClearSort: clearSort,
        activeCount: activeCountOf(kind, filters[field]),
        facets,
    };
}

function TextHeader({field, label, sort, filter}) {
    const header = useColumnHeader(field, FILTER_KINDS.text);

    return (
        <SortableFilterHeader label={label} sortable={sort} filterable={filter} sortEntry={header.sortEntry}
                              onSort={header.onSort} onClearSort={header.onClearSort} activeCount={header.activeCount}
                              onClear={header.onClear}>
            <TextColumnFilter value={header.value ?? ''} onChange={header.setValue} />
        </SortableFilterHeader>
    );
}

function FacetHeader({field, label, facetKey, renderOption, sort}) {
    const header = useColumnHeader(field, FILTER_KINDS.multiSelect);

    return (
        <SortableFilterHeader label={label} sortable={sort} sortEntry={header.sortEntry} onSort={header.onSort}
                              onClearSort={header.onClearSort} activeCount={header.activeCount} onClear={header.onClear}>
            <MultiSelectColumnFilter value={header.value ?? []} onChange={header.setValue}
                                     options={header.facets[facetKey] ?? []} renderOption={renderOption} />
        </SortableFilterHeader>
    );
}

/**
 * Las props de columna del DataGrid que más se usan, con su tipo, y cualquier otra suya (Record). OJO: tipo propio y no
 * GridColDef del DataGrid: apuntar a sus tipos hace que un proyecto estricto (skipLibCheck: false) revise los internos del
 * DataGrid, que no compilan con TypeScript 7.
 *
 * @typedef {{width?: number, minWidth?: number, maxWidth?: number, flex?: number, align?: 'left'|'center'|'right', headerAlign?: 'left'|'center'|'right', valueFormatter?: (value: any, row: any) => string, valueGetter?: (value: any, row: any) => any, renderCell?: (params: any) => import('react').ReactNode} & Record<string, any>} GridColumnProps
 */

/**
 * Columna de texto con orden y filtro "contiene" en el servidor.
 *
 * @param {{field: string, label: string, sort?: boolean, filter?: boolean} & GridColumnProps} columnDeclaration
 *     label ya traducido; lo demás son props de columna del DataGrid (width, flex, valueFormatter, renderCell…)
 */
export function textColumn({field, label, sort = true, filter = true, ...gridColumnProps}) {
    return {
        field,
        headerName: label,
        sortable: false,
        filterable: false,
        ...gridColumnProps,
        renderHeader: () => <TextHeader field={field} label={label} sort={sort} filter={filter} />,
    };
}

/**
 * Columna con filtro de opciones alimentado por las FACETAS del servidor.
 *
 * @param {{field: string, label: string, facetKey?: string, renderOption?: (value: string) => import('react').ReactNode, sort?: boolean} & GridColumnProps} columnDeclaration
 */
export function facetColumn({field, label, facetKey, renderOption, sort = true, ...gridColumnProps}) {
    return {
        field,
        headerName: label,
        sortable: false,
        filterable: false,
        ...gridColumnProps,
        renderHeader: () => (
            <FacetHeader field={field} label={label} facetKey={facetKey ?? field} renderOption={renderOption} sort={sort} />
        ),
    };
}

function DetailCell({row, onOpen, ariaLabelOf}) {
    const {t} = useToolkitTranslation('table');
    const ariaLabel = ariaLabelOf?.(row) ?? t('detail.ariaLabel');

    return (
        <Tooltip title={t('detail.tooltip')}>
            <IconButton size="small" aria-label={ariaLabel} onClick={() => onOpen(row)}>
                <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
}

/**
 * Columna de acción al final de la fila: un icono que abre el detalle (la ruta propia del renglón). Un icono y no la
 * fila entera a propósito: la fila como botón se dispara al seleccionar texto y no se ve que se puede abrir.
 *
 * @param {{onOpen: (row: any) => void, ariaLabelOf?: (row: any) => string}} declaration ariaLabelOf ya traducido
 */
export function detailColumn({onOpen, ariaLabelOf}) {
    return {
        field: '__detail',
        headerName: '',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 64,
        align: 'center',
        renderCell: ({row}) => <DetailCell row={row} onOpen={onOpen} ariaLabelOf={ariaLabelOf} />,
    };
}
