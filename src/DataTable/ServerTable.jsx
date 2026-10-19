// La tabla: pagina, filtra y ordena EN EL SERVIDOR (contrato {filters, sortOrders, page, pageSize} → {rows, total, facets}).
//
// Cada cambio de filtro, orden o página es una consulta nueva contra el conjunto COMPLETO y el total que se muestra
// es el real. Traer todo y filtrar en el navegador mentiría en cuanto el conjunto no quepa en una página.
//
// Contrato de fetchPage:
//   fetchPage({filters, sortOrders, page, pageSize}, signal) → Promise<{rows, total, facets?, capped?}>
//   - rows: cada fila con su id del SERVIDOR (getRowId). Fabricarlo en el front colisiona y el DataGrid conserva
//     filas de la consulta anterior;
//   - facets: {campo: [{value, total}]} contadas SIN el filtro de ese campo (lo hace el servidor), para que la
//     selección múltiple siga siendo posible;
//   - capped: el total es "al menos esto".
//
// Elegir renglones (selectionActions): una casilla por renglón y las acciones de los elegidos (rowSelection.js dice cómo
// se conservan entre páginas y qué es «todos los que coinciden»; SelectionActions, dónde se ven sus acciones).
//
// Piezas: useTableState (URL con nuqs y prefijo) · tableMachine (XState: carga, error y respuestas rezagadas) ·
// columns.jsx (encabezados con orden y filtro) · FilterChips · QuickFilters · GoToPage · EmptyState.
//
// Con @mui/x-data-grid 8 (compatible con MUI 7).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaServerTable con defaultProps y
// styleOverrides de sus partes: toolbar, summary, customHeader, count, countRow, selectionNotice, error, card, grid,
// pagination.
//
// Genérico del paquete: function (regla de la casa).
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useMachine} from '@xstate/react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import {DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF, GRID_CHECKBOX_SELECTION_FIELD, GridPagination} from '@mui/x-data-grid';
import {enUS as dataGridEnglish, esES as dataGridSpanish} from '@mui/x-data-grid/locales';

import EmptyState from '@/DataTable/EmptyState.jsx';
import FilterChips from '@/DataTable/FilterChips.jsx';
import GoToPage from '@/DataTable/GoToPage.jsx';
import {TableFilterContext} from '@/DataTable/filterContext.js';
import {
    EMPTY_ROW_SELECTION, canSelectAllMatching, checkedIdsOf, rowSelectionOf, selectionAfterCheck,
} from '@/DataTable/rowSelection.js';
import {buildTableActors, tableMachine} from '@/DataTable/tableMachine.js';
import {useDebouncedFilter} from '@/DataTable/useDebouncedFilter.js';
import {FILTER_KINDS, isFilterActive, useTableState} from '@/DataTable/useTableState.js';
import BarSearch from '@/appShell/BarSearch.jsx';
import {PHONE_MEDIA_QUERY} from '@/appShell/shellSizes.js';
import SelectionActions, {SELECTION_PHONE_LAYOUT, selectionFloatsOnPhone} from '@/ui/actions/SelectionActions.jsx';
import ComponentTexts from '@/toolkit/ComponentTexts.jsx';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {materialBackgroundOf} from '@/theme/glassSurface.js';
import QuickFilters from '@/ui/filters/QuickFilters.jsx';
import Tag from '@/ui/labels/Tag.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaServerTable)
const THEME_NAME = 'CalcitaServerTable';
const TableToolbar = piecePart(THEME_NAME, 'Toolbar', Stack);
const TableSummary = piecePart(THEME_NAME, 'Summary', Box);
const TableCustomHeader = piecePart(THEME_NAME, 'CustomHeader', Box);
const TableCount = piecePart(THEME_NAME, 'Count', Stack);
const TableCountRow = piecePart(THEME_NAME, 'CountRow', Stack);
const TableSelectionNotice = piecePart(THEME_NAME, 'SelectionNotice', Alert);
const TableError = piecePart(THEME_NAME, 'Error', Alert);
const TableCard = piecePart(THEME_NAME, 'Card', Paper);
const TableGrid = piecePart(THEME_NAME, 'Grid', DataGrid);
const TablePagination = piecePart(THEME_NAME, 'Pagination', Stack);

// OJO: los textos del DataGrid van como PROP (localeText) y no solo en el tema: el grid resuelve sus defaults en
// inglés y le ganan a los defaultProps del tema
const DATA_GRID_TEXT_BY_LANGUAGE = {
    es: dataGridSpanish.components.MuiDataGrid.defaultProps.localeText,
    en: dataGridEnglish.components.MuiDataGrid.defaultProps.localeText,
};

/**
 * Nonce de la CSP de la página, si la aplicación usa CSP y lo pone en <meta property="csp-nonce">.
 *
 * IMPORTANTE: el DataGrid 8 inserta un <style> con sus variables CSS (bordes, fondos, espaciado). Sin el nonce la CSP lo
 * bloquea ("style-src-elem") y la tabla se pinta sin sus variables. OJO: el navegador esconde el valor del atributo
 * (getAttribute regresa ""); se lee con la propiedad .nonce, igual que el caché de emotion con nonce.
 *
 * @returns {string|undefined}
 */
function readCspNonce() {
    // pintando en el servidor (Next.js) no hay documento: ahí el nonce lo pone quien arma el HTML
    if (typeof document === 'undefined') {
        return undefined;
    }

    return document.querySelector('meta[property="csp-nonce"]')?.nonce || undefined;
}

