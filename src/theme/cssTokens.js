// Los valores globales de Calcita que un proyecto cambia de un jalón con CSS, como variables (--calcita-…): las esquinas de
// los paneles (tarjetas grandes, menú lateral, diálogos, la sección de un formulario), de los menús y ventanitas y de los
// campos, y el desenfoque del vidrio. Cada uso lleva su valor de siempre como respaldo (var(--calcita-panel-radius, 20px)):
// sin la variable se ve igual que antes.
//
// Tres formas de ponerlas, de la más amplia a la más chica:
//   - en el tema: createToolkitTheme({cssTokens: {panelRadius: 6, glassBlur: 12}}) las declara en :root (con el
//     CssBaseline de MUI, que la app ya pinta);
//   - en CSS suelto, también en la página de un sistema que ya existe: :root {--calcita-panel-radius: 6px;}
//   - en un contenedor, para una sola parte de la pantalla: <Box sx={{'--calcita-panel-radius': '6px'}}>…</Box>
// Lo que va en una ventana o un menú flotante (se pinta al final del body) toma las de :root, no las del contenedor.
//
// Los colores de los campos no van aquí: son variables de MUI (--mui-palette-field-fill…, ver createToolkitTheme fields).
//
// Funciones puras, sin React: function (regla de la casa). Pruebas en cssTokens.test.js.

/** Cada valor: su variable, el de siempre (respaldo) y la unidad para cuando el proyecto lo da en número. */
export const CSS_TOKENS = Object.freeze({
    // lo que flota grande y las tarjetas grandes: menú lateral, barra en cápsula, diálogos, la sección de un formulario
    panelRadius: Object.freeze({variable: '--calcita-panel-radius', fallback: '20px', unit: 'px'}),
    // menús, listas desplegables, globos y avisos
    menuRadius: Object.freeze({variable: '--calcita-menu-radius', fallback: '12px', unit: 'px'}),
    // los campos de captura (con vidrio, con el minimalista y dentro de FormSection)
    fieldRadius: Object.freeze({variable: '--calcita-field-radius', fallback: '12px', unit: 'px'}),
    // el desenfoque del vidrio y cuánto aviva los colores de atrás
    glassBlur: Object.freeze({variable: '--calcita-glass-blur', fallback: '20px', unit: 'px'}),
    glassSaturate: Object.freeze({variable: '--calcita-glass-saturate', fallback: '180%', unit: '%'}),
});

/**
 * El valor para un estilo: la variable con su respaldo. Un estilo con su propio valor de siempre lo pasa (el minimalista
 * tiene las tarjetas de 16 px).
 *
 * @param {keyof typeof CSS_TOKENS} key
 * @param {string} [fallback] por omisión el de CSS_TOKENS
 * @returns {string} p. ej. 'var(--calcita-panel-radius, 20px)'
 */
export function cssTokenOf(key, fallback = CSS_TOKENS[key].fallback) {
    return `var(${CSS_TOKENS[key].variable}, ${fallback})`;
}

/**
 * Las declaraciones para :root (o para un contenedor) con los valores del proyecto: {panelRadius: 6} →
 * {'--calcita-panel-radius': '6px'}. Un número lleva la unidad del valor (px o %); un texto va tal cual ('0.5rem').
 * Lo que no es un valor conocido se ignora.
 *
 * @param {Partial<Record<keyof typeof CSS_TOKENS, number|string>>} [values]
 * @returns {Record<string, string>}
 */
export function cssTokenDeclarationsOf(values = {}) {
    return Object.fromEntries(Object.entries(values)
        .filter(([key, value]) => Object.hasOwn(CSS_TOKENS, key) && value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [CSS_TOKENS[key].variable, typeof value === 'number' ? `${value}${CSS_TOKENS[key].unit}` : String(value)]));
}
