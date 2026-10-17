// Los textos chicos: caption un poco más pesado (su espaciado es el de Apple, del tema), y overline (el renglón en
// versalitas) separado: las mayúsculas seguidas sí piden aire para leerse.
//
// Funciones puras, sin React: function (regla de la casa).
export function MuiTypography() {
    return {
        // el cuerpo de la página trae el estilo body1 con su espaciado de 16 px (-0.32 px), y lo HEREDA todo lo que no
        // declara el suyo: chips, numeritos, tooltips de 11 a 13 px salían con las letras muy juntas. Con 0 heredan lo que
        // Apple usa a 12 pt (y casi lo de 11 y 13); los textos con estilo propio traen el suyo
        MuiCssBaseline: {
            styleOverrides: {
                body: {letterSpacing: 0},
            },
        },
        MuiTypography: {
            styleOverrides: {
                caption: {fontWeight: 500},
                overline: {fontWeight: 600, letterSpacing: '0.08em'},
            },
        },
    };
}
