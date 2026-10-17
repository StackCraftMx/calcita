// Barril de la tabla de servidor: lo que consume una pantalla (vía @/core).
export {default as AuditTrailDialog} from '@/DataTable/AuditTrailDialog.jsx';
export {default as AuditTrailTable} from '@/DataTable/AuditTrailTable.jsx';
export {default as EmptyState} from '@/DataTable/EmptyState.jsx';
export {default as FilterChips} from '@/DataTable/FilterChips.jsx';
export {default as GoToPage} from '@/DataTable/GoToPage.jsx';
export {default as ServerTable} from '@/DataTable/ServerTable.jsx';
export {buildChipConfig} from '@/DataTable/buildChipConfig.js';
export {detailColumn, facetColumn, textColumn} from '@/DataTable/columns.jsx';
export {TableFilterContext, useTableFilter} from '@/DataTable/filterContext.js';
export {toServerTableParams} from '@/DataTable/serverTableParams.js';
export {buildTableActors, tableMachine} from '@/DataTable/tableMachine.js';
export {useDebouncedFilter} from '@/DataTable/useDebouncedFilter.js';
export {FILTER_KINDS, isFilterActive, useTableState} from '@/DataTable/useTableState.js';