// Densidad compacta en todas las tablas: el espaciado por omisión desperdicia renglones. Son los altos que pinta el DataGrid 8 con density="compact": la base de 52 px del renglón y de 56 px del
// encabezado por el factor 0.7, redondeados hacia abajo. El pie (paginación) no cambia con la densidad.
// OJO: si se cambia la densidad, estos números se vuelven a medir en Chrome; con ellos se calcula el alto del contenedor
// y un número viejo deja hueco blanco abajo o una barra de desplazamiento sin necesidad
const ROW_HEIGHT_PIXELS = 36;
const COLUMN_HEADER_HEIGHT_PIXELS = 39;
const FOOTER_HEIGHT_PIXELS = 52;
// líneas del borde del encabezado y del pie
const GRID_BORDER_PIXELS = 2;
// holgura de alto de la tabla: debajo del último renglón queda este hueco, así que va lo más chico que aguanta.
// OJO: con el alto exacto, el redondeo de subpíxeles hace que el DataGrid crea que hay scroll vertical, reserve el ancho de
// la barra y aparezca un scroll lateral de 5 px. Lo vigila e2e/tests/upload-control.spec.js (la tabla no se desliza de lado)
const HEIGHT_SLACK_PIXELS = 2;
const DATA_GRID_DENSITY = 'compact';
const STRIPED_ROW_CLASS = 'server-table-row--striped';
// dónde van los elegidos en el teléfono: la regla vive en SelectionActions; la tabla la vuelve a exportar por comodidad
export {SELECTION_PHONE_LAYOUT};


// a qué altura van la celda y el encabezado fijos: los mismos que usa el DataGrid de paga para sus columnas fijas. El
// encabezado va arriba de la raya que separa columnas (30); con menos, la raya de las otras columnas lo cruzaba al deslizar
const FIXED_CELL_Z_INDEX = 30;
const FIXED_HEADER_Z_INDEX = 40;
// ancho de la columna de casillas para elegir renglones (la del DataGrid)
const CHECKBOX_COLUMN_WIDTH_PIXELS = GRID_CHECKBOX_SELECTION_COL_DEF.width;

/**
 * Estilos que dejan pegada a la izquierda una columna al deslizar la tabla de lado (en el teléfono y en una ventana angosta),
 * igual que fixedSelectColumn de mui-datatables. Fijar columnas en MUI X es de DataGridPro (de paga); por dentro Pro usa
 * position sticky en la celda, y eso mismo se hace aquí, también con su banda del encabezado cuando la banda es solo suya
 * (p. ej. una banda PERIODO de una sola columna).
 *
 * OJO, trampas pagadas:
 *   - el DataGrid gratuito solo dibuja las columnas que se ven (virtualización) y al deslizar mucho a la derecha quitaba del
 *     DOM a la columna fija, que desaparecía. Un margen de columnas extra (columnBufferPx) no alcanzó: con columna fija la
 *     tabla va con disableVirtualization y dibuja todo, que en nuestras tablas son menos de quince columnas y una página;
 *   - la celda fija necesita fondo SÓLIDO o se ve lo que pasa por debajo. Toma el color de su renglón (inherit), pero hay
 *     renglones con color transparente (una banda de color, la cebra, el resaltado del mouse): ahí se asomaban las
 *     cifras de las otras columnas. Por eso el fondo va en dos capas: abajo el papel, sólido (backgroundImage, que se pinta
 *     encima del color propio de la celda), y encima el color del renglón en un ::before detrás del texto (zIndex -1 dentro
 *     de la celda). Se ve igual que el renglón y no transparenta.
 * El renglón lleva el fondo del papel con :where(), que no suma especificidad: así los renglones que la página pinta de otro
 * color le siguen ganando. Los colores salen de la paleta del tema (de sus variables CSS si el tema las usa) para que
 * cambien con el modo oscuro.
 *
 * Con el contenido de material del tema de vidrio (createToolkitTheme({glass: {surfaces: true}})) la tabla no lleva fondo
 * propio: los renglones van transparentes y la celda pegada lleva el mismo material esmerilado, que tapa lo que pasa por
 * debajo sin verse como una columna blanca (así se veía con el papel sólido).
 *
 * Con renglones que se eligen, la casilla también se queda pegada, antes que la columna fija: si no, al deslizar la fija
 * tapaba la casilla.
 *
 * @param {object} theme tema de MUI
 * @param {string} field campo de la columna que se queda fija
 * @param {{withCheckboxColumn?: boolean}} [options]
 * @returns {object} estilos para el sx del DataGrid
 */
