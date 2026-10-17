// La pantalla de un error de navegación: la página no existe (404), no tiene permiso (403) o algo falló (500). Dice en
// palabras normales qué pasó y qué hacer, con el número chico abajo como referencia técnica, y el botón para salir de ahí.
//
//   <ErrorPage kind={ERROR_PAGE_KIND.notFound} />                       el 404 del router (ruta '*')
//   <ErrorPage kind={ERROR_PAGE_KIND.serverError} onRetry={reload} />   la pantalla tronó (errorElement del router)
//
// Los textos salen del paquete (namespace errorPage) en el idioma activo; title y text los cambian para un caso propio.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';

/** Los errores que tiene pantalla propia. */
export const ERROR_PAGE_KIND = Object.freeze({notFound: 'notFound', forbidden: 'forbidden', serverError: 'serverError'});

// el ícono, el color y el código HTTP de cada uno (el código va chico: es la referencia técnica, no el mensaje)
const ERROR_PAGE_LOOK = Object.freeze({
    [ERROR_PAGE_KIND.notFound]: {Icon: TravelExploreOutlinedIcon, color: 'info', httpStatus: 404},
    [ERROR_PAGE_KIND.forbidden]: {Icon: LockOutlinedIcon, color: 'warning', httpStatus: 403},
    [ERROR_PAGE_KIND.serverError]: {Icon: ErrorOutlineOutlinedIcon, color: 'error', httpStatus: 500},
});
const ICON_PIXELS = 56;

/**
 * @param {object} props
 * @param {string} props.kind uno de ERROR_PAGE_KIND
 * @param {string} [props.title] ya traducido; por omisión el del paquete
 * @param {import('react').ReactNode} [props.text] ya traducido; por omisión el del paquete
 * @param {string} [props.homePath] a dónde lleva «Ir al inicio» (por omisión '/')
 * @param {() => void} [props.onRetry] con él sale «Intentar de nuevo»
 */
export default function ErrorPage({kind, title, text, homePath = '/', onRetry}) {
    const {t} = useToolkitTranslation('errorPage');
    const {Link} = useToolkitNavigation();
    const look = ERROR_PAGE_LOOK[kind] ?? ERROR_PAGE_LOOK[ERROR_PAGE_KIND.serverError];

    return (
        <Stack spacing={2} sx={{alignItems: 'center', textAlign: 'center', py: {xs: 6, md: 10}, px: 2, maxWidth: 560, mx: 'auto'}}>
            <look.Icon color={look.color} sx={{fontSize: ICON_PIXELS}} />
            <Typography variant="h4" component="h1">{title ?? t(`${kind}.title`)}</Typography>
            <Typography variant="body1" color="text.secondary">{text ?? t(`${kind}.text`)}</Typography>
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={1.5} sx={{pt: 1}}>
                {onRetry && <Button variant="contained" onClick={onRetry}>{t('retry')}</Button>}
                <Button variant={onRetry ? 'outlined' : 'contained'} component={Link} to={homePath}>{t('goHome')}</Button>
            </Stack>
            <Typography variant="caption" color="text.disabled">{look.httpStatus}</Typography>
        </Stack>
    );
}
