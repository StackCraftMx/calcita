// Junta dos `components` de tema de MUI sin que el segundo borre al primero: si los dos ajustan el mismo componente
// (la barra normal y la barra de vidrio), se suman sus defaultProps y, en cada parte (root, paper…), sus estilos; con el
// mismo estilo, gana el segundo.
//
// Por qué hace falta: con {...primero, ...segundo}, el MuiAppBar del vidrio reemplazaba completo al normal y la barra
// perdía su color y su línea de abajo.
// OJO, trampa pagada al sumar los estilos: con {...primero, ...segundo}, una llave que ya estaba (el modo oscuro) se queda
// en su lugar original, ANTES de lo que agrega el segundo (el sólido de «reducir transparencia»), y en CSS gana lo último:
// en oscuro con esa opción la barra salía naranja. Aquí lo del segundo siempre queda al final, y lo anidado (un selector,
// una media query, el modo oscuro) se suma por dentro en vez de reemplazarse.
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (mergeComponents.test.js).

/**
 * Un estilo de MUI puede ser un objeto o una función que recibe {theme, ownerState}: aquí siempre es función.
 *
 * @param {object|Function|undefined} style
 * @returns {(props: object) => object}
 */
function asStyleFunction(style) {
    return typeof style === 'function' ? style : () => style ?? {};
}

/**
 * @param {unknown} value
 * @returns {boolean} si es un objeto de estilos (no un arreglo ni un texto)
 */
function isStyleObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Suma dos objetos de estilos: con la misma propiedad gana el segundo, lo anidado se suma por dentro y lo del segundo
 * queda después de lo del primero (en CSS gana lo último).
 *
 * @param {object} baseStyle
 * @param {object} extraStyle
 * @returns {object}
 */
export function mergeStyles(baseStyle, extraStyle) {
    const merged = {...baseStyle};
    Object.entries(extraStyle).forEach(([key, extraValue]) => {
        const baseValue = merged[key];
        // se borra y se vuelve a poner para que quede al final, aunque la llave ya existiera
        delete merged[key];
        merged[key] = isStyleObject(baseValue) && isStyleObject(extraValue) ? mergeStyles(baseValue, extraValue) : extraValue;
    });
    return merged;
}

/**
 * @param {object} baseComponents
 * @param {object} extraComponents gana cuando chocan
 * @returns {object}
 */
export function mergeComponents(baseComponents, extraComponents) {
    const merged = {...baseComponents};
    Object.entries(extraComponents).forEach(([componentName, extraSettings]) => {
        const baseSettings = merged[componentName];
        if (!baseSettings) {
            merged[componentName] = extraSettings;
            return;
        }
        const styleOverrides = {...baseSettings.styleOverrides};
        Object.entries(extraSettings.styleOverrides ?? {}).forEach(([slotName, extraStyle]) => {
            const baseStyle = styleOverrides[slotName];
            styleOverrides[slotName] = baseStyle === undefined
                ? extraStyle
                : (props) => mergeStyles(asStyleFunction(baseStyle)(props), asStyleFunction(extraStyle)(props));
        });
        merged[componentName] = {
            ...baseSettings,
            ...extraSettings,
            defaultProps: {...baseSettings.defaultProps, ...extraSettings.defaultProps},
            styleOverrides,
        };
    });
    return merged;
}
