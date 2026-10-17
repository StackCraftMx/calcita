// Un panel que flota sobre el contenido: los controles encima de un mapa, una barra de acciones pegada abajo, un letrero
// encima de una foto. Es de vidrio si el tema lo trae prendido (createToolkitTheme({glass: true})) y una tarjeta con sombra
// si no: la pantalla se escribe una vez y sirve con los dos temas.
//
// No es para el contenido (una ficha, un formulario, una tabla): la guía del vidrio pide el texto largo sobre superficies
// sólidas. Para eso está SectionCard.
//
//   <GlassPanel sx={{position: 'absolute', top: 16, right: 16, p: 1}}>…los botones del mapa…</GlassPanel>
//
// Genérico del paquete: function (regla de la casa).
import Paper from '@mui/material/Paper';

import {GLASS_PANEL_RADIUS_PIXELS, glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';

// sin vidrio, la sombra de lo que flota (la misma de los menús de MUI)
const SOLID_FLOATING_ELEVATION = 8;

/**
 * El panel con su superficie: vidrio o sombra, según el tema.
 *
 * @param {object} theme
 * @returns {object}
 */
function floatingSurfaceOf(theme) {
    return {
        borderRadius: `${GLASS_PANEL_RADIUS_PIXELS}px`,
        ...(isGlassTheme(theme) ? glassStylesOf(theme) : {boxShadow: theme.shadows[SOLID_FLOATING_ELEVATION]}),
    };
}

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {object|Function|Array} [props.sx] estilos propios: se suman y ganan
 * @param {import('react').ElementType} [props.component] por omisión 'div'
 */
export default function GlassPanel({children, sx, ...paperProps}) {
    return (
        <Paper elevation={0} {...paperProps} sx={[floatingSurfaceOf, ...(Array.isArray(sx) ? sx : [sx])]}>
            {children}
        </Paper>
    );
}
