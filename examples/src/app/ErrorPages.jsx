// Las páginas de error de la app con lo que el proyecto les suma (ErrorPage de la casa con sus props):
//   - NotFoundPage (la ruta que no existe): un botón suyo a los pedidos junto a «Ir al inicio» y una línea de ayuda;
//   - ForbiddenPage (sin permiso, withAccess(…, {fallback})): «Pedir acceso», que avisa a administración (de mentira).
//
// Lo renderiza la app: arrow (regla de la casa).
import {Link} from 'react-router';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {ERROR_PAGE_KIND, ErrorPage, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';

import {APP_PATHS} from '@/core';

export const NotFoundPage = () => {
    const {t} = useToolkitTranslation('shell');
    return (
        <ErrorPage kind={ERROR_PAGE_KIND.notFound}
                   extraActions={<Button variant="outlined" component={Link} to={APP_PATHS.orders}>{t('errorPages.goOrders')}</Button>}>
            <Typography variant="body2" color="text.secondary">{t('errorPages.support')}</Typography>
        </ErrorPage>
    );
};

export const ForbiddenPage = () => {
    const {t} = useToolkitTranslation('shell');
    return (
        <ErrorPage kind={ERROR_PAGE_KIND.forbidden}
                   extraActions={<Button variant="outlined" onClick={() => toastSuccess(t('errorPages.accessRequested'))}>{t('errorPages.requestAccess')}</Button>} />
    );
};
