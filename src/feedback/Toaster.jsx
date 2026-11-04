// El <Toaster/> de sonner, montado UNA sola vez en la raíz de la aplicación: dos montados son dos avisos por cada aviso.
//
// Por omisión abajo a la izquierda: arriba taparía la barra superior (nombre y "Salir"); a la derecha, el panel de detalle
// (que abre del lado derecho, con su botón de descarga abajo) y la paginación de las tablas de MUI. Pero dónde estorba un
// aviso depende de cada aplicación (con el pie del menú lateral abajo a la izquierda, ahí tapa): `position` lo cambia con
// TOASTER_POSITION, y lo demás de sonner (duration, offset, visibleToasts, toastOptions…) pasa tal cual. Sin nada, igual
// que antes.
//
// Sigue el modo claro / oscuro de MUI (va DENTRO del ThemeProvider de la aplicación): sin eso, un aviso blanco sobre la app en
// oscuro es una linterna. Con el vidrio del tema (createToolkitTheme({glass: true})), los avisos también son de vidrio
// (glassToasterStyles.js), en cualquier esquina.
//
// Genérico del paquete: function (regla de la casa).
import {Toaster as SonnerToaster} from 'sonner';
import GlobalStyles from '@mui/material/GlobalStyles';
import {useColorScheme, useTheme} from '@mui/material/styles';

import {isGlassTheme} from '@/theme/glassSurface.js';
import {glassToasterStylesOf} from '@/theme/glassToasterStyles.js';
import {resolvedColorModeOf} from '@/ui/navigation/colorMode.js';

/** Dónde salen los avisos (los nombres de sonner). */
export const TOASTER_POSITION = Object.freeze({
    topLeft: 'top-left',
    topCenter: 'top-center',
    topRight: 'top-right',
    bottomLeft: 'bottom-left',
    bottomCenter: 'bottom-center',
    bottomRight: 'bottom-right',
});

/**
 * @param {import('sonner').ToasterProps} props lo de sonner, tal cual (https://sonner.emilkowal.ski/toaster: duration,
 *     offset, mobileOffset, visibleToasts, toastOptions…). Por omisión: position abajo a la izquierda (uno de
 *     TOASTER_POSITION), richColors y closeButton sí, y theme el modo de MUI que se ve en pantalla
 */
export default function Toaster({position = TOASTER_POSITION.bottomLeft, richColors = true, closeButton = true, ...sonnerProps}) {
    const theme = useTheme();
    const {mode, systemMode} = useColorScheme();
    return (
        <>
            {isGlassTheme(theme) && <GlobalStyles styles={glassToasterStylesOf(theme)} />}
            <SonnerToaster theme={resolvedColorModeOf(mode, systemMode)} {...sonnerProps} position={position} richColors={richColors} closeButton={closeButton} />
        </>
    );
}
