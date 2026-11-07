// Los cajones y el menú lateral: del color de las tarjetas, con una línea a la derecha que los separa del lienzo.
//
// Un cajón que se abre ENCIMA (variant temporary, el de omisión de MUI) va en drawer + 2: la barra de AppLayout va en
// drawer + 1 para quedar encima del menú lateral (como el DashboardLayout de MUI), y un Drawer de MUI directo, que sale en
// drawer, quedaba tapado por la barra por un punto. Dos y no más: debajo de los diálogos (modal), para que una confirmación
// que se abre desde el cajón siga saliendo por delante. El menú lateral fijo (permanent) no cambia.
//
// Funciones puras, sin React: function (regla de la casa).
import {paletteOf} from '@/theme/components/paletteOf.js';

// cuántos puntos arriba de los cajones de MUI va uno temporal: uno más que la barra del marco (AppLayout, drawer + 1)
const TEMPORARY_DRAWER_LIFT = 2;

export function MuiDrawer() {
    return {
        MuiDrawer: {
            styleOverrides: {
                root: ({ownerState, theme}) => (ownerState.variant === 'temporary' ? {zIndex: theme.zIndex.drawer + TEMPORARY_DRAWER_LIFT} : {}),
                paper: ({theme}) => ({
                    backgroundColor: paletteOf(theme).background.paper,
                    color: paletteOf(theme).text.primary,
                    borderRight: `1px solid ${paletteOf(theme).divider}`,
                }),
            },
        },
    };
}
