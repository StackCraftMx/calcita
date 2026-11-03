// Pestañas por ruta: cada pestaña es una dirección, así se puede compartir la liga a una pestaña, regresar con «atrás» y
// abrirla en otra pestaña del navegador. Dos modos (mode):
//   path    cada pestaña es una página de las rutas del proyecto (to); la activa sale de la dirección
//   query   pestañas dentro de una misma pantalla, guardadas en la consulta (?tab=pagos); useActiveRouteTab dice cuál pintar
//
// Cada pestaña puede traer su ícono, un conteo (badge), su permiso (access, con la regla de ToolkitProvider: la que no se
// puede ver no sale) o estar apagada. Usa la navegación que conectó el proyecto (react-router, Next o la del navegador).
// En el teléfono se deslizan de lado.
//
//   <RouteTabs ariaLabel="Secciones del cliente" tabs={[
//       {to: `/customers/${id}`, label: 'Resumen', exact: true},
//       {to: `/customers/${id}/payments`, label: 'Pagos', badge: 3},
//       {to: `/customers/${id}/files`, label: 'Documentos', access: {ability: 'files.view'}},
//   ]} />
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaRouteTabs con defaultProps y
// styleOverrides de sus partes: root, tab, badge.
//
// Genérico del paquete: function (regla de la casa).
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import {useAccessChecker} from '@/access/useCan.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {activeRouteTabOf, queryTabOf, searchWithTab} from '@/ui/navigation/routeTabMatching.js';

/** Dónde vive la pestaña: en la ruta o en la consulta. */
export const ROUTE_TABS_MODE = Object.freeze({path: 'path', query: 'query'});
const DEFAULT_PARAM_NAME = 'tab';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaRouteTabs)
const THEME_NAME = 'CalcitaRouteTabs';
const RouteTabsRoot = piecePart(THEME_NAME, 'Root', Tabs);
const RouteTab = piecePart(THEME_NAME, 'Tab', Tab);
const RouteTabBadge = piecePart(THEME_NAME, 'Badge', Chip);

/**
 * Las pestañas que esta sesión puede ver.
 *
 * @param {object[]} tabs
 * @param {(access: object|undefined) => boolean} canAccess
 * @returns {object[]}
 */
const visibleTabsOf = (tabs, canAccess) => tabs.filter((tab) => !tab.hidden && canAccess(tab.access));

/**
 * La pestaña activa, para que la pantalla pinte lo suyo (sobre todo con mode query: la pantalla es una sola).
 *
 * @param {object[]} tabs las mismas de RouteTabs
 * @param {{mode?: string, paramName?: string}} [options]
 * @returns {string|null} el `to` (por ruta) o el `value` (por consulta) de la activa
 */
export function useActiveRouteTab(tabs, {mode = ROUTE_TABS_MODE.path, paramName = DEFAULT_PARAM_NAME} = {}) {
    const {useLocation} = useToolkitNavigation();
    const location = useLocation();
    const visibleTabs = visibleTabsOf(tabs, useAccessChecker());
    return mode === ROUTE_TABS_MODE.query
        ? queryTabOf(visibleTabs, location.search, paramName)
        : activeRouteTabOf(visibleTabs, location.pathname);
}

/**
 * @param {object} props
 * @param {Array<{to?: string, value?: string, label: import('react').ReactNode, icon?: import('react').ReactElement, badge?: import('react').ReactNode, access?: object, exact?: boolean, disabled?: boolean, hidden?: boolean}>} props.tabs
 *     to (por ruta) o value (por consulta); label ya traducido; badge: un conteo o un texto corto junto a la etiqueta
 * @param {string} props.ariaLabel ya traducido: de qué son estas pestañas (para el lector de pantalla)
 * @param {'path'|'query'} [props.mode] ROUTE_TABS_MODE
 * @param {string} [props.paramName] con mode query: el nombre en la consulta (por omisión 'tab')
 * @param {(tab: object) => void} [props.onChange] avisa la pestaña que se eligió (la navegación ya la hace la liga)
 * @param {object} [props.sx]
 */
export default function RouteTabs(props) {
    const {tabs, ariaLabel, mode = ROUTE_TABS_MODE.path, paramName = DEFAULT_PARAM_NAME, onChange, sx, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {useLocation, Link} = useToolkitNavigation();
    const location = useLocation();
    const visibleTabs = visibleTabsOf(tabs, useAccessChecker());
    const isQuery = mode === ROUTE_TABS_MODE.query;
    const activeKey = isQuery ? queryTabOf(visibleTabs, location.search, paramName) : activeRouteTabOf(visibleTabs, location.pathname);

    return (
        // value false: ninguna pestaña coincide (MUI avisa en la consola si el valor no es de ninguna)
        <RouteTabsRoot value={activeKey ?? false} variant="scrollable" allowScrollButtonsMobile aria-label={ariaLabel}
                       ownSx={{minWidth: 0}} sx={sx}>
            {visibleTabs.map((tab) => {
                const key = isQuery ? tab.value : tab.to;
                const href = isQuery ? `${location.pathname}${searchWithTab(location.search, paramName, tab.value)}` : tab.to;
                const label = tab.badge === undefined || tab.badge === null ? tab.label : (
                    <Stack component="span" direction="row" sx={{alignItems: 'center', gap: 0.75}}>
                        <span>{tab.label}</span>
                        <RouteTabBadge size="small" label={tab.badge} ownSx={{height: 20, fontSize: 12, fontWeight: 600}} />
                    </Stack>
                );
                return (
                    <RouteTab key={key} value={key} label={label} icon={tab.icon} iconPosition="start" disabled={tab.disabled}
                              component={Link} to={href} onClick={() => onChange?.(tab)} ownSx={{minHeight: 48}} />
                );
            })}
        </RouteTabsRoot>
    );
}
