// Las pestañas de Sucursales: el mapa y la ruta de reparto.
//
// Lo renderiza la app: arrow (regla de la casa).
import {RouteTabs, useToolkitTranslation} from '@stackcraftmx/calcita';

import {BRANCHES_PATH, DELIVERY_ROUTE_PATH} from '@/modules/branches/routes.js';

const BRANCH_TABS = Object.freeze([
    {path: BRANCHES_PATH, labelKey: 'nav.map'},
    {path: DELIVERY_ROUTE_PATH, labelKey: 'nav.route'},
]);

// las pestañas por ruta del paquete (RouteTabs): cada sección es su página y la pestaña activa sale de la dirección
export const BranchesNav = () => {
    const {t} = useToolkitTranslation('branches');
    return (
        <RouteTabs ariaLabel={t('nav.ariaLabel')} tabs={BRANCH_TABS.map((tab) => ({to: tab.path, label: t(tab.labelKey)}))}
                   sx={{borderBottom: 1, borderColor: 'divider'}} />
    );
};
