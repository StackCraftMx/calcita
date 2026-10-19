// Los estilos de claro y de oscuro de un ajuste del tema, escritos de forma que el `sx` del proyecto les gane en los dos
// modos.
//
// OJO, trampa pagada (la prueba en un sistema que ya existía): con theme.applyStyles('dark', {...}) lo de oscuro va en una
// regla aparte que el navegador aplica DESPUÉS de la clase del componente, y el `sx` del proyecto vive en esa clase. En
// claro ganaba el sx; en oscuro ganaba siempre el tema (un monograma con bgcolor propio salía gris). Aquí cada propiedad que
// cambia de modo se escribe UNA vez en la clase, con una variable propia (--calcita-…), y la regla de oscuro solo cambia la
// variable: el sx del proyecto escribe la misma propiedad después, en la misma clase, y gana en claro y en oscuro.
//
//   lightDarkStylesOf(theme, {backgroundColor: '#E5E5EA', '&:hover': {...}}, {backgroundColor: '#2C2C2E', '&:hover': {...}})
//
// Lo que no se puede llevar a variable se queda como antes (en la regla de oscuro): un número (la variable no sabe de px),
// una palabra de CSS que la variable no copia tal cual (inherit, initial, unset, revert) y lo que solo trae el oscuro (sin un
// valor de claro, la variable dejaría la propiedad vacía en claro).
//
// Funciones puras, sin React: function (regla de la casa). Pruebas en lightDarkStyles.test.js.
import {mergeStyles} from '@/theme/mergeComponents.js';

const VARIABLE_PREFIX = '--calcita-';
// las palabras de CSS que una variable no guarda como texto: con ellas la variable hereda o se vacía
const CSS_WIDE_KEYWORDS = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer']);

/** ¿Es un bloque anidado (un selector o una media query) y no un valor? */
function isNestedBlock(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** ¿Puede ir en una variable? Solo texto, y no una palabra de CSS que la variable trataría distinto. */
function fitsVariable(value) {
    return typeof value === 'string' && !CSS_WIDE_KEYWORDS.has(value.trim()) && !value.includes('!important');
}

/** backgroundColor → --calcita-background-color; WebkitBackdropFilter → --calcita--webkit-backdrop-filter. */
function variableNameOf(property) {
    return `${VARIABLE_PREFIX}${property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

/**
 * @param {object} theme el tema de MUI (su applyStyles sabe cómo se elige el modo: clase, atributo o media query)
 * @param {object} lightStyles los estilos de claro (los de siempre)
 * @param {object} darkStyles lo que cambia en oscuro
 * @returns {object} los estilos para el tema: cada propiedad en la clase con su variable, y la regla de oscuro solo con las
 *     variables (más lo que no pudo ir en variable)
 */
export function lightDarkStylesOf(theme, lightStyles, darkStyles) {
    const plain = {};
    const nested = {};
    // lo que la regla de oscuro cambia: las variables y lo que se queda como antes
    let darkRule = {};

    Object.entries(lightStyles).forEach(([property, lightValue]) => {
        const darkValue = darkStyles[property];
        if (isNestedBlock(lightValue)) {
            nested[property] = isNestedBlock(darkValue) ? lightDarkStylesOf(theme, lightValue, darkValue) : lightValue;
            return;
        }
        if (darkValue === undefined || darkValue === lightValue) {
            plain[property] = lightValue;
            return;
        }
        if (fitsVariable(lightValue) && fitsVariable(darkValue)) {
            const variableName = variableNameOf(property);
            plain[variableName] = lightValue;
            plain[property] = `var(${variableName})`;
            darkRule[variableName] = darkValue;
            return;
        }
        plain[property] = lightValue;
        darkRule[property] = darkValue;
    });
    // lo que solo trae el oscuro (o un bloque que en claro no existe): como antes
    Object.entries(darkStyles).forEach(([property, darkValue]) => {
        if (!(property in lightStyles)) {
            darkRule = mergeStyles(darkRule, {[property]: darkValue});
        }
    });

    // OJO el orden: la clase, luego la regla de oscuro y al final los bloques anidados. Con un bloque anidado de los dos modos
    // (una media query de «reducir transparencia»), su oscuro va después del oscuro de afuera y gana, como antes
    const darkStylesOfTheme = Object.keys(darkRule).length > 0 ? theme.applyStyles('dark', darkRule) : {};
    return mergeStyles(mergeStyles(plain, darkStylesOfTheme), nested);
}
