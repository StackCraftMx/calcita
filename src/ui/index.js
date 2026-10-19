// Agregador interno de componentes de interfaz genéricos (no saben de negocio: todo llega por props).
//
// Carpetas por propósito, para que un archivo se encuentre por su nombre y su carpeta:
//   layout/      lo que arma el esqueleto de una pantalla
//   navigation/  moverse y ubicarse
//   filters/     filtros de listados
//   labels/      chips y etiquetas desde diccionarios
//   actions/     menús de acción
//   metrics/     tarjetas KPI y calendario de actividad (las gráficas con Recharts van en charts.js)
//   timeline/    líneas de tiempo (van en timeline.js, porque usan @mui/lab)
// Sin index.js por subcarpeta: desde afuera la puerta es el punto de entrada del paquete (src/index.js).

// ─── layout ──────────────────────────────────────────────────────────────────
export {APP_BAR_HEIGHT_CSS_VARIABLE, SCROLL_MARGIN_BELOW_APP_BAR, useAppBarHeightPublisher} from '@/ui/layout/appBarHeight.js';
export {default as CollapsibleSection} from '@/ui/layout/CollapsibleSection.jsx';
export {default as ContentDialog} from '@/ui/layout/ContentDialog.jsx';
export {default as DefinitionList} from '@/ui/layout/DefinitionList.jsx';
export {default as DetailHeader} from '@/ui/layout/DetailHeader.jsx';
export {default as FullPageLoader} from '@/ui/layout/FullPageLoader.jsx';
export {default as GlassLensFilter} from '@/ui/layout/GlassLensFilter.jsx';
export {default as GlassPanel} from '@/ui/layout/GlassPanel.jsx';
export {default as PageHeader} from '@/ui/layout/PageHeader.jsx';
export {default as PageHeading} from '@/ui/layout/PageHeading.jsx';
export {default as ProfileHeader} from '@/ui/layout/ProfileHeader.jsx';
export {default as ScrollableRow, scrollableRow} from '@/ui/layout/ScrollableRow.jsx';
export {default as SectionCard} from '@/ui/layout/SectionCard.jsx';

// ─── navigation ──────────────────────────────────────────────────────────────
export {default as BackButton} from '@/ui/navigation/BackButton.jsx';
export {default as ColorSchemeToggle} from '@/ui/navigation/ColorSchemeToggle.jsx';
export {default as DocumentTitle} from '@/ui/navigation/DocumentTitle.jsx';
export {LANGUAGES, default as LanguageToggle} from '@/ui/navigation/LanguageToggle.jsx';
export {default as FontSizeToggle} from '@/ui/navigation/FontSizeToggle.jsx';
export {FONT_SIZE_LEVELS} from '@/ui/navigation/fontSizeLevels.js';
export {default as PageBreadcrumbs} from '@/ui/navigation/PageBreadcrumbs.jsx';

// ─── filters ─────────────────────────────────────────────────────────────────
export {default as DateRangeFilter} from '@/ui/filters/DateRangeFilter.jsx';
export {default as PeriodRangeSelector} from '@/ui/filters/PeriodRangeSelector.jsx';
export {default as QuickFilters} from '@/ui/filters/QuickFilters.jsx';
export {default as SegmentedControl, SEGMENTED_CONTROL_SX} from '@/ui/filters/SegmentedControl.jsx';

// ─── labels ──────────────────────────────────────────────────────────────────
export {default as DictionaryText} from '@/ui/labels/DictionaryText.jsx';
export {default as StatusChip} from '@/ui/labels/StatusChip.jsx';
export {default as Tag} from '@/ui/labels/Tag.jsx';

// ─── actions ─────────────────────────────────────────────────────────────────
export {default as CopyButton} from '@/ui/actions/CopyButton.jsx';
export {default as DownloadMenu} from '@/ui/actions/DownloadMenu.jsx';
export {default as SecretField} from '@/ui/actions/SecretField.jsx';

// ─── metrics ─────────────────────────────────────────────────────────────────
export {default as CalendarHeatmap} from '@/ui/metrics/CalendarHeatmap.jsx';
export {TREND_DIRECTION, default as MetricCard} from '@/ui/metrics/MetricCard.jsx';
export {CHART_VIEW, default as TableToggle} from '@/ui/metrics/TableToggle.jsx';
