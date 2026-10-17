// Los cajones y el menú lateral: del color de las tarjetas, con una línea a la derecha que los separa del lienzo.
//
// Funciones puras, sin React: function (regla de la casa).
import {paletteOf} from '@/theme/components/paletteOf.js';

export function MuiDrawer() {
    return {
        MuiDrawer: {
            styleOverrides: {
                paper: ({theme}) => ({
                    backgroundColor: paletteOf(theme).background.paper,
                    color: paletteOf(theme).text.primary,
                    borderRight: `1px solid ${paletteOf(theme).divider}`,
                }),
            },
        },
    };
}
