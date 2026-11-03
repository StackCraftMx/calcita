// La tabla de servidor: paginada, filtrada y ordenada en el backend, con su máquina de estados, filtros por columna,
// chips de filtro e historial por renglón. Pide @mui/x-data-grid y nuqs (el estado de la tabla vive en la URL: la app
// pone el adaptador de nuqs de su framework).
export {
    ACTIONS_COLUMN_FIELD, AuditTrailDialog, AuditTrailTable, DETAIL_COLUMN_FIELD, EmptyState, FILTER_KINDS, FilterChips, GoToPage, SELECTION_PHONE_LAYOUT,
    ServerTable, ServerTableFilterDrawer, StackedCell, TABLE_VIEW, TableCardsView, TableFilterContext, TableViewToggle, actionsColumn,
    buildChipConfig, buildTableActors, detailColumn, facetColumn, fixedColumnOffsetsOf, fixedFieldsOf, isFilterActive, stackedColumn, statusColumn,
    statusColumnWidthOf, tableMachine, textColumn, textWidthOf, toServerTableParams, useDebouncedFilter, useTableFilter, useTableState, useTableView,
} from '@/DataTable/index.js';

/** @typedef {import('@/DataTable/rowSelection.js').RowSelection} RowSelection */
/** @typedef {import('@/DataTable/StackedCell.jsx').StackedEntry} StackedEntry */