function fixedColumnSxOf(theme, field, {withCheckboxColumn = false} = {}) {
    // un tema con variables CSS (cssVariables) las trae en theme.vars; el tema por omisión de MUI, solo en theme.palette
    const {palette} = theme.vars ?? theme;
    const paper = palette.background.paper;
    const divider = `1px solid ${palette.divider}`;
    // la banda del encabezado que lleva solo a esta columna: el DataGrid la marca con sus campos entre |- y -|
    const ownBandHeader = `.MuiDataGrid-columnHeader[data-fields="|-${field}-|"]`;
    const isMaterialContent = Boolean(theme.toolkit?.glass?.surfaces);
    // abajo la capa (el papel o el material) y encima el color del renglón (el ::before)
    const stickyBackground = {backgroundColor: 'inherit', ...(isMaterialContent ? materialBackgroundOf(theme, {thick: true}) : {backgroundImage: `linear-gradient(${paper}, ${paper})`})};
    const headerBackground = isMaterialContent ? materialBackgroundOf(theme, {thick: true}) : {backgroundColor: paper};
    const rowColorLayer = {content: '""', position: 'absolute', inset: 0, zIndex: -1, backgroundColor: 'inherit'};
    const fixedLeft = withCheckboxColumn ? CHECKBOX_COLUMN_WIDTH_PIXELS : 0;
    const checkboxCell = `.MuiDataGrid-cell[data-field="${GRID_CHECKBOX_SELECTION_FIELD}"]`;
    const checkboxHeader = `.MuiDataGrid-columnHeader[data-field="${GRID_CHECKBOX_SELECTION_FIELD}"]`;

    return {
        '& :where(.MuiDataGrid-row)': {backgroundColor: isMaterialContent ? 'transparent' : paper},
        [`& .MuiDataGrid-cell[data-field="${field}"]`]: {
            position: 'sticky', left: fixedLeft, zIndex: FIXED_CELL_Z_INDEX, borderRight: divider,
            ...stickyBackground,
            '&::before': rowColorLayer,
        },
        [`& :where(.MuiDataGrid-columnHeader[data-field="${field}"], ${ownBandHeader})`]: headerBackground,
        [`& .MuiDataGrid-columnHeader[data-field="${field}"], & ${ownBandHeader}`]: {
            position: 'sticky', left: fixedLeft, zIndex: FIXED_HEADER_Z_INDEX, borderRight: divider,
        },
        ...(withCheckboxColumn && {
            [`& ${checkboxCell}`]: {position: 'sticky', left: 0, zIndex: FIXED_CELL_Z_INDEX, ...stickyBackground, '&::before': rowColorLayer},
            [`& :where(${checkboxHeader})`]: headerBackground,
            [`& ${checkboxHeader}`]: {position: 'sticky', left: 0, zIndex: FIXED_HEADER_Z_INDEX},
        }),
    };
}
const COMPACT_DENSITY_FACTOR = 0.7;

/** Una tira de accesos rápidos sobre un campo de la tabla, alimentada por su faceta. */
function QuickFilterRow({quickFilter, facets, total, filters, isMultiple, setFilter, setFilters}) {
    const {t} = useToolkitTranslation('table');
    const facetOptions = facets[quickFilter.facetKey ?? quickFilter.field] ?? [];
    const orderedOptions = quickFilter.order
        ? quickFilter.order.map((optionValue) => facetOptions.find((option) => option.value === optionValue) ?? {value: optionValue, total: 0})
        : facetOptions;

    // en un filtro múltiple el chip activo es la opción cuando es la ÚNICA elegida: con varias puestas desde la columna
    // ningún chip miente estando encendido
    const currentValue = filters[quickFilter.field];
    // si otro control del mismo "qué" está puesto (un rango de fechas), ningún chip se enciende
    const isOverridden = quickFilter.isOverridden?.(filters) ?? false;
    let selectedValue = currentValue ?? '';
    if (isOverridden) {
        selectedValue = '__overridden__';
    } else if (isMultiple) {
        selectedValue = Array.isArray(currentValue) && currentValue.length === 1 ? currentValue[0] : '';
    }

    // el conteo de "Todas" es la suma de la faceta (el resultado SIN este filtro), no el de la página actual; cuando las
    // opciones se traslapan la suma mentiría: el total lo da el servidor en allCountKey o, si no lo da, no se pinta
    // conteo (hideAllCount) antes que pintar uno falso
    let allCount = facetOptions.reduce((sum, option) => sum + (option.total ?? 0), 0) || total;
    if (quickFilter.allCountKey && typeof facets[quickFilter.allCountKey] === 'number') {
        allCount = facets[quickFilter.allCountKey];
    } else if (quickFilter.hideAllCount) {
        allCount = undefined;
    }

    const handleChange = (nextValue) => {
        const pickedValue = isMultiple ? (nextValue ? [nextValue] : []) : nextValue;
        // elegir un chip limpia los controles que compiten con él
        if (quickFilter.clears) {
            setFilters({[quickFilter.field]: pickedValue, ...quickFilter.clears});
        } else {
            setFilter(quickFilter.field, pickedValue);
        }
    };

    return (
        <QuickFilters
            caption={quickFilter.caption}
            ariaLabel={quickFilter.caption}
            value={selectedValue}
            onChange={handleChange}
            extra={quickFilter.renderExtra?.({filters, setFilters})}
            options={[
                {value: '', label: quickFilter.allLabel ?? t('quickFilters.all'), count: allCount},
                ...orderedOptions.map((option) => ({
                    value: option.value,
                    label: quickFilter.renderLabel ? quickFilter.renderLabel(option.value) : option.value,
                    count: option.total,
                })),
            ]}
        />
    );
}

/** @typedef {import('@/DataTable/rowSelection.js').RowSelection} RowSelection */

