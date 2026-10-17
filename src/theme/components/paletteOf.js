// La paleta que deben leer los ajustes de componentes.
//
// OJO, trampa pagada: theme.vars solo existe con el tema en modo variables CSS (createToolkitTheme lo prende). Con
// theme.vars un mismo ajuste sirve en claro y en oscuro sin volver a pintar; sin él se lee la paleta normal.
//
// Funciones puras, sin React: function (regla de la casa).

/**
 * @param {object} theme el tema de MUI
 * @returns {object} la paleta (con variables CSS si las hay)
 */
export function paletteOf(theme) {
    return (theme.vars ?? theme).palette;
}
