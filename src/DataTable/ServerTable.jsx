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
// Piezas: useTableState (URL con nuqs y prefijo) · tableMachine (XState: carga, error y respuestas rezagadas) ·
// columns.jsx (encabezados con orden y filtro) · FilterChips · QuickFilters · GoToPage · EmptyState.
//
// Con @mui/x-data-grid 8 (compatible con MUI 7).
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useMemo, useRef} from 'react';
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
import SearchIcon from '@mui/icons-material/Search';
import {DataGrid, GridPagination} from '@mui/x-data-grid';
import {enUS as dataGridEnglish, esES as dataGridSpanish} from '@mui/x-data-grid/locales';

import EmptyState from '@/DataTable/EmptyState.jsx';
import FilterChips from '@/DataTable/FilterChips.jsx';
import GoToPage from '@/DataTable/GoToPage.jsx';
import {TableFilterContext} from '@/DataTable/filterContext.js';
import {buildTableActors, tableMachine} from '@/DataTable/tableMachine.js';
import {useDebouncedFilter} from '@/DataTable/useDebouncedFilter.js';
import {FILTER_KINDS, isFilterActive, useTableState} from '@/DataTable/useTableState.js';
import {formatNumber} from '@/formatting.js';
import {materialBackgroundOf} from '@/theme/glassSurface.js';
import QuickFilters from '@/ui/filters/QuickFilters.jsx';
import Tag from '@/ui/labels/Tag.jsx';

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
// ancho de la caja de búsqueda en escritorio: cabe un texto de ayuda como «Buscar por pedido, cliente o producto…».
// OJO: con 280 se cortaba («…cliente o pro»); en el teléfono la caja toma todo el ancho
const SEARCH_BOX_MIN_WIDTH_PIXELS = 400;
const STRIPED_ROW_CLASS = 'server-table-row--striped';


// a qué altura van la celda y el encabezado fijos: los mismos que usa el DataGrid de paga para sus columnas fijas. El
// encabezado va arriba de la raya que separa columnas (30); con menos, la raya de las otras columnas lo cruzaba al deslizar
const FIXED_CELL_Z_INDEX = 30;
const FIXED_HEADER_Z_INDEX = 40;

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
 * @param {object} theme tema de MUI
 * @param {string} field campo de la columna que se queda fija
 * @returns {object} estilos para el sx del DataGrid
 */
