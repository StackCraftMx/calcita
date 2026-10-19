// Las ventanas (Dialog): sin el contorno de foco del navegador alrededor de la ventana entera.
//
// Desde MUI 7.3 el foco, al abrir, cae en la ventana misma (el Paper con role="dialog"), para que el lector de pantalla diga
// su título. MUI le quita el contorno a su contenedor («para ratón, toque y teclado», dice su código), pero no a la ventana,
// y Chrome la marcaba con un borde azul aunque se abriera con clic. La ventana no es un control: lo que se pica adentro
// conserva su aro al llegar con Tab.
//
// Funciones puras, sin React: function (regla de la casa).
export function MuiDialog() {
    return {
        MuiDialog: {
            styleOverrides: {
                paper: {outline: 0},
            },
        },
    };
}
