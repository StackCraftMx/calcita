// Las pestañas entre los formularios de ejemplo.
//
// Lo renderiza la app: arrow (regla de la casa).
import {RouteTabs, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CUSTOMERS_PATHS} from '@/modules/customers/customersPaths.js';

const FORM_TABS = Object.freeze([
    {path: CUSTOMERS_PATHS.formik, labelKey: 'nav.formik'},
    {path: CUSTOMERS_PATHS.hookForm, labelKey: 'nav.hookForm'},
    {path: CUSTOMERS_PATHS.creditRequest, labelKey: 'nav.creditRequest'},
    {path: CUSTOMERS_PATHS.terms, labelKey: 'nav.terms'},
]);

// las pestañas por ruta del paquete (RouteTabs): cada formulario es su página y la pestaña activa sale de la dirección
export const FormsNav = () => {
    const {t} = useToolkitTranslation('customers');
    return (
        <RouteTabs ariaLabel={t('nav.ariaLabel')} tabs={FORM_TABS.map((tab) => ({to: tab.path, label: t(tab.labelKey)}))}
                   sx={{mb: 2, borderBottom: 1, borderColor: 'divider'}} />
    );
};
