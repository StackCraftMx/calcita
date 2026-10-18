// La puerta de core: lo que comparten dos o más módulos. Desde afuera se importa siempre de aquí (@/core); adentro de
// core, por su ruta. Core no importa módulos ni páginas.
export {APP_PATHS, ORDERS_TABLE_PREFIX, orderDetailPathOf, ordersListFilteredBy} from '@/core/appPaths.js';
export {coreTexts} from '@/core/coreTexts.js';
export {MENU_BADGE_KEYS} from '@/core/menuBadgeKeys.js';
export {ORDER_STATUS} from '@/core/orderStatus.js';
export {AppThemeChoiceContext, GLASS_MODES, useAppThemeChoice} from '@/core/themeChoice.js';
export {
    DEFAULT_CORNER_RADIUS, STACKCRAFT_COLORS, THEME_COLOR_KEYS, changedColorsOf, darkStatusColorOf, isStatusColor, paletteWithColors,
} from '@/core/themeColors.js';
