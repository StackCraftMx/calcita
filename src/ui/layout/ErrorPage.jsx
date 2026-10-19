// La pantalla de un error de navegación: la página no existe (404), no tiene permiso (403) o algo falló (500). Dice en
// palabras normales qué pasó y qué hacer, con el número chico abajo como referencia técnica, y el botón para salir de ahí.
//
//   <ErrorPage kind={ERROR_PAGE_KIND.notFound} />                       el 404 del router (ruta '*')
//   <ErrorPage kind={ERROR_PAGE_KIND.serverError} onRetry={reload} />   la pantalla tronó (errorElement del router)
//   <ErrorPage kind={ERROR_PAGE_KIND.newVersion} onRetry={reload} />    se publicó otra versión con la pestaña abierta
//
// Los textos salen del paquete (namespace errorPage) en el idioma activo; title y text los cambian para un caso propio, y
// `texts` cualquier otro («Ir al inicio», «Intentar de nuevo»).
//
// Se extiende sin tocar el framework: botones suyos junto a los de la casa (extraActions: «Contactar a soporte») o en lugar
// de ellos (actions), algo debajo del texto (children: el teléfono de soporte, un folio), otro ícono (icon) y el evento de
// «Ir al inicio» (onGoHome). La de «sin permiso» de las rutas se cambia con withAccess(…, {fallback}) y la de error de ruta
// pasándole estas mismas props a RouteErrorScreen (/react-router).
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SystemUpdateAltRoundedIcon from '@mui/icons-material/SystemUpdateAltRounded';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';

/** Los errores que tiene pantalla propia. */
export const ERROR_PAGE_KIND = Object.freeze({notFound: 'notFound', forbidden: 'forbidden', serverError: 'serverError', newVersion: 'newVersion'});

// el ícono, el color y el código HTTP de cada uno (el código va chico: es la referencia técnica, no el mensaje)
const ERROR_PAGE_LOOK = Object.freeze({
    [ERROR_PAGE_KIND.notFound]: {Icon: TravelExploreOutlinedIcon, color: 'info', httpStatus: 404},
    [ERROR_PAGE_KIND.forbidden]: {Icon: LockOutlinedIcon, color: 'warning', httpStatus: 403},
    [ERROR_PAGE_KIND.serverError]: {Icon: ErrorOutlineOutlinedIcon, color: 'error', httpStatus: 500},
    // no es un error de nadie: se publicó otra versión; sin código, y el botón dice «Recargar»
    [ERROR_PAGE_KIND.newVersion]: {Icon: SystemUpdateAltRoundedIcon, color: 'info', httpStatus: null, retryKey: 'reload'},
});
const ICON_PIXELS = 56;

/**
 * @param {object} props
 * @param {string} props.kind uno de ERROR_PAGE_KIND
 * @param {string} [props.title] ya traducido; por omisión el del paquete
 * @param {import('react').ReactNode} [props.text] ya traducido; por omisión el del paquete
 * @param {string} [props.homePath] a dónde lleva «Ir al inicio» (por omisión '/')
 * @param {() => void} [props.onRetry] con él sale «Intentar de nuevo»
 * @param {() => void} [props.onGoHome] al picar «Ir al inicio», antes de ir (para avisar o limpiar algo)
 * @param {import('react').ReactNode} [props.extraActions] botones suyos junto a los de la casa
 * @param {import('react').ReactNode} [props.actions] botones suyos EN LUGAR de los de la casa
 * @param {import('react').ReactNode} [props.icon] otro ícono; por omisión el de cada error
 * @param {import('react').ReactNode} [props.children] algo debajo del texto (el teléfono de soporte, un folio)
 * @param {object} [props.texts] los textos que cambian, con la forma de `errorPage` en los textos del paquete:
 *     {goHome: 'Volver al tablero', notFound: {title: '…'}}
 */
export default function ErrorPage({
    kind, title, text, homePath = '/', onRetry, onGoHome, extraActions, actions, icon, children, texts,
}) {
    const {t} = useToolkitTranslation('errorPage', texts);
    const {Link} = useToolkitNavigation();
    const look = ERROR_PAGE_LOOK[kind] ?? ERROR_PAGE_LOOK[ERROR_PAGE_KIND.serverError];

    return (
        <Stack spacing={2} sx={{alignItems: 'center', textAlign: 'center', py: {xs: 6, md: 10}, px: 2, maxWidth: 560, mx: 'auto'}}>
            {icon ?? <look.Icon color={look.color} sx={{fontSize: ICON_PIXELS}} />}
            <Typography variant="h4" component="h1">{title ?? t(`${kind}.title`)}</Typography>
            <Typography variant="body1" color="text.secondary">{text ?? t(`${kind}.text`)}</Typography>
            {children}
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={1.5} useFlexGap sx={{pt: 1, flexWrap: 'wrap', justifyContent: 'center'}}>
                {actions ?? (
                    <>
                        {onRetry && <Button variant="contained" onClick={onRetry}>{t(look.retryKey ?? 'retry')}</Button>}
                        <Button variant={onRetry ? 'outlined' : 'contained'} component={Link} to={homePath} onClick={onGoHome}>{t('goHome')}</Button>
                        {extraActions}
                    </>
                )}
            </Stack>
            {look.httpStatus && <Typography variant="caption" color="text.disabled">{look.httpStatus}</Typography>}
        </Stack>
    );
}