function fixedColumnSxOf(theme, field) {
    // un tema con variables CSS (cssVariables) las trae en theme.vars; el tema por omisión de MUI, solo en theme.palette
    const {palette} = theme.vars ?? theme;
    const paper = palette.background.paper;
    const divider = `1px solid ${palette.divider}`;
    // la banda del encabezado que lleva solo a esta columna: el DataGrid la marca con sus campos entre |- y -|
    const ownBandHeader = `.MuiDataGrid-columnHeader[data-fields="|-${field}-|"]`;
    const isMaterialContent = Boolean(theme.toolkit?.glass?.surfaces);
    // abajo la capa (el papel o el material) y encima el color del renglón (el ::before)
    const stickyBackground = {backgroundColor: 'inherit', ...(isMaterialContent ? materialBackgroundOf(theme, {thick: true}) : {backgroundImage: `linear-gradient(${paper}, ${paper})`})};

    return {
        '& :where(.MuiDataGrid-row)': {backgroundColor: isMaterialContent ? 'transparent' : paper},
        [`& .MuiDataGrid-cell[data-field="${field}"]`]: {
            position: 'sticky', left: 0, zIndex: FIXED_CELL_Z_INDEX, borderRight: divider,
            ...stickyBackground,
            '&::before': {content: '""', position: 'absolute', inset: 0, zIndex: -1, backgroundColor: 'inherit'},
        },
        [`& :where(.MuiDataGrid-columnHeader[data-field="${field}"], ${ownBandHeader})`]: isMaterialContent ? materialBackgroundOf(theme, {thick: true}) : {backgroundColor: paper},
        [`& .MuiDataGrid-columnHeader[data-field="${field}"], & ${ownBandHeader}`]: {
            position: 'sticky', left: 0, zIndex: FIXED_HEADER_Z_INDEX, borderRight: divider,
        },
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

/**
 * @param {object} props
 * @param {(params: object, signal: AbortSignal) => Promise<{rows: Array, total: number, facets?: object, capped?: boolean}>} props.fetchPage
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
 * @param {string} [props.emptyLabel]
 * @param {(total: number) => string} [props.countLabel] "12 pedidos"; por defecto "12 registros"
 * @param {number[]} [props.pageSizeOptions]
 * @param {number} [props.defaultPageSize]
 * @param {(row: object) => string|number} [props.getRowId]
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
 * @param {(params: object) => string} [props.getRowClassName]
 * @param {(row: object) => boolean} [props.isRowVisible] cuáles renglones de la página se pintan; los demás se esconden
 *     SIN volver a consultar (p. ej. plegar un grupo de renglones). Sin ella se pintan todos. OJO: va con useCallback;
 *     una función nueva en cada pintada haría filtrar la página cada vez
 * @param {boolean} [props.striped] renglones alternos (cebra) con el color de hover del tema; al pasar el cursor se usa
 *     el de «seleccionado» para que el renglón bajo el cursor se siga distinguiendo
 * @param {(params: object) => number|'auto'|null} [props.getRowHeight]
 * @param {boolean} [props.hideFooterWhenAllRowsFit] esconde el pie (el paginador) mientras todo lo que hay cabe en la
 *     página; si un día no cabe, el pie vuelve solo. Para tablas que casi nunca pasan de una página
 * @param {object} [props.gridSx] estilos extra del DataGrid (clases de renglón)
 * @param {number} [props.maxGridHeight] alto máximo del contenedor; sin él la tabla crece con sus renglones (default)
 * @param {string} [props.ariaLabel] nombre de la tabla para lectores de pantalla
 * @param {string} [props.fixedColumn] campo de la columna que se queda pegada a la izquierda al deslizar de lado (como
 *     fixedSelectColumn de mui-datatables)
 */
export default function ServerTable({
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
    striped = false,
    getRowHeight,
    gridSx,
    maxGridHeight = null,
    ariaLabel,
    fixedColumn,
}) {
    const {t, language, changeLanguage} = useToolkitTranslation('table');
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
        sendToTable({type: 'FETCH', params: requestParams});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestFingerprint]);

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

    return (
        <TableFilterContext value={tableFilterValue}>
            <Stack direction={{xs: 'column', md: 'row'}} spacing={2} sx={{mb: 1.5, alignItems: {md: 'center'}}}>
                {searchField && (
                    <TextField
                        type="search"
                        size="small"
                        value={searchDraft}
                        onChange={(event) => setSearchDraft(event.target.value)}
                        placeholder={searchPlaceholder ?? t('search.placeholder')}
                        sx={{minWidth: {xs: 0, md: SEARCH_BOX_MIN_WIDTH_PIXELS}}}
                        slotProps={{
                            input: {startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>},
                            htmlInput: {'aria-label': searchPlaceholder ?? t('search.placeholder')},
                        }}
                    />
                )}
                {header ? (
                    <Box sx={{flexGrow: 1, minWidth: 0}}>
                        {header({countText: capped ? t('count.capped', {total: formattedTotal}) : countText, total, capped})}
                    </Box>
                ) : (
                    // NOTA: el extra va pegado al conteo y no empujado a la orilla (ml: 'auto'): en escritorio quedaba a todo
                    // el ancho de distancia y no se leía como parte de la misma tabla (caso del selector de año)
                    <Stack direction="row" spacing={2} useFlexGap sx={{flexGrow: 1, alignItems: 'center', flexWrap: 'wrap'}}>
                        <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                            <Typography variant="body2" color="text.secondary" role="status" aria-live="polite">
                                {capped ? t('count.capped', {total: formattedTotal}) : countText}
                            </Typography>
                            {capped && <Tag label={t('count.cappedTag')} color="warning" tooltip={t('count.cappedTooltip')} />}
                        </Stack>
                        {toolbarExtra}
                    </Stack>
                )}
            </Stack>

            {beforeQuickFilters}

            {quickFilters.map((quickFilter) => (
                <QuickFilterRow key={quickFilter.field} quickFilter={quickFilter} facets={facets} total={total} filters={filters}
                                isMultiple={filterKinds[quickFilter.field] === FILTER_KINDS.multiSelect}
                                setFilter={tableState.setFilter} setFilters={tableState.setFilters} />
            ))}

            <FilterChips chipConfig={chipConfig} filters={filters} quickActiveCount={quickActiveCount}
                         onSetFilter={tableState.setFilter} onClearAll={tableState.clearAll} />

            {error && (
                <Alert severity="error" role="alert" sx={{mb: 1}}
                       action={(
                           <Button color="inherit" size="small" onClick={() => sendToTable({type: 'FETCH', params: requestParams})}>
                               {t('common:actions.retry')}
                           </Button>
                       )}>
                    {error.message ?? t('error.generic')}
                </Alert>
            )}

            {/* minWidth 0: dentro de un flex o grid el DataGrid no empuja la página; en el teléfono la tabla se desliza
                de lado DENTRO de su tarjeta y la página no */}
            <Paper variant="outlined" sx={{width: '100%', minWidth: 0, overflow: 'hidden'}}>
                <DataGrid
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
                    // con columna fija se dibuja todo: si no, la fija desaparecería al deslizar a la derecha (fixedColumnSxOf)
                    disableVirtualization={Boolean(fixedColumn)}
                    density={DATA_GRID_DENSITY}
                    localeText={{...gridText, noRowsLabel: emptyLabel ?? t('empty.default')}}
                    slotProps={{
                        // con filas ya pintadas, barra delgada arriba sin tapar lo que se lee; con la tabla vacía, esqueleto
                        loadingOverlay: {variant: 'linear-progress', noRowsVariant: 'skeleton'},
                    }}
                    slots={{
                        // "ir a la página N" pegado a la paginación: ahí lo busca quien ya está leyendo "51-75 de 1,234"
                        pagination: () => (
                            <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                                <GoToPage page={page} pageCount={Math.ceil(total / pageSize) || 1} onChange={tableState.setPage} />
                                <GridPagination />
                            </Stack>
                        ),
                        noResultsOverlay: () => <EmptyState filtered label={emptyLabel} onClearFilters={tableState.clearAll} />,
                        noRowsOverlay: () => <EmptyState filtered={hasActiveFilters} label={emptyLabel} onClearFilters={tableState.clearAll} />,
                    }}
                    sx={[{
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
                    }, (theme) => (fixedColumn ? fixedColumnSxOf(theme, fixedColumn) : {})]}
                />
            </Paper>

            {footer?.({total, capped})}
        </TableFilterContext>
    );
}
