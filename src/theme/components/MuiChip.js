// Las etiquetas: la gris de omisión con borde (sobre el lienzo Cloud se perdía) y, en el teléfono, las que se pican de
// 36 px de alto para el dedo; en escritorio regresan a 24 px.
//
// Funciones puras, sin React: function (regla de la casa).
import {paletteOf} from '@/theme/components/paletteOf.js';

const TOUCH_CHIP_PIXELS = 36;
const DESKTOP_SMALL_CHIP_PIXELS = 24;

export function MuiChip() {
    return {
        MuiChip: {
            styleOverrides: {
                root: ({ownerState, theme}) => {
                    const isFilledDefault = ownerState.variant === 'filled' && (ownerState.color === 'default' || !ownerState.color);
                    if (!isFilledDefault) {
                        return {};
                    }
                    const palette = paletteOf(theme);
                    return {backgroundColor: palette.action.selected, color: palette.text.primary, border: `1px solid ${palette.divider}`};
                },
                sizeSmall: ({ownerState, theme}) => {
                    const isClickable = Boolean(ownerState.onClick) || ownerState.clickable;
                    if (!isClickable) {
                        return {};
                    }
                    return {height: TOUCH_CHIP_PIXELS, [theme.breakpoints.up('md')]: {height: DESKTOP_SMALL_CHIP_PIXELS}};
                },
            },
        },
    };
}
