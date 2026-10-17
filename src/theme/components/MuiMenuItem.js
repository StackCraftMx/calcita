// Los renglones de un menú: al navegar con el teclado se marca el renglón con fondo, no con el contorno (un contorno en
// cada renglón de una lista larga se leía como ruido).
//
// Funciones puras, sin React: function (regla de la casa).
import {paletteOf} from '@/theme/components/paletteOf.js';

export function MuiMenuItem() {
    return {
        MuiMenuItem: {
            styleOverrides: {
                root: ({theme}) => ({
                    '&:focus-visible': {outline: 'none', backgroundColor: paletteOf(theme).action.hover},
                    '&.Mui-selected:focus-visible': {backgroundColor: paletteOf(theme).action.selected},
                }),
            },
        },
    };
}
