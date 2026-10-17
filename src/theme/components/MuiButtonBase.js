// El contorno de foco de todo lo que se pica (íconos, renglones de menú, pestañas): visible al navegar con el teclado
// (WCAG 2.4.7), en el color principal.
//
// Funciones puras, sin React: function (regla de la casa).
import {paletteOf} from '@/theme/components/paletteOf.js';

export function MuiButtonBase() {
    return {
        MuiButtonBase: {
            styleOverrides: {
                root: ({theme}) => ({
                    '&:focus-visible': {outline: `2px solid ${paletteOf(theme).primary.main}`, outlineOffset: 2},
                }),
            },
        },
    };
}
