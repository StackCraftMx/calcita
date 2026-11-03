// Hecho en Calcita · la tabla de servidor (ServerTable de /table): pagina, filtra y ordena en el servidor, con el total
// real y las opciones de cada filtro con su conteo, y deja elegir renglones para actuar sobre ellos. Cada sección dice para qué sirve en una línea, enseña el código mínimo
// y trae su tabla «Cómo se extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import FilterDrawerDemo from '@/modules/catalog/demos/table/FilterDrawerDemo.tsx';
import ReadyColumnsDemo from '@/modules/catalog/demos/table/ReadyColumnsDemo.tsx';
import OrdersSelectionDemo from '@/modules/catalog/demos/table/OrdersSelectionDemo.tsx';
import OrdersTableDemo from '@/modules/catalog/demos/table/OrdersTableDemo.tsx';

const loadDemo = () => import('@/modules/catalog/demos/table/OrdersTableDemo.tsx?demo-source');
const loadSelection = () => import('@/modules/catalog/demos/table/OrdersSelectionDemo.tsx?demo-source');
const loadApi = () => import('@/modules/catalog/demos/table/OrdersTableApi.ts?demo-source');
const loadFilterDrawer = () => import('@/modules/catalog/demos/table/FilterDrawerDemo.tsx?demo-source');
const loadReadyColumns = () => import('@/modules/catalog/demos/table/ReadyColumnsDemo.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (serverTable.<sección>.extend.<id>)
const TABLE_EXTENSIONS = [
    {id: 'columns', option: 'textColumn · facetColumn · detailColumn', example: "textColumn({field: 'customer', label: 'Cliente', flex: 1})"},
    {id: 'cells', option: 'renderCell · valueFormatter · align', example: "textColumn({field: 'total', valueFormatter: (value) => formatCurrency(value), align: 'right'})"},
    {id: 'filters', option: 'filterDefaults · filterKinds', example: "filterKinds={{customer: FILTER_KINDS.text, status: FILTER_KINDS.multiSelect}}"},
    {id: 'quickFilters', option: 'quickFilters', example: "quickFilters={[{field: 'status', facetKey: 'status', caption: 'Por estado'}]}"},
    {id: 'quickFilterShape', option: 'allLabel · order · renderLabel · clears · isOverridden', example: "{field: 'status', allLabel: 'Todos', order: ['pending', 'paid'], clears: {created_from: '', created_to: ''}}"},
    {id: 'quickFilterCount', option: 'allCountKey · hideAllCount', example: "{field: 'status', allCountKey: 'statusTotal'}"},
    {id: 'periodPresets', option: 'quickFilters (periodos) · allCountKey · clears · isOverridden', example: "{field: 'period', order: ['today', 'last_7_days'], allCountKey: 'period_total', clears: {created_from: '', created_to: ''}, isOverridden: (filters) => Boolean(filters.created_from || filters.created_to)}"},
    {id: 'dateRange', option: 'renderExtra · <DateRangeFilter>', example: "renderExtra: ({filters, setFilters}) => <DateRangeFilter from={filters.created_from} to={filters.created_to} onChange={({from, to}) => setFilters({created_from: from, created_to: to, period: ''})} />"},
    {id: 'periodRange', option: '<PeriodRangeSelector>', example: "renderExtra: ({filters, setFilters}) => <PeriodRangeSelector id=\"months\" options={monthOptions} from={filters.month_from} to={filters.month_to} fromLabel=\"Desde\" toLabel=\"Hasta\" onChange={({from, to}) => setFilters({month_from: from, month_to: to})} />"},
    {id: 'chips', option: 'chipConfig', example: "chipConfig={buildChipConfig({text: [{key: 'created_from', label: 'Desde', format: formatDate}], multiSelect: [{key: 'status', label: 'Estado'}]})}"},
    {id: 'search', option: 'searchField · searchPlaceholder', example: 'searchPlaceholder="Buscar por folio o cliente"'},
    {id: 'searchInBar', option: 'searchInBar · collapseSearchInBar', example: '<ServerTable searchInBar … />'},
    {id: 'texts', option: 'countLabel · emptyLabel', example: 'countLabel={(total) => `${formatNumber(total)} pedidos`}'},
    {id: 'slots', option: 'header · toolbarExtra · beforeQuickFilters · footer', example: 'toolbarExtra={<YearSelect />}'},
    {id: 'fixedColumn', option: 'fixedColumn (una o varias)', example: "fixedColumn={['actions', 'number']}  // las que no son la última llevan width"},
    {id: 'rows', option: "striped · getRowClassName · getRowHeight (número o 'auto')", example: "getRowHeight={() => 'auto'}  // crece con lo que lleva la celda"},
    {id: 'isRowVisible', option: 'isRowVisible', example: 'isRowVisible={useCallback((row) => !collapsed.has(row.group), [collapsed])}'},
    {id: 'bands', option: 'columnGroupingModel', example: "columnGroupingModel={[{groupId: 'Enero', children: [{field: 'paid'}, {field: 'pending'}]}]}"},
    {id: 'pages', option: 'defaultPageSize · pageSizeOptions', example: 'defaultPageSize={50} pageSizeOptions={[25, 50, 100]}'},
    {id: 'footer', option: 'hideFooterWhenAllRowsFit · showGoToPage', example: '<ServerTable showGoToPage … />'},
    {id: 'height', option: 'maxGridHeight · gridSx', example: "gridSx={{'& .MuiDataGrid-cell': {alignItems: 'flex-start'}}}  // se combina con lo de la tabla"},
    {id: 'refresh', option: 'refreshToken', example: 'refreshToken={savedAt}'},
    {id: 'enabled', option: 'enabled', example: "enabled={activeTab === 'orders'}"},
    {id: 'events', option: 'onQueryChange · onLoaded · onLoadError', example: "onQueryChange={({filters}) => setShowsReason(filters.status?.includes('canceled'))}"},
    {id: 'gridProps', option: 'gridProps', example: 'gridProps={{onRowDoubleClick: ({row}) => navigate(`/orders/${row.id}`)}}'},
    {id: 'ownTexts', option: 'texts', example: "texts={{empty: {filtered: 'Ningún pedido con esos filtros.'}, chips: {clearAll: 'Quitar todo'}}}"},
    {id: 'componentTexts', option: '<ComponentTexts namespace="table">', example: "<ComponentTexts namespace=\"table\" texts={{count: {records_one: '{{total}} pedido', records_other: '{{total}} pedidos'}}}>…</ComponentTexts>"},
];
const SELECTION_EXTENSIONS = [
    {id: 'actions', option: 'selectionActions[].key · label · icon · color · onClick', example: "{key: 'cancel', label: 'Cancelar', icon: <BlockIcon />, color: 'error', onClick: (selection, helpers) => cancelOrders(selection)}"},
    {id: 'isDisabled', option: 'selectionActions[].isDisabled', example: 'isDisabled: (selection) => selection.count > 100'},
    {id: 'selection', option: 'ids · rows · count · isAllMatching · filters', example: "api.post('/orders/cancel', selection.isAllMatching ? {filters: selection.filters} : {ids: selection.ids})"},
    {id: 'helpers', option: 'clearSelection · refresh', example: 'onClick: async (selection, {clearSelection, refresh}) => { await cancelOrders(selection); clearSelection(); refresh(); }'},
    {id: 'isRowSelectable', option: 'isRowSelectable', example: "isRowSelectable={(row) => row.status !== 'canceled'}"},
    {id: 'allowSelectAllMatching', option: 'allowSelectAllMatching', example: 'allowSelectAllMatching={false}'},
    {id: 'onSelectionChange', option: 'onSelectionChange', example: 'onSelectionChange={(selection) => setSelectedCount(selection.count)}'},
    {id: 'phoneLayout', option: 'selectionPhoneLayout', example: 'selectionPhoneLayout={SELECTION_PHONE_LAYOUT.split}'},
    {id: 'texts', option: 'texts.selection', example: "texts={{selection: {count_one: '{{total}} pedido elegido', count_other: '{{total}} pedidos elegidos', clear: 'Deseleccionar'}}}"},
];
const API_EXTENSIONS = [
    {id: 'fetchPage', option: 'fetchPage(request, signal)', example: "fetchPage={(request, signal) => api.get('/orders', {params: toServerTableParams(request), signal})}"},
    {id: 'answer', option: '{rows, total, facets}', example: "{rows: [...], total: 1382, facets: {status: [{value: 'paid', total: 14}]}}"},
    {id: 'capped', option: 'capped', example: '{rows, total: 10000, capped: true}'},
    {id: 'params', option: 'toServerTableParams(request)', example: '// → {page: 1, page_size: 25, sort: "number", direction: "asc", status: ["paid"]}'},
    {id: 'legacy', option: 'fetchPage (adaptador)', example: "fetchPage={(request) => oldApi.list({pagina: request.page + 1}).then(({data, count}) => ({rows: data, total: count}))}"},
    {id: 'parameterNames', option: 'parameterNames', example: "toServerTableParams(request, {parameterNames: {customer: 'customer_name'}})"},
    {id: 'prefix', option: 'prefix', example: 'prefix="orders"'},
    {id: 'queryKey', option: 'queryKey', example: 'queryKey={`orders-${branchId}`}'},
    {id: 'getRowId', option: 'getRowId', example: 'getRowId={(row) => row.folio}'},
];

const FILTER_DRAWER_EXTENSIONS = [
    {id: 'fields', option: 'fields[].kind', example: "{name: 'amount', label: 'Monto', kind: FILTER_FIELD_KIND.comparison, prefix: '$'}"},
    {id: 'kinds', option: 'text · select · multiSelect · catalog · checkboxes · numberRange · dateRange · comparison · custom', example: "{name: 'term', kind: FILTER_FIELD_KIND.numberRange, suffix: 'días'}  // term_min y term_max"},
    {id: 'keys', option: 'keys · operators · defaultOperator', example: "{kind: 'dateRange', keys: {from: 'created_from', to: 'created_to'}}"},
    {id: 'side', option: 'anchor · width · title · applyLabel', example: '<FilterDrawer anchor={FILTER_DRAWER_ANCHOR.left} width={420} title="Buscar facturas" />'},
    {id: 'table', option: 'ServerTableFilterDrawer (en toolbarExtra)', example: '<ServerTable … toolbarExtra={<ServerTableFilterDrawer fields={FIELDS} />} />'},
    {id: 'setup', option: 'filterDrawerDefaultsOf · filterDrawerKindsOf · filterDrawerChipsOf', example: 'chipConfig={buildChipConfig(filterDrawerChipsOf(FIELDS, {t, formatDate}))}'},
    {id: 'custom', option: "kind: 'custom' · render", example: "{name: 'zone', kind: 'custom', render: ({value, onChange}) => <MiMapa value={value} onChange={onChange} />}"},
    {id: 'theme', option: 'theme.components.CalcitaFilterDrawer', example: 'components: {CalcitaFilterDrawer: {defaultProps: {anchor: \'left\'}}}'},
];

const READY_COLUMNS_EXTENSIONS = [
    {id: 'stacked', option: 'stackedColumn({entries})', example: "stackedColumn({field: 'business_name', label: 'Empresa', entries: (row) => [row.business_name, row.rfc]})"},
    {id: 'stackedLabels', option: "{label, value, note} · texts.cells.empty", example: "entries: (row) => [{label: 'Alta', value: formatDate(row.created_at)}, {label: 'Último cambio', value: formatDate(row.updated_at)}]"},
    {id: 'status', option: 'statusColumn({dictionary, t, variant, filter})', example: "statusColumn({field: 'status', label: 'Estado', dictionary: STATUS, t})  // el ancho, medido"},
    {id: 'actions', option: 'actionsColumn({label, actionsOf, labelOf})', example: "actionsColumn({label: 'Acciones', actionsOf: (row) => [{key: 'open', label: 'Abrir', to: `/clientes/${row.id}`}]})"},
    {id: 'fixed', option: 'fixedColumn={[ACTIONS_COLUMN_FIELD, …]}', example: "fixedColumn={[ACTIONS_COLUMN_FIELD, 'business_name']}"},
    {id: 'cards', option: 'renderCard(row, {index})', example: 'renderCard={(row) => <RecordCard title={row.business_name} … />}'},
    {id: 'view', option: 'view · defaultView · onViewChange · showViewToggle', example: "defaultView={TABLE_VIEW.cards}  // con prefix va en la dirección: ?clientes_view=cards"},
    {id: 'skeleton', option: 'cardSkeleton', example: '<RecordCardSkeleton groups={2} withHighlight={false} />'},
    {id: 'theme', option: 'CalcitaServerTable: cards · viewToggle · CalcitaStackedCell', example: "components: {CalcitaServerTable: {styleOverrides: {cards: {gridTemplateColumns: 'repeat(2, 1fr)'}}}}"},
];

export const ServerTablePage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `serverTable.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('serverTable.title')} description={t('serverTable.description')} />
            <DemoSection title={t('serverTable.demo.title')} description={t('serverTable.demo.description')}
                         extensions={rowsOf('demo', TABLE_EXTENSIONS)} Demo={OrdersTableDemo} loadSource={loadDemo} />
            <DemoSection title={t('serverTable.selection.title')} description={t('serverTable.selection.description')}
                         extensions={rowsOf('selection', SELECTION_EXTENSIONS)} Demo={OrdersSelectionDemo} loadSource={loadSelection} />
            <DemoSection title={t('serverTable.filterDrawer.title')} description={t('serverTable.filterDrawer.description')}
                         extensions={rowsOf('filterDrawer', FILTER_DRAWER_EXTENSIONS)} Demo={FilterDrawerDemo} loadSource={loadFilterDrawer} />
            <DemoSection title={t('serverTable.readyColumns.title')} description={t('serverTable.readyColumns.description')}
                         extensions={rowsOf('readyColumns', READY_COLUMNS_EXTENSIONS)} Demo={ReadyColumnsDemo} loadSource={loadReadyColumns} />
            <CodeSection title={t('serverTable.api.title')} description={t('serverTable.api.description')}
                         extensions={rowsOf('api', API_EXTENSIONS)} loadSource={loadApi} />
        </Stack>
    );
};
