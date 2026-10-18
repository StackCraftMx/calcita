// La entrada del catálogo en el menú de la app (composeMenu del framework la descubre sola), con una hija por grupo de
// piezas: así cada componente se revisa por separado, en claro y en oscuro, con y sin vidrio.
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SmartButtonOutlinedIcon from '@mui/icons-material/SmartButtonOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined';
import WebAssetOutlinedIcon from '@mui/icons-material/WebAssetOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';

import {CATALOG_PATHS} from '@/modules/catalog/catalogPaths.js';

export const order = 65;

// sin access: lo ve cualquiera con sesión

export function buildMenuItem() {
    return {
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
            {to: CATALOG_PATHS.charts, labelKey: 'catalog:nav.charts', Icon: BarChartOutlinedIcon},
            {to: CATALOG_PATHS.timeline, labelKey: 'catalog:nav.timeline', Icon: TimelineOutlinedIcon},
            {to: CATALOG_PATHS.translations, labelKey: 'catalog:nav.translations', Icon: TranslateOutlinedIcon},
            {to: CATALOG_PATHS.api, labelKey: 'catalog:nav.api', Icon: CloudSyncOutlinedIcon},
            {to: CATALOG_PATHS.security, labelKey: 'catalog:nav.security', Icon: GppGoodOutlinedIcon},
        ],
    };
}
