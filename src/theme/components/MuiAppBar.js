// La barra de arriba: plana (sin sombra), naranja en claro y del color de las tarjetas en oscuro, con una línea abajo
// cuando se queda fija al deslizar.
//
// Por qué applyStyles('dark') y no theme.palette.mode: el servidor no sabe qué modo eligió la persona; con mode, la barra
// se pintaba naranja un instante en oscuro. applyStyles lo deja en CSS y el navegador elige antes de pintar.
// Solo cambia la barra de color principal (el de omisión): una barra con color="inherit" o "transparent" se respeta.
//
// Funciones puras, sin React: function (regla de la casa).
import {paletteOf} from '@/theme/components/paletteOf.js';

export function MuiAppBar() {
    return {
        MuiAppBar: {
            defaultProps: {elevation: 0},
            styleOverrides: {
                root: ({ownerState, theme}) => {
                    const palette = paletteOf(theme);
                    const isPinned = ownerState.position === 'sticky' || ownerState.position === 'fixed';
                    const isPrimary = (ownerState.color ?? 'primary') === 'primary';
                    return {
                        ...(isPrimary && {
                            backgroundColor: palette.primary.main,
                            color: palette.primary.contrastText,
                            ...theme.applyStyles('dark', {backgroundColor: palette.background.paper, color: palette.text.primary}),
                        }),
                        ...(isPinned && {borderBottom: `1px solid ${palette.divider}`}),
                    };
                },
            },
        },
    };
}
