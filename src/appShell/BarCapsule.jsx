// Una cápsula de la barra de arriba (como las de las ventanas de macOS Tahoe): un grupo de botones juntos, con vidrio si el
// tema lo trae y, con el minimalista, un bloque del tono de las tarjetas sin borde ni sombra. La usan el marco (la ☰ con el
// nombre, la cuenta), las acciones de cada pantalla (BarActions) y el proyecto para algo suyo que deba verse igual (unos
// botones encima de un mapa, una barra de herramientas propia).
//
// Con vidrio, los botones de adentro van SIEMPRE del color del texto y sin relleno, borde ni sombra, aunque quien los usa
// les ponga color o variante (color="primary", variant="contained" u "outlined", un sx propio): en las barras de Apple los
// símbolos son de un solo color y el color queda para el contenido (HIG Toolbars y Color). Lo pidió el autor. OJO: al
// principio solo se quitó el color del texto y un «Redactar» con relleno seguía naranja en la barra (lo cachó el autor). Se
// logra con selectores de más clases que las del botón; los deshabilitados se quedan con su gris. Con el minimalista
// conservan su color.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaBarCapsule con defaultProps y
// styleOverrides.root (el sx de la pantalla sigue ganando a todo).
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';

import {paletteOf} from '@/theme/components/paletteOf.js';
import {glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaBarCapsule)
const THEME_NAME = 'CalcitaBarCapsule';
const CapsuleRoot = piecePart(THEME_NAME, 'Root', Box);

// lo alto de una cápsula (px): cabe en el alto de siempre de la barra con aire arriba y abajo
export const BAR_CAPSULE_HEIGHT_PIXELS = 48;

/**
 * Los botones de adentro de un solo color y sin relleno, borde ni sombra (la regla de la barra con vidrio). La usan también
 * la franja (BarActions) y lo que se ponga junto a la barra.
 *
 * @param {string} color el del texto de la barra ('inherit' en la franja)
 * @returns {object} estilos para el sx del contenedor
 */
export function monochromeButtonsSxOf(color) {
    return {
        '& .MuiIconButton-root:not(.Mui-disabled), & .MuiButton-root:not(.Mui-disabled)': {color},
        // un botón con relleno o con borde se queda como uno de texto: sin fondo, sin borde y sin sombra, también al pasar el
        // cursor (ahí lleva el velo de cualquier botón de texto). OJO: la barra es un Paper y el tema tiñe los botones con
        // borde «dentro de una tarjeta» con body[data-glass-lens] .MuiPaper-root … (cuatro clases y un elemento): por eso
        // .MuiButton-root va repetido, para pesar cinco clases (con menos, «Restablecer» seguía teñido; medido en Chrome)
        '& .MuiButton-root.MuiButton-root.MuiButton-root.MuiButton-contained, & .MuiButton-root.MuiButton-root.MuiButton-root.MuiButton-outlined': {
            backgroundColor: 'transparent', backgroundImage: 'none', boxShadow: 'none', border: 0,
            '&:hover': {backgroundColor: 'action.hover', boxShadow: 'none'},
        },
    };
}

/**
 * Lo demás va al div de la cápsula: aria-label (el nombre del grupo para quien usa lector de pantalla), id, onClick…
 * role va por omisión en 'group' (lo que se agrupa se anuncia junto).
 *
 * @param {Omit<import('react').HTMLAttributes<HTMLDivElement>, 'children'> & {children: import('react').ReactNode, sx?: object|Function|Array<any>}} props
 *     children: los botones del grupo; sx: estilos propios, encima de los de la cápsula
 */
export default function BarCapsule(props) {
    // lo que el proyecto puso en su tema (components.CalcitaBarCapsule.defaultProps) y encima lo que llega aquí
    const {children, sx, role = 'group', ...rest} = usePieceProps(props, THEME_NAME);
    // el estilo de la cápsula va abajo (ownSx): encima el del tema del proyecto y, al final, el sx de la pantalla
    return (
        <CapsuleRoot role={role} {...rest}
             ownSx={(theme) => ({
                 ...(isGlassTheme(theme) ? glassStylesOf(theme, {isControl: true}) : {backgroundColor: paletteOf(theme).background.paper}),
                 ...(isGlassTheme(theme) && monochromeButtonsSxOf(paletteOf(theme).text.primary)),
                 display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, minWidth: 0,
                 height: BAR_CAPSULE_HEIGHT_PIXELS, px: 0.75, borderRadius: '999px',
             })}
             sx={sx}>
            {children}
        </CapsuleRoot>
    );
}
