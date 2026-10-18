// Las entradas del catálogo en el menú de la app (composeMenu del framework las descubre solas): «Componentes» (los de MUI
// con el estilo de Calcita) y «Hecho en Calcita» (las piezas propias del framework), con una hija por grupo: así cada pieza
// se revisa por separado, en claro y en oscuro, con y sin vidrio. Cada página trae su código en JS y TS para copiar.
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SmartButtonOutlinedIcon from '@mui/icons-material/SmartButtonOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined';
import WebAssetOutlinedIcon from '@mui/icons-material/WebAssetOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';

import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';

import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';

import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';

import WebOutlinedIcon from '@mui/icons-material/WebOutlined';

import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';

import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';

import InstallMobileOutlinedIcon from '@mui/icons-material/InstallMobileOutlined';

import {BUILT_IN_PATHS, CATALOG_PATHS} from '@/modules/catalog/catalogPaths.js';

export const order = 65;

// sin access: lo ve cualquiera con sesión

export function buildMenuItems() {
    return [{
        to: CATALOG_PATHS.buttons,
        labelKey: 'catalog:menu.label',
        descriptionKey: 'catalog:menu.description',
        sectionKey: 'shell:sections.interface',
        Icon: WidgetsOutlinedIcon,
        children: [
            {to: CATALOG_PATHS.buttons, labelKey: 'catalog:nav.buttons', Icon: SmartButtonOutlinedIcon},
            {to: CATALOG_PATHS.chips, labelKey: 'catalog:nav.chips', Icon: LabelOutlinedIcon},
            {to: CATALOG_PATHS.inputs, labelKey: 'catalog:nav.inputs', Icon: TextFieldsOutlinedIcon},
            {to: CATALOG_PATHS.selection, labelKey: 'catalog:nav.selection', Icon: CheckBoxOutlinedIcon},
            {to: CATALOG_PATHS.feedback, labelKey: 'catalog:nav.feedback', Icon: NotificationsActiveOutlinedIcon},
            {to: CATALOG_PATHS.overlays, labelKey: 'catalog:nav.overlays', Icon: WebAssetOutlinedIcon},
            {to: CATALOG_PATHS.navigation, labelKey: 'catalog:nav.navigation', Icon: ExploreOutlinedIcon},
            {to: CATALOG_PATHS.surfaces, labelKey: 'catalog:nav.surfaces', Icon: ViewQuiltOutlinedIcon},
            {to: CATALOG_PATHS.timeline, labelKey: 'catalog:nav.timeline', Icon: TimelineOutlinedIcon},
        ],
    }, {
        to: BUILT_IN_PATHS.account,
        labelKey: 'catalog:builtIn.menu.label',
        descriptionKey: 'catalog:builtIn.menu.description',
        sectionKey: 'shell:sections.interface',
        Icon: HandymanOutlinedIcon,
        children: [
            {to: BUILT_IN_PATHS.account, labelKey: 'catalog:nav.account', Icon: AccountCircleOutlinedIcon},
            {to: BUILT_IN_PATHS.shell, labelKey: 'catalog:nav.shell', Icon: WebOutlinedIcon},
            {to: BUILT_IN_PATHS.permissions, labelKey: 'catalog:nav.permissions', Icon: AdminPanelSettingsOutlinedIcon},
            {to: BUILT_IN_PATHS.api, labelKey: 'catalog:nav.api', Icon: CloudSyncOutlinedIcon},
            {to: BUILT_IN_PATHS.serverTable, labelKey: 'catalog:nav.serverTable', Icon: TableChartOutlinedIcon},
            {to: BUILT_IN_PATHS.forms, labelKey: 'catalog:nav.forms', Icon: EditNoteOutlinedIcon},
            {to: BUILT_IN_PATHS.confirmAndNotify, labelKey: 'catalog:nav.confirmAndNotify', Icon: TaskAltOutlinedIcon},
            {to: BUILT_IN_PATHS.cards, labelKey: 'catalog:nav.cards', Icon: DashboardOutlinedIcon},
            {to: BUILT_IN_PATHS.dictionaries, labelKey: 'catalog:nav.dictionaries', Icon: MenuBookOutlinedIcon},
            {to: BUILT_IN_PATHS.formats, labelKey: 'catalog:nav.formats', Icon: PaymentsOutlinedIcon},
            {to: BUILT_IN_PATHS.downloads, labelKey: 'catalog:nav.downloads', Icon: DownloadOutlinedIcon},
            {to: BUILT_IN_PATHS.excelReports, labelKey: 'catalog:nav.excelReports', Icon: GridOnOutlinedIcon},
            {to: BUILT_IN_PATHS.uploads, labelKey: 'catalog:nav.uploads', Icon: CloudUploadOutlinedIcon},
            {to: BUILT_IN_PATHS.charts, labelKey: 'catalog:nav.charts', Icon: BarChartOutlinedIcon},
            {to: BUILT_IN_PATHS.maps, labelKey: 'catalog:nav.maps', Icon: MapOutlinedIcon},
            {to: BUILT_IN_PATHS.calendar, labelKey: 'catalog:nav.calendar', Icon: CalendarMonthOutlinedIcon},
            {to: BUILT_IN_PATHS.kanban, labelKey: 'catalog:nav.kanban', Icon: ViewKanbanOutlinedIcon},
            {to: BUILT_IN_PATHS.inbox, labelKey: 'catalog:nav.inbox', Icon: MailOutlineIcon},
            {to: BUILT_IN_PATHS.translations, labelKey: 'catalog:nav.translations', Icon: TranslateOutlinedIcon},
            {to: BUILT_IN_PATHS.themeAndGlass, labelKey: 'catalog:nav.themeAndGlass', Icon: PaletteOutlinedIcon},
            {to: BUILT_IN_PATHS.errorsAndLogs, labelKey: 'catalog:nav.errorsAndLogs', Icon: ReportGmailerrorredOutlinedIcon},
            {to: BUILT_IN_PATHS.installApp, labelKey: 'catalog:nav.installApp', Icon: InstallMobileOutlinedIcon},
            {to: BUILT_IN_PATHS.security, labelKey: 'catalog:nav.security', Icon: GppGoodOutlinedIcon},
        ],
    }];
}