/**
 * @param {object} props
 * @param {(params: {filters: Record<string, any>, sortOrders: Array<{column: string, direction: 'asc'|'desc'}>, page: number, pageSize: number}, signal: AbortSignal) => Promise<{rows: any[], total: number, facets?: Record<string, Array<{value: any, total: number}> | number>, capped?: boolean}>} props.fetchPage
 *     page cuenta desde 0; toServerTableParams lo convierte a la query del API
 * @param {string} props.queryKey cambia cuando cambia el CONJUNTO (no los filtros): dispara recarga
 * @param {boolean} [props.enabled] false mientras la sección está oculta: una tabla que nadie ve no consulta
 * @param {Array<object>} props.columns textColumn / facetColumn / detailColumn o columnas del DataGrid
 * @param {Record<string, string>} [props.filterKinds]
 * @param {Record<string, unknown>} [props.filterDefaults]
 * @param {Array<object>} [props.chipConfig] buildChipConfig
 * @param {Array<object>} [props.quickFilters] {field, facetKey, caption, allLabel, renderLabel, order, clears,
 *     isOverridden, renderExtra, allCountKey, hideAllCount}
 * @param {string|null} [props.searchField] filtro de texto que se saca a la barra; null quita la caja
 * @param {string} [props.searchPlaceholder]
 * @param {boolean} [props.searchInBar] la caja de búsqueda va arriba, en la barra de la app (BarActions): en escritorio,
 *     como el buscador de una ventana de macOS; en el teléfono con cápsulas flota arriba con las demás; sin cápsulas se
 *     queda aquí. Por omisión no
 * @param {boolean} [props.collapseSearchInBar] en la barra, sin usar se encoge a la lupa y se estira al picarla; por
 *     omisión sí (false: siempre abierta)
 * @param {string} [props.emptyLabel]
 * @param {(total: number) => string} [props.countLabel] "12 pedidos"; por defecto "12 registros"
 * @param {number[]} [props.pageSizeOptions]
 * @param {number} [props.defaultPageSize]
 * @param {(row: any) => string|number} [props.getRowId]
 * @param {string} [props.prefix] estado en la URL con este prefijo (nuqs); sin él, en memoria
 * @param {unknown} [props.refreshToken] cambia para volver a consultar la misma página (después de una acción)
 * @param {(summary: {total: number, capped: boolean}) => import('react').ReactNode} [props.footer]
 * @param {import('react').ReactNode} [props.toolbarExtra] a la derecha del conteo (p. ej. el selector de año)
 * @param {(summary: {countText: string, total: number, capped: boolean}) => import('react').ReactNode} [props.header] reemplaza
 *     el renglón del conteo: la página pinta título, conteo y controles en uno solo. countText ya viene traducido y con
 *     el tope
 * @param {import('react').ReactNode} [props.beforeQuickFilters] arriba de los accesos rápidos (p. ej. las pestañas de producto)
 * @param {Array<object>} [props.columnGroupingModel] bandas que agrupan columnas bajo un nombre, arriba de sus
 *     encabezados (columnGroupingModel del DataGrid). Con ellas el encabezado mide un renglón más
 * @param {(params: any) => string} [props.getRowClassName]
 * @param {(row: any) => boolean} [props.isRowVisible] cuáles renglones de la página se pintan; los demás se esconden
 *     SIN volver a consultar (p. ej. plegar un grupo de renglones). Sin ella se pintan todos. OJO: va con useCallback;
 *     una función nueva en cada pintada haría filtrar la página cada vez
 * @param {boolean} [props.striped] renglones alternos (cebra) con el color de hover del tema; al pasar el cursor se usa
 *     el de «seleccionado» para que el renglón bajo el cursor se siga distinguiendo
 * @param {(params: any) => number|'auto'|null} [props.getRowHeight]
 * @param {boolean} [props.hideFooterWhenAllRowsFit] esconde el pie (el paginador) mientras todo lo que hay cabe en la
 *     página; si un día no cabe, el pie vuelve solo. Para tablas que casi nunca pasan de una página
 * @param {boolean} [props.showGoToPage] «Ir a página N» junto al paginador; por omisión escondido (con las flechas basta en
 *     casi todas las tablas). Para listas de muchas páginas que se recorren por número
 * @param {object} [props.gridSx] estilos extra del DataGrid (clases de renglón)
 * @param {number} [props.maxGridHeight] alto máximo del contenedor; sin él la tabla crece con sus renglones (default)
 * @param {string} [props.ariaLabel] nombre de la tabla para lectores de pantalla
 * @param {string} [props.fixedColumn] campo de la columna que se queda pegada a la izquierda al deslizar de lado (como
 *     fixedSelectColumn de mui-datatables)
 * @param {Array<{key: string, label: string, icon?: import('react').ReactNode, color?: 'inherit'|'primary'|'secondary'|'error'|'info'|'success'|'warning', isDisabled?: (selection: RowSelection) => boolean, onClick: (selection: RowSelection, helpers: {clearSelection: () => void, refresh: () => void}) => unknown}>} [props.selectionActions]
 *     con ellas cada renglón lleva su casilla y, al elegir, sale la barra de los elegidos con estas acciones. label ya
 *     traducido; onClick recibe la selección (con isAllMatching mande `filters`, no `ids`) y cómo quitar la selección y volver
 *     a consultar después de actuar
 * @param {(row: any) => boolean} [props.isRowSelectable] cuáles renglones se pueden elegir (un pedido entregado no se cancela)
 * @param {boolean} [props.allowSelectAllMatching] la casilla de arriba elige todos los que coinciden (la acción recibe los
 *     filtros) y el aviso deja quedarse solo con la página; por omisión sí. false: la casilla elige la página y nunca se
 *     ofrece «todos»
 * @param {(selection: RowSelection) => void} [props.onSelectionChange] cada que cambia la selección; también enciende las
 *     casillas sin barra de acciones (la pantalla pinta las suyas)
 * @param {'top'|'split'} [props.selectionPhoneLayout] SELECTION_PHONE_LAYOUT: en el teléfono con vidrio o minimalista, todo
 *     arriba (por omisión) o el conteo arriba y las acciones abajo. Sin vidrio, en el renglón como en escritorio
 * @param {(request: {filters: Record<string, any>, sortOrders: Array<{column: string, direction: 'asc'|'desc'}>, page: number, pageSize: number}) => void} [props.onQueryChange]
 *     cada que cambia lo que pide la tabla (un filtro, el orden, la página), antes de consultar: para la lógica de negocio que
 *     depende de lo filtrado («si eligió Cancelados, enseñe el motivo»)
 * @param {(result: {rows: any[], total: number, facets: object, capped: boolean}) => void} [props.onLoaded] cada que llega una
 *     página del servidor
 * @param {(error: unknown) => void} [props.onLoadError] cuando la consulta falla (la tabla ya enseña su aviso con «Reintentar»)
 * @param {object} [props.gridProps] lo demás del DataGrid de MUI, sobre todo sus eventos (onRowClick, onRowDoubleClick,
 *     onCellKeyDown…). OJO: lo que la tabla controla (paginar, ordenar y filtrar en el servidor, el alto, la selección) no se
 *     reemplaza desde aquí: para eso están sus props
 * @param {object} [props.texts] los textos de la tabla que cambian, con la forma de `table` en los textos del paquete
 *     (src/locales/es.js), ya en el idioma de la pantalla: {selection: {clear: 'Deseleccionar'}, empty: {filtered: '…'}}.
 *     También les llegan a sus filtros de columna, sus chips y su barra de elegidos
 */
