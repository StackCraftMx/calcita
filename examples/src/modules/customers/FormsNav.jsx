// Las pestañas entre los tres formularios de ejemplo.
//
// Lo renderiza la app: arrow (regla de la casa).
import {Link, useLocation} from 'react-router';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

import {CUSTOMERS_PATHS} from '@/modules/customers/customersPaths.js';

const FORM_TABS = Object.freeze([
    {path: CUSTOMERS_PATHS.formik, labelKey: 'nav.formik'},
    {path: CUSTOMERS_PATHS.hookForm, labelKey: 'nav.hookForm'},
    {path: CUSTOMERS_PATHS.creditRequest, labelKey: 'nav.creditRequest'},
]);

export const FormsNav = () => {
    const {t} = useToolkitTranslation('customers');
    const {pathname} = useLocation();

    return (
        <Tabs value={FORM_TABS.some((tab) => tab.path === pathname) ? pathname : false} variant="scrollable" allowScrollButtonsMobile
              aria-label={t('nav.ariaLabel')} sx={{mb: 2, borderBottom: 1, borderColor: 'divider'}}>
            {FORM_TABS.map((tab) => <Tab key={tab.path} value={tab.path} label={t(tab.labelKey)} component={Link} to={tab.path} />)}
        </Tabs>
    );
};
