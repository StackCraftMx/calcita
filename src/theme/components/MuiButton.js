// Los botones: sin mayúsculas ni sombra, con el contorno de foco visible y, en el teléfono, los chicos de 44 px de alto
// (lo mínimo que pide WCAG para tocar con el dedo); en escritorio vuelven a 30 px.
//
// OJO: walk-ot ponía pointer-events: auto en los deshabilitados para ver el cursor «prohibido»; aquí no, porque un botón
// que es liga (component={Link}) deshabilitado volvía a navegar al darle clic.
//
// Funciones puras, sin React: function (regla de la casa).
import {paletteOf} from '@/theme/components/paletteOf.js';

// el alto mínimo para tocar con el dedo (WCAG 2.5.5) y el de escritorio
const TOUCH_TARGET_PIXELS = 44;
const DESKTOP_SMALL_BUTTON_PIXELS = 30;

export function MuiButton() {
    return {
        MuiButton: {
            defaultProps: {disableElevation: true},
            styleOverrides: {
                root: ({theme}) => ({
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:focus-visible': {outline: `2px solid ${paletteOf(theme).primary.main}`, outlineOffset: 2},
                }),
                sizeSmall: ({theme}) => ({
                    minHeight: TOUCH_TARGET_PIXELS,
                    [theme.breakpoints.up('md')]: {minHeight: DESKTOP_SMALL_BUTTON_PIXELS},
                }),
            },
        },
    };
}
