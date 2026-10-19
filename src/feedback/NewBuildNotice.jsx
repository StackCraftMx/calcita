// Aviso «Hay una versión nueva» con su botón de recargar.
//
// Sale cuando el servidor anuncia una compilación del front distinta a la que corre en la pestaña
// (observability/publishedBuild.js) y se queda hasta que la persona recarga. No recarga solo: la persona puede estar a
// media captura y decide cuándo.
//
// Dos formas, el mismo aviso:
//   - «ribbon» (por omisión): una franja a todo lo ancho que el proyecto pone donde se vea siempre, normalmente dentro de
//     su AppBar, debajo de la barra. Se arma con el Alert de MUI, que ya trae sus colores para claro y oscuro.
//   - «floating»: una cápsula de vidrio que flota aparte, sin tocar la barra, como el reproductor chico que Apple pone
//     encima de las pestañas en el iPhone. En escritorio, centrada debajo de la barra de arriba; en el teléfono, encima de
//     la barra de pestañas. Es la que usa AppLayout con vidrio: dentro de la cápsula de la barra la franja la hacía crecer al
//     doble, la curva cortaba el texto y el botón se salía por la orilla (lo reportaron).
// Sin compilación nueva no pinta nada ni ocupa lugar.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import {useNewBuildPublished} from '@/observability/publishedBuild.js';
import {GLASS_PANEL_GAP_PIXELS, aboveMobileTabBarOf} from '@/appShell/shellSizes.js';
import {minimalFloatingStylesOf} from '@/theme/components/minimalComponents.js';
import {glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';
import {APP_BAR_HEIGHT} from '@/ui/layout/appBarHeight.js';

/** Las formas del aviso: franja (dentro de la barra del proyecto) o cápsula flotante (la del marco con vidrio). */
export const NEW_BUILD_NOTICE_VARIANT = Object.freeze({ribbon: 'ribbon', floating: 'floating'});

// lo que se separa la cápsula de la barra (px) y lo que tarda en aparecer (ms)
const FLOATING_GAP_PIXELS = 8;
const FLOATING_ENTER_MILLISECONDS = 280;

/** Lo que hace el botón si el proyecto no dice otra cosa: recargar la página, que trae la compilación nueva. */
function reloadPage() {
    window.location.reload();
}

/**
 * La cápsula flotante: fija a la ventana y centrada. En escritorio queda debajo de la barra de arriba (su alto real,
 * APP_BAR_HEIGHT); en el teléfono, encima de la barra de pestañas (su alto, sus separaciones y la zona del gesto de inicio).
 *
 * Va centrada en la VENTANA, debajo del centro de la barra (que va de orilla a orilla): centrada en el contenido quedaba
 * corrida a la derecha respecto a la barra (lo reportaron).
 *
 * @param {object} theme
 * @returns {object}
 */
function floatingSxOf(theme) {
    return {
        // con vidrio, cápsula de vidrio; con el minimalista (barra en cápsulas), sólida del gris de lo que flota
        ...(isGlassTheme(theme) ? glassStylesOf(theme) : minimalFloatingStylesOf(theme)),
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: theme.zIndex.appBar,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: 'max-content',
        maxWidth: `calc(100% - ${GLASS_PANEL_GAP_PIXELS * 2}px)`,
        borderRadius: '999px',
        py: 0.75,
        pl: 2,
        pr: 0.75,
        top: `calc(${APP_BAR_HEIGHT} + ${FLOATING_GAP_PIXELS}px)`,
        ...aboveMobileTabBarOf(FLOATING_GAP_PIXELS),
        // aparece subiendo un poco y aclarándose; sin movimiento si la persona lo pidió así en su equipo
        '@keyframes calcitaNoticeEnter': {
            from: {opacity: 0, transform: 'translate(-50%, 8px) scale(0.96)'},
            to: {opacity: 1, transform: 'translate(-50%, 0) scale(1)'},
        },
        animation: `calcitaNoticeEnter ${FLOATING_ENTER_MILLISECONDS}ms ${theme.transitions.easing.easeOut}`,
        '@media (prefers-reduced-motion: reduce)': {animation: 'none'},
    };
}

/**
 * @param {object} [props]
 * @param {string} [props.message] ya traducido; por omisión el del paquete (en la cápsula, el corto: common:newBuild.short)
 * @param {string} [props.reloadLabel] ya traducido; por omisión «Recargar»
 * @param {() => void} [props.onReload] por omisión recarga la página
 * @param {'ribbon'|'floating'} [props.variant] franja o cápsula flotante (NEW_BUILD_NOTICE_VARIANT); por omisión franja
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function NewBuildNotice({message, reloadLabel, onReload = reloadPage, variant = NEW_BUILD_NOTICE_VARIANT.ribbon, texts}) {
    const {t} = useToolkitTranslation('common', texts);
    const isNewBuildPublished = useNewBuildPublished();

    // guard clause: la compilación de la pestaña sigue siendo la publicada; el aviso no ocupa lugar
    if (!isNewBuildPublished) {
        return null;
    }

    const buttonLabel = reloadLabel ?? t('newBuild.reload');

    if (variant === NEW_BUILD_NOTICE_VARIANT.floating) {
        // el texto largo va para el lector de pantalla; a la vista, el corto (una cápsula de un renglón)
        return (
            <Box role="status" aria-live="polite" aria-label={message ?? t('newBuild.message')} sx={floatingSxOf}>
                <RefreshRoundedIcon fontSize="small" sx={{color: 'text.secondary'}} />
                <Typography variant="body2" noWrap sx={{fontWeight: 500, minWidth: 0}}>{message ?? t('newBuild.short')}</Typography>
                <Button size="small" variant="contained" onClick={onReload} sx={{flexShrink: 0}}>{buttonLabel}</Button>
            </Box>
        );
    }

    return (
        <Alert severity="warning" square role="status" aria-live="polite"
               sx={{py: 0, px: {xs: 2, md: 3}, alignItems: 'center'}}
               action={(
                   <Button size="small" variant="outlined" color="inherit" onClick={onReload} sx={{flexShrink: 0}}>
                       {buttonLabel}
                   </Button>
               )}>
            {message ?? t('newBuild.message')}
        </Alert>
    );
}
