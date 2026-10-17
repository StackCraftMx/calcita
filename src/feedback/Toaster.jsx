// El <Toaster/> de sonner, montado UNA sola vez en la raíz de la aplicación: dos montados son dos avisos por cada aviso.
//
// Abajo a la izquierda: arriba taparía la barra superior (nombre y "Salir"); a la derecha, el panel de detalle (que
// abre del lado derecho, con su botón de descarga abajo) y la paginación de las tablas de MUI.
//
// Sigue el modo claro / oscuro de MUI (va DENTRO del ThemeProvider de la aplicación): sin eso, un aviso blanco sobre la app en
// oscuro es una linterna. Con el vidrio del tema (createToolkitTheme({glass: true})), los avisos también son de vidrio
// (glassToasterStyles.js).
//
// Genérico del paquete: function (regla de la casa).
import {Toaster as SonnerToaster} from 'sonner';
import GlobalStyles from '@mui/material/GlobalStyles';
import {useColorScheme, useTheme} from '@mui/material/styles';

import {isGlassTheme} from '@/theme/glassSurface.js';
import {glassToasterStylesOf} from '@/theme/glassToasterStyles.js';
import {resolvedColorModeOf} from '@/ui/navigation/colorMode.js';

export default function Toaster() {
    const theme = useTheme();
    const {mode, systemMode} = useColorScheme();
    return (
        <>
            {isGlassTheme(theme) && <GlobalStyles styles={glassToasterStylesOf(theme)} />}
            <SonnerToaster position="bottom-left" richColors closeButton theme={resolvedColorModeOf(mode, systemMode)} />
        </>
    );
}
