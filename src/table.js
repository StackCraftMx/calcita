// La tabla de servidor: paginada, filtrada y ordenada en el backend, con su máquina de estados, filtros por columna,
// chips de filtro e historial por renglón. Pide @mui/x-data-grid y nuqs (el estado de la tabla vive en la URL: la app
// pone el adaptador de nuqs de su framework).
export {
    AuditTrailDialog, AuditTrailTable, EmptyState, FILTER_KINDS, FilterChips, GoToPage, ServerTable, TableFilterContext, buildChipConfig,
    buildTableActors, detailColumn, facetColumn, isFilterActive, tableMachine, textColumn, toServerTableParams, useDebouncedFilter,
    useTableFilter, useTableState,
} from '@/DataTable/index.js';
