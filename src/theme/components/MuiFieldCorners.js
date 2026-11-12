// Las esquinas de los campos que pidió el proyecto (createToolkitTheme({fields: {radius}})) en los campos sueltos del
// estilo de Stackcraft sin vidrio: ahí MUI les pone las del tema (8 px) y fields.radius solo les llegaba a los renglones de
// una FormSection, así que un campo suelto (en la celda de una tabla, en un filtro) hablaba distinto. Con vidrio y con el
// minimalista sus propios ajustes ya las leen y van encima de estos (glassComponents, minimalComponents).
//
// Sin fields.radius no cambia nada: el campo se queda con las esquinas de siempre.
//
// Funciones puras, sin React: function (regla de la casa).
import {fieldRadiusOf} from '@/theme/glassSurface.js';

/** Las esquinas de fields.radius, o nada si el proyecto no las pidió (o el tema no es de createToolkitTheme). */
function projectCornersOf({theme}) {
    const projectRadius = theme.toolkit?.fields?.radius;
    if (projectRadius === undefined || projectRadius === null) {
        return {};
    }
    return {borderRadius: fieldRadiusOf(theme, projectRadius)};
}

export function MuiFieldCorners() {
    return {
        MuiOutlinedInput: {styleOverrides: {root: projectCornersOf}},
        MuiFilledInput: {styleOverrides: {root: projectCornersOf}},
        // el campo de fecha de MUI X (/date-pickers) tiene su propia pieza
        MuiPickersOutlinedInput: {styleOverrides: {root: projectCornersOf}},
    };
}
