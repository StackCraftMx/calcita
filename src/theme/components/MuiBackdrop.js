// El fondo detrás de diálogos y cajones: más oscuro que el de MUI (0.5) para que lo de enfrente se lea sin esfuerzo. El
// fondo invisible (el de un menú) no se toca.
//
// Funciones puras, sin React: function (regla de la casa).
export function MuiBackdrop() {
    return {
        MuiBackdrop: {
            styleOverrides: {
                root: {'&:not(.MuiBackdrop-invisible)': {backgroundColor: 'rgba(0, 0, 0, 0.6)'}},
            },
        },
    };
}