export default function ServerTable(props) {
    // lo que el proyecto puso en su tema (components.CalcitaServerTable.defaultProps) y encima lo que llega aquí
    const {
    fetchPage,
    queryKey,
    enabled = true,
    columns,
    filterKinds = {},
    filterDefaults = {},
    chipConfig = [],
    quickFilters = [],
    searchField = 'contains',
    searchPlaceholder,
    searchInBar = false,
    collapseSearchInBar = true,
    emptyLabel,
    countLabel,
    pageSizeOptions = [10, 25, 50, 100],
    defaultPageSize = 25,
    getRowId,
    prefix,
    refreshToken,
    footer,
    toolbarExtra,
    header,
    beforeQuickFilters,
    columnGroupingModel,
    getRowClassName,
    isRowVisible,
    hideFooterWhenAllRowsFit = false,
    showGoToPage = false,
    striped = false,
    getRowHeight,
    gridSx,
    maxGridHeight = null,
    ariaLabel,
    fixedColumn,
    selectionActions = [],
    isRowSelectable,
    allowSelectAllMatching = true,
    onSelectionChange,
    selectionPhoneLayout = SELECTION_PHONE_LAYOUT.top,
    onQueryChange,
    onLoaded,
    onLoadError,
    gridProps,
    texts,
} = usePieceProps(props, THEME_NAME);
    const {t, language} = useToolkitTranslation('table', texts);
    const {formatNumber} = useFormatters();
    const theme = useTheme();
    const tableState = useTableState({prefix, filterDefaults, filterKinds, defaultPageSize});
    const {filters, sortOrders, page, pageSize} = tableState;

    // la caja de búsqueda rebota: se escribe sin latencia y al servidor va una consulta cuando se deja de teclear
    const [searchDraft, setSearchDraft] = useDebouncedFilter(
        searchField ? filters[searchField] : '',
        (value) => searchField && tableState.setFilter(searchField, value),
    );

    // NOTA: fetchPage suele ser una función nueva en cada render; la máquina siempre llama a la más reciente
    const latestFetchPage = useRef(fetchPage);
    latestFetchPage.current = fetchPage;
    const latestEvents = useRef({onQueryChange, onLoaded, onLoadError});
    latestEvents.current = {onQueryChange, onLoaded, onLoadError};
    const [tableSnapshot, sendToTable] = useMachine(
        tableMachine.provide({actors: buildTableActors((params, signal) => latestFetchPage.current(params, signal))}),
    );
    const {rows, total, facets, capped, error} = tableSnapshot.context;
    // lo que se pinta: la página completa o, si la pantalla esconde renglones (un grupo plegado), solo los que deja ver.
    // Con memoria: un arreglo nuevo en cada pintada haría que el DataGrid volviera a procesar todos sus renglones
    const visibleRows = useMemo(() => (isRowVisible ? rows.filter(isRowVisible) : rows), [rows, isRowVisible]);
    const isLoading = tableSnapshot.matches('loading') || tableSnapshot.matches('idle');

    const requestParams = {filters, sortOrders, page, pageSize};
    const requestFingerprint = JSON.stringify({queryKey, enabled, refreshToken, ...requestParams});

    // IMPORTANTE: UN solo efecto dispara la consulta. Varios useEffect pidiendo lo mismo es como nacen las consultas
    // duplicadas
    useEffect(() => {
        if (!queryKey || !enabled) {
            return;
        }
        latestEvents.current.onQueryChange?.(requestParams);
        sendToTable({type: 'FETCH', params: requestParams});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestFingerprint]);

    // los eventos de la carga salen hacia afuera (la lógica de negocio que depende de lo que llegó). Con referencia a la
    // función más reciente: la pantalla suele pasar funciones nuevas en cada pintada
    const isReady = tableSnapshot.matches('ready');
    useEffect(() => {
        if (isReady) {
            latestEvents.current.onLoaded?.({rows, total, facets, capped});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, rows]);
    useEffect(() => {
        if (error) {
            latestEvents.current.onLoadError?.(error);
        }
    }, [error]);

    const toggleSort = (column) => {
        const currentSort = sortOrders.find((sortOrder) => sortOrder.column === column);
        if (!currentSort) {
            tableState.setSort([{column, direction: 'desc'}]);
        } else if (currentSort.direction === 'desc') {
            tableState.setSort([{column, direction: 'asc'}]);
        } else {
            // tercer clic: regresa al orden por defecto del servidor
            tableState.setSort([]);
        }
    };

    // ─── Renglones elegidos (rowSelection.js) ───
    // con acciones (o quien escuche los cambios) cada renglón lleva su casilla
    const isSelectable = selectionActions.length > 0 || Boolean(onSelectionChange);
    const [rowSelection, setRowSelection] = useState(EMPTY_ROW_SELECTION);
    const idOf = useCallback((row) => (getRowId ? getRowId(row) : row.id), [getRowId]);
    const pageRowsById = useMemo(() => new Map(visibleRows.map((row) => [idOf(row), row])), [visibleRows, idOf]);
    const selectablePageIds = useMemo(
        () => visibleRows.filter((row) => !isRowSelectable || isRowSelectable(row)).map(idOf),
        [visibleRows, isRowSelectable, idOf],
    );
    const checkedIds = useMemo(() => checkedIdsOf(rowSelection, selectablePageIds), [rowSelection, selectablePageIds]);
    const selection = rowSelectionOf(rowSelection, {total, capped, filters});

    const updateSelection = (nextSelection) => {
        setRowSelection(nextSelection);
        onSelectionChange?.(rowSelectionOf(nextSelection, {total, capped, filters}));
    };
    const clearSelection = () => updateSelection(EMPTY_ROW_SELECTION);

    // otro filtro u otro conjunto son otros renglones: la selección se borra para no actuar sobre lo que ya no se ve. Cambiar
    // de página o de orden la conserva
    const selectionResetKey = JSON.stringify({queryKey, filters});
    const lastSelectionResetKey = useRef(selectionResetKey);
    useEffect(() => {
        if (lastSelectionResetKey.current === selectionResetKey) {
            return;
        }
        lastSelectionResetKey.current = selectionResetKey;
        if (rowSelection !== EMPTY_ROW_SELECTION) {
            clearSelection();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectionResetKey]);

    // el DataGrid avisa qué quedó marcado; con disableRowSelectionExcludeModel siempre es la lista de los marcados
    const handleGridSelectionChange = (model) => {
        // la casilla de arriba elige todos los que coinciden (si se permite); el aviso deja quedarse con la página
        const nextSelection = selectionAfterCheck(rowSelection, model.ids, pageRowsById, selectablePageIds, {
            allMatchingOnWholePage: allowSelectAllMatching, total, capped,
        });
        if (nextSelection !== rowSelection) {
            updateSelection(nextSelection);
        }
    };

    const hasSelection = isSelectable && selection.count > 0;
    // en el teléfono con barra de pestañas abajo (vidrio, o minimalista con cápsulas) las acciones de los elegidos flotan
    // (SelectionActions decide dónde) y el conteo de la tabla se queda; sin esa barra, ocupan el lugar del conteo
    const floatsSelectionOnPhone = selectionFloatsOnPhone(theme);
    const selectionCountText = selection.isCapped
        ? t('selection.allMatchingCapped')
        : t('selection.count', {count: selection.count, total: formatNumber(selection.count)});
    // cada acción recibe la selección y cómo dejar la tabla al terminar; isDisabled se resuelve con la selección de ahora
    const selectionHelpers = {clearSelection, refresh: () => sendToTable({type: 'FETCH', params: requestParams})};
    const selectionActionItems = selectionActions.map(({key, label, icon, color, isDisabled, onClick}) => ({
        key, label, icon, color, disabled: isDisabled?.(selection) ?? false, onClick: () => onClick(selection, selectionHelpers),
    }));
    const offersAllMatching = isSelectable && allowSelectAllMatching && canSelectAllMatching(rowSelection, selectablePageIds, {total, capped});

    // el texto de la caja de búsqueda no cuenta como filtro oculto: se está viendo en su propia caja
    const hasActiveFilters = Object.entries(filters)
        .some(([field, value]) => field !== searchField && isFilterActive(filterKinds[field], value));

    // un acceso rápido está "puesto" cuando se aleja de su default; los que además tienen chip ya se cuentan ahí
    const quickActiveCount = quickFilters.filter((quickFilter) => !chipConfig.some((chipDeclaration) => chipDeclaration.key === quickFilter.field)
        && JSON.stringify(filters[quickFilter.field] ?? '') !== JSON.stringify(filterDefaults[quickFilter.field] ?? '')).length;

    const tableFilterValue = useMemo(() => ({
        filters,
        setFilter: tableState.setFilter,
        clearFilter: tableState.clearFilter,
        sortOrders,
        toggleSort,
        clearSort: () => tableState.setSort([]),
        facets,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [filters, sortOrders, facets]);

    // alto según lo que hay: una tabla de 3 organizaciones no deja 500 px en blanco. Sin renglones reservamos lugar para el
    // esqueleto de carga (hasta 8) o para el aviso de tabla vacía (3); con renglones, ni un pixel de hueco abajo
    let placeholderRowCount = 0;
    if (visibleRows.length === 0) {
        placeholderRowCount = isLoading ? Math.min(pageSize, 8) : 3;
    }
    // OJO: el alto se suma renglón por renglón con el alto que pide la pantalla (getRowHeight; p. ej. un renglón de
    // resumen más alto que los demás). Con un solo alto para todos, la tabla quedaba con hueco blanco o
    // con barra de desplazamiento sin necesidad
    let rowsHeight = placeholderRowCount * ROW_HEIGHT_PIXELS;
    for (const row of visibleRows) {
        const requestedRowHeight = getRowHeight?.({id: getRowId ? getRowId(row) : row.id, model: row, densityFactor: COMPACT_DENSITY_FACTOR});
        rowsHeight += typeof requestedRowHeight === 'number' ? requestedRowHeight : ROW_HEIGHT_PIXELS;
    }
    // la tabla crece con los renglones de la página y NO tiene scroll vertical propio (un solo scroll, el
    // de la página). La paginación del servidor ya acota cuántos renglones hay; maxGridHeight queda solo para quien
    // de verdad necesite un tope (un diálogo con altura fija)
    // con bandas el encabezado son dos renglones del mismo alto: el de las bandas y el de las columnas
    const headerHeight = columnGroupingModel ? 2 * COLUMN_HEADER_HEIGHT_PIXELS : COLUMN_HEADER_HEIGHT_PIXELS;
    // sin paginador que usar no hay pie: todo lo que hay ya está a la vista en la primera página
    const isFooterHidden = hideFooterWhenAllRowsFit && page === 0 && total <= pageSize;
    // el pie mide su alto más las líneas de borde; sin pie no hay ni lo uno ni lo otro
    const footerHeight = isFooterHidden ? 0 : FOOTER_HEIGHT_PIXELS + GRID_BORDER_PIXELS;
    const contentHeight = headerHeight + rowsHeight + footerHeight + HEIGHT_SLACK_PIXELS;
    const gridHeight = maxGridHeight ? Math.min(contentHeight, maxGridHeight) : contentHeight;

    const gridText = DATA_GRID_TEXT_BY_LANGUAGE[language] ?? DATA_GRID_TEXT_BY_LANGUAGE.es;
    const formattedTotal = formatNumber(total);
    const countText = countLabel ? countLabel(total) : t('count.records', {count: total, total: formattedTotal});

    const searchText = searchPlaceholder ?? t('search.placeholder');

    return (
        <ComponentTexts namespace="table" texts={texts}>
        <TableFilterContext value={tableFilterValue}>
            <TableToolbar direction={{xs: 'column', md: 'row'}} spacing={2} ownSx={{mb: 1.5, alignItems: {md: 'center'}}}>
                {/* la búsqueda: aquí o arriba en la barra de la app (BarSearch: se encoge a la lupa sin usar) */}
                {searchField && (
                    <BarSearch value={searchDraft} onChange={setSearchDraft} placeholder={searchText} inBar={searchInBar} collapsible={collapseSearchInBar} />
                )}
                {/* con elegidos, sus acciones ocupan el lugar del conteo (en el teléfono con barra de pestañas, flotan). Sus
                    textos son los de la tabla: así el `texts` de ServerTable también los cambia */}
                {hasSelection && (
                    <SelectionActions countText={selectionCountText} actions={selectionActionItems} onClear={clearSelection}
                                      phoneLayout={selectionPhoneLayout}
                                      texts={{selection: {clear: t('selection.clear'), actionsLabel: t('selection.actionsLabel'), summaryLabel: t('selection.summaryLabel')}}} />
                )}
                <TableSummary ownSx={{
                    flexGrow: 1, minWidth: 0, display: 'flex',
                    ...(hasSelection && {display: 'none', ...(floatsSelectionOnPhone && {[PHONE_MEDIA_QUERY]: {display: 'flex'}})}),
                }}>
                {header ? (
                    <TableCustomHeader ownSx={{flexGrow: 1, minWidth: 0}}>
                        {header({countText: capped ? t('count.capped', {total: formattedTotal}) : countText, total, capped})}
                    </TableCustomHeader>
                ) : (
                    // NOTA: el extra va pegado al conteo y no empujado a la orilla (ml: 'auto'): en escritorio quedaba a todo
                    // el ancho de distancia y no se leía como parte de la misma tabla (caso del selector de año)
                    <TableCount direction="row" spacing={2} useFlexGap ownSx={{flexGrow: 1, alignItems: 'center', flexWrap: 'wrap'}}>
                        <TableCountRow direction="row" spacing={1} ownSx={{alignItems: 'center'}}>
                            <Typography variant="body2" color="text.secondary" role="status" aria-live="polite">
                                {capped ? t('count.capped', {total: formattedTotal}) : countText}
                            </Typography>
                            {capped && <Tag label={t('count.cappedTag')} color="warning" tooltip={t('count.cappedTooltip')} />}
                        </TableCountRow>
                        {toolbarExtra}
                    </TableCount>
                )}
                </TableSummary>
            </TableToolbar>

            {beforeQuickFilters}

            {quickFilters.map((quickFilter) => (
                <QuickFilterRow key={quickFilter.field} quickFilter={quickFilter} facets={facets} total={total} filters={filters}
                                isMultiple={filterKinds[quickFilter.field] === FILTER_KINDS.multiSelect}
                                setFilter={tableState.setFilter} setFilters={tableState.setFilters} />
            ))}

            <FilterChips chipConfig={chipConfig} filters={filters} quickActiveCount={quickActiveCount}
                         onSetFilter={tableState.setFilter} onClearAll={tableState.clearAll} />

            {/* todos los que coinciden (lo elige la casilla de arriba): se puede volver a solo esta página; la página llena a
                mano: se ofrece elegir todos */}
            {(offersAllMatching || (isSelectable && rowSelection.isAllMatching)) && (
                <TableSelectionNotice severity="info" icon={false} ownSx={{mb: 1, alignItems: 'center'}}
                       action={rowSelection.isAllMatching ? (
                           <Button color="inherit" size="small"
                                   onClick={() => updateSelection({
                                       rowsById: new Map(selectablePageIds.map((id) => [id, pageRowsById.get(id)])), isAllMatching: false,
                                   })}>
                               {t('selection.onlyThisPage')}
                           </Button>
                       ) : (
                           <Button color="inherit" size="small" onClick={() => updateSelection({rowsById: new Map(), isAllMatching: true})}>
                               {capped ? t('selection.selectAllMatchingCapped') : t('selection.selectAllMatching', {total: formattedTotal})}
                           </Button>
                       )}>
                    {rowSelection.isAllMatching
                        ? (capped ? t('selection.allMatchingCapped') : t('selection.allMatching', {total: formattedTotal}))
                        : t('selection.pageSelected', {count: selectablePageIds.length})}
                </TableSelectionNotice>
            )}

            {error && (
                <TableError severity="error" role="alert" ownSx={{mb: 1}}
                       action={(
                           <Button color="inherit" size="small" onClick={() => sendToTable({type: 'FETCH', params: requestParams})}>
                               {t('common:actions.retry')}
                           </Button>
                       )}>
                    {error.message ?? t('error.generic')}
                </TableError>
            )}

            {/* minWidth 0: dentro de un flex o grid el DataGrid no empuja la página; en el teléfono la tabla se desliza
                de lado DENTRO de su tarjeta y la página no */}
            <TableCard variant="outlined" ownSx={{width: '100%', minWidth: 0, overflow: 'hidden'}}>
                <TableGrid
                    // primero lo de la pantalla (sus eventos); lo de abajo es lo que la tabla controla y le gana
                    {...gridProps}
                    rows={visibleRows}
                    columns={columns}
                    columnGroupingModel={columnGroupingModel}
                    getRowId={getRowId}
                    getRowClassName={(params) => [
                        getRowClassName?.(params),
                        striped && params.indexRelativeToCurrentPage % 2 === 1 ? STRIPED_ROW_CLASS : '',
                    ].filter(Boolean).join(' ')}
                    getRowHeight={getRowHeight}
                    aria-label={ariaLabel}
                    nonce={readCspNonce()}
                    loading={isLoading}
                    // IMPORTANTE: paginación y orden del servidor; el DataGrid no reordena ni recorta nada solo
                    paginationMode="server"
                    sortingMode="server"
                    filterMode="server"
                    rowCount={total}
                    paginationModel={{page, pageSize}}
                    onPaginationModelChange={(paginationModel) => {
                        if (paginationModel.pageSize !== pageSize) {
                            tableState.setPageSize(paginationModel.pageSize);
                        } else {
                            tableState.setPage(paginationModel.page);
                        }
                    }}
                    pageSizeOptions={pageSizeOptions}
                    hideFooter={isFooterHidden}
                    disableColumnMenu
                    disableRowSelectionOnClick
                    // elegir renglones: solo con la casilla (el clic en el renglón no elige). Los elegidos de otras páginas
                    // se conservan (keepNonExistentRowsSelected). OJO: sin disableRowSelectionExcludeModel la casilla de
                    // arriba marca «todos los de todas las páginas» en lugar de los de esta página
                    checkboxSelection={isSelectable}
                    rowSelectionModel={isSelectable ? {type: 'include', ids: checkedIds} : undefined}
                    onRowSelectionModelChange={isSelectable ? handleGridSelectionChange : undefined}
                    isRowSelectable={isSelectable && isRowSelectable ? (params) => isRowSelectable(params.row) : undefined}
                    keepNonExistentRowsSelected={isSelectable}
                    disableRowSelectionExcludeModel
                    // el conteo de los elegidos lo dice la barra de arriba; el del pie del DataGrid sobraría
                    hideFooterSelectedRowCount
                    // con columna fija se dibuja todo: si no, la fija desaparecería al deslizar a la derecha (fixedColumnSxOf)
                    disableVirtualization={Boolean(fixedColumn)}
                    density={DATA_GRID_DENSITY}
                    localeText={{...gridText, noRowsLabel: emptyLabel ?? t('empty.default')}}
                    slotProps={{
                        // con filas ya pintadas, barra delgada arriba sin tapar lo que se lee; con la tabla vacía, esqueleto
                        loadingOverlay: {variant: 'linear-progress', noRowsVariant: 'skeleton'},
                    }}
                    slots={{
                        // "ir a la página N" (solo si se pide) pegado a la paginación: ahí lo busca quien ya está leyendo
                        // "51-75 de 1,234". Sin él, la paginación de siempre del DataGrid
                        ...(showGoToPage && {
                            pagination: () => (
                                <TablePagination direction="row" spacing={1} ownSx={{alignItems: 'center'}}>
                                    <GoToPage page={page} pageCount={Math.ceil(total / pageSize) || 1} onChange={tableState.setPage} />
                                    <GridPagination />
                                </TablePagination>
                            ),
                        }),
                        noResultsOverlay: () => <EmptyState filtered label={emptyLabel} onClearFilters={tableState.clearAll} />,
                        noRowsOverlay: () => <EmptyState filtered={hasActiveFilters} label={emptyLabel} onClearFilters={tableState.clearAll} />,
                    }}
                    ownSx={[{
                        // IMPORTANTE: el alto va en la raíz del DataGrid y no en la caja de afuera: las variables
                        // --DataGrid-hasScrollX y --DataGrid-scrollbarSize solo existen en la raíz. Cuando las columnas no
                        // caben (historial a 390 px) la barra horizontal ocupa su alto dentro de la tabla y, sin sumarlo, los
                        // renglones se desplazaban 13 px por dentro. Con barras superpuestas (teléfono, trackpad) mide 0
                        height: `calc(${gridHeight}px + var(--DataGrid-hasScrollX, 0) * var(--DataGrid-scrollbarSize, 0px))`,
                        border: 0,
                        // todo centrado verticalmente: el texto suelto se pegaba arriba y los chips quedaban a media altura
                        '& .MuiDataGrid-cell': {display: 'flex', alignItems: 'center'},
                        '& .MuiDataGrid-columnHeader': {alignItems: 'center'},
                        // cebra: el color del hover del tema
                        [`& .${STRIPED_ROW_CLASS}`]: {bgcolor: 'action.hover'},
                        [`& .${STRIPED_ROW_CLASS}:hover`]: {bgcolor: 'action.selected'},
                        ...gridSx,
                    }, (gridTheme) => (fixedColumn ? fixedColumnSxOf(gridTheme, fixedColumn, {withCheckboxColumn: isSelectable}) : {})]}
                />
            </TableCard>

            {footer?.({total, capped})}
        </TableFilterContext>
        </ComponentTexts>
    );
}
