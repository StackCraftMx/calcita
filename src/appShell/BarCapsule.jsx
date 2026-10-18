// Una cápsula de la barra de arriba (como las de las ventanas de macOS Tahoe): un grupo de botones juntos, con vidrio si el
// tema lo trae y, con el minimalista, un bloque del tono de las tarjetas sin borde ni sombra. La usan el marco (la ☰ con el
// nombre, la cuenta), las acciones de cada pantalla (BarActions) y el proyecto para algo suyo que deba verse igual (unos
// botones encima de un mapa, una barra de herramientas propia).
//
// Con vidrio, los botones de adentro van SIEMPRE del color del texto, aunque quien los usa les ponga color (color="primary"
// o un sx propio): en las barras de Apple los símbolos son de un solo color y el color queda para el contenido (HIG
// Toolbars y Color). Lo pidió el autor. Se logra con un selector de dos clases, que le gana a la clase de color del botón;
// los deshabilitados se quedan con su gris. Con el minimalista conservan su color.
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';

import {paletteOf} from '@/theme/components/paletteOf.js';
import {glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';

// lo alto de una cápsula (px): cabe en el alto de siempre de la barra con aire arriba y abajo
export const BAR_CAPSULE_HEIGHT_PIXELS = 48;

/**
 * Lo demás va al div de la cápsula: aria-label (el nombre del grupo para quien usa lector de pantalla), id, onClick…
 * role va por omisión en 'group' (lo que se agrupa se anuncia junto).
 *
 * @param {Omit<import('react').HTMLAttributes<HTMLDivElement>, 'children'> & {children: import('react').ReactNode, sx?: object|Function|Array<any>}} props
 *     children: los botones del grupo; sx: estilos propios, encima de los de la cápsula
 */
export default function BarCapsule({children, sx, role = 'group', ...rest}) {
    return (
        <Box role={role} {...rest}
             sx={[(theme) => ({
                 ...(isGlassTheme(theme) ? glassStylesOf(theme, {isControl: true}) : {backgroundColor: paletteOf(theme).background.paper}),
                 ...(isGlassTheme(theme) && {
                     '& .MuiIconButton-root:not(.Mui-disabled), & .MuiButton-root:not(.Mui-disabled)': {color: paletteOf(theme).text.primary},
                 }),
                 display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, minWidth: 0,
                 height: BAR_CAPSULE_HEIGHT_PIXELS, px: 0.75, borderRadius: '999px',
             }), ...(Array.isArray(sx) ? sx : [sx])]}>
            {children}
        </Box>
    );
}
