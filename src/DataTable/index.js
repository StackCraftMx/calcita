// Barril de la tabla de servidor: lo que consume una pantalla (vía @/core).
export {default as AuditTrailDialog} from '@/DataTable/AuditTrailDialog.jsx';
export {default as AuditTrailTable} from '@/DataTable/AuditTrailTable.jsx';
export {default as EmptyState} from '@/DataTable/EmptyState.jsx';
export {default as FilterChips} from '@/DataTable/FilterChips.jsx';
export {default as GoToPage} from '@/DataTable/GoToPage.jsx';
export {SELECTION_PHONE_LAYOUT, TABLE_DENSITY, default as ServerTable} from '@/DataTable/ServerTable.jsx';
export {default as ServerTableFilterDrawer} from '@/DataTable/ServerTableFilterDrawer.jsx';
export {buildChipConfig} from '@/DataTable/buildChipConfig.js';
export {
    ACTIONS_COLUMN_FIELD, DETAIL_COLUMN_FIELD, actionsColumn, detailColumn, facetColumn, stackedColumn, statusColumn, textColumn,
} from '@/DataTable/columns.jsx';
export {default as StackedCell} from '@/DataTable/StackedCell.jsx';
export {statusColumnWidthOf, textWidthOf} from '@/DataTable/columnWidths.js';
export {fixedColumnOffsetsOf, fixedFieldsOf} from '@/DataTable/fixedColumns.js';
export {TableViewToggle, default as TableCardsView} from '@/DataTable/TableCardsView.jsx';
export {TABLE_VIEW, useTableView} from '@/DataTable/useTableView.js';
export {TableFilterContext, useTableFilter} from '@/DataTable/filterContext.js';
export {toServerTableParams} from '@/DataTable/serverTableParams.js';
export {buildTableActors, tableMachine} from '@/DataTable/tableMachine.js';
export {useDebouncedFilter} from '@/DataTable/useDebouncedFilter.js';
export {FILTER_KINDS, isFilterActive, useTableState} from '@/DataTable/useTableState.js';
