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
import {statusColumnWidthOf} from '@/DataTable/columnWidths.js';
import StackedCell from '@/DataTable/StackedCell.jsx';
import {useTableFilter} from '@/DataTable/filterContext.js';
import {FILTER_KINDS, isFilterActive} from '@/DataTable/useTableState.js';
import {labelOf, lookup} from '@/dictionaries/dictionaries.js';
import ActionsMenu from '@/ui/actions/ActionsMenu.jsx';
import DictionaryText from '@/ui/labels/DictionaryText.jsx';
import StatusChip from '@/ui/labels/StatusChip.jsx';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/** El campo de las columnas de la casa que no son datos: para nombrarlas en fixedColumn ({fixedColumn: [ACTIONS_COLUMN_FIELD, …]}). */
export const DETAIL_COLUMN_FIELD = '__detail';
export const ACTIONS_COLUMN_FIELD = '__actions';
// el ancho de la columna del «⋯»: el botón de 34 px y su respiro
const ACTIONS_COLUMN_WIDTH = 56;
// la marca que deja una columna de datos apilados: con ella la tabla pone los renglones a su alto (ServerTable)
export const COLUMN_STACKED_KEY = 'calcitaStacked';

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
 * El globo del icono se cambia con los textos de la tabla (ServerTable texts={{detail: {tooltip: '…'}}}), no aquí.
 *
 * @param {{onOpen: (row: any) => void, ariaLabelOf?: (row: any) => string}} declaration ariaLabelOf ya traducido
 */
export function detailColumn({onOpen, ariaLabelOf, ...unknownOptions}) {
    // un nombre que no existe (label, tooltip) se perdía sin decir nada: se avisa mientras se programa
    warnUnknownProps('detailColumn', unknownOptions);
    return {
        field: DETAIL_COLUMN_FIELD,
        headerName: '',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width: 64,
        align: 'center',
        renderCell: ({row}) => <DetailCell row={row} onOpen={onOpen} ariaLabelOf={ariaLabelOf} />,
    };
}

/**
 * Columna de datos apilados: los que se leen de corrido en un solo lugar, uno debajo del otro, los que hagan falta (la
 * empresa, su RFC y su régimen; el contacto, su correo y su teléfono). El primero es el principal (en negritas) y los demás
 * van en gris. Cada dato va solo, si el encabezado ya dice qué son, o con su etiqueta arriba ({label, value}) si el
 * encabezado nombra al grupo. Con orden y filtro en el servidor como textColumn, por el campo de la columna. La tabla pone
 * los renglones a su alto sola.
 *
 *   stackedColumn({field: 'business_name', label: 'Empresa', entries: (row) => [row.business_name, row.rfc, row.regime]})
 *   stackedColumn({field: 'created_at', label: 'Fechas', entries: (row) => [
 *       {label: 'Alta', value: formatDate(row.created_at)},
 *       {label: 'Último cambio', value: formatDate(row.updated_at)},
 *   ]})
 *
 * @param {{field: string, label: string, entries: (row: any, value: any) => import('@/DataTable/StackedCell.jsx').StackedEntry[], sort?: boolean, filter?: boolean} & GridColumnProps} columnDeclaration
 *     entries: los datos de cada renglón en orden; `value` es el de la columna ya con su valueFormatter. Un dato vacío
 *     no se pinta (salvo el principal o uno con etiqueta: enseñan «—»)
 */
export function stackedColumn({field, label, entries, sort = true, filter = true, ...gridColumnProps}) {
    return {
        ...textColumn({field, label, sort, filter, ...gridColumnProps}),
        [COLUMN_STACKED_KEY]: true,
        renderCell: (params) => <StackedCell entries={entries(params.row, params.formattedValue ?? params.value)} />,
    };
}

/**
 * Columna de estatus desde un diccionario: el estatus con su color y su explicación (StatusChip), filtro con las facetas del
 * servidor (como facetColumn) y un ancho que alcanza para la etiqueta más larga del diccionario. Con `t` el ancho se mide
 * con las etiquetas en el idioma de la pantalla (sin él, 160 px o el `width` que se le dé).
 *
 *   statusColumn({field: 'status', label: 'Estado', dictionary: ORDER_STATUS, t})
 *
 * @param {{field: string, label: string, dictionary: Record<string, object>, t?: (key: string) => string, short?: boolean, variant?: 'dot'|'chip', sort?: boolean, filter?: boolean, facetKey?: string} & GridColumnProps} columnDeclaration
 *     filter false: sin filtro en el encabezado (cuando el servidor no da facetas de este campo)
 */
export function statusColumn({field, label, dictionary, t, short = false, variant = 'dot', sort = true, filter = true, facetKey, ...gridColumnProps}) {
    const labels = t ? Object.keys(dictionary).map((value) => labelOf(lookup(dictionary, value), t)) : [];
    const width = gridColumnProps.width ?? (labels.length > 0 ? statusColumnWidthOf([label, ...labels], {variant}) : 160);
    const renderOption = (value) => <DictionaryText dictionary={dictionary} value={value} />;
    const base = filter
        ? facetColumn({field, label, facetKey, renderOption, sort, ...gridColumnProps, width})
        : textColumn({field, label, sort, filter: false, ...gridColumnProps, width});
    return {
        ...base,
        renderCell: ({row}) => <StatusChip dictionary={dictionary} value={row[field]} short={short} variant={variant} />,
    };
}

/**
 * Columna con el menú «⋯» de cada renglón (ActionsMenu): las acciones van en su columna con un ícono, no con clic en toda
 * la fila. Va de un ancho fijo, así se puede dejar pegada al deslizar: fixedColumn={[ACTIONS_COLUMN_FIELD, 'company']}.
 *
 *   actionsColumn({label: 'Acciones del cliente', actionsOf: (row) => [{key: 'open', label: 'Abrir', to: `/clientes/${row.id}`}]})
 *
 * @param {object} declaration
 * @param {string} declaration.label el nombre del botón (lector de pantalla y su globo), ya traducido
 * @param {(row: any) => Array<object>} declaration.actionsOf las acciones de ese renglón, con la forma de ActionsMenu
 * @param {(row: any) => string} [declaration.labelOf] el nombre del botón por renglón («Acciones de Acme»)
 * @param {number} [declaration.width] por omisión 56
 */
export function actionsColumn({label, actionsOf, labelOf: labelOfRow, width = ACTIONS_COLUMN_WIDTH, ...unknownOptions}) {
    warnUnknownProps('actionsColumn', unknownOptions);
    return {
        field: ACTIONS_COLUMN_FIELD,
        headerName: '',
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        width,
        align: 'center',
        renderCell: ({row}) => <ActionsMenu label={labelOfRow?.(row) ?? label} actions={actionsOf(row)} />,
    };
}
