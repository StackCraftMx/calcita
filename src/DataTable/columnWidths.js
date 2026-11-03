// Cuánto mide una columna para que su texto más largo no se corte: se mide el texto con la letra de la página (en el
// navegador, con un canvas) y se le suma lo que lleva alrededor. Sin navegador (al pintar en el servidor) se calcula por
// letras: un poco de más es mejor que «Registrado pendiente de docum…».
//
// Funciones puras, no renderizan: function (regla de la casa). Pruebas en columnWidths.test.js.

// la letra del estatus (StatusChip): 13 px de grosor medio
const STATUS_FONT_SIZE_PIXELS = 13;
const STATUS_FONT_WEIGHT = 500;
// el ancho promedio de una letra de 13 px cuando no hay con qué medir
const AVERAGE_CHARACTER_WIDTH_PIXELS = 7.4;
// lo que va alrededor del texto: el punto y su espacio (o el contorno del chip) y el respiro de la celda
const STATUS_EXTRA_PIXELS = Object.freeze({dot: 40, chip: 52});
// el encabezado lleva además sus íconos de orden y de filtro
const HEADER_ICONS_PIXELS = 56;

let measuringContext = null;

/**
 * El ancho de un texto en px con la letra de la página; sin navegador, por número de letras.
 *
 * @param {string} text
 * @param {{fontSize?: number, fontWeight?: number}} [options]
 * @returns {number}
 */
export function textWidthOf(text, {fontSize = STATUS_FONT_SIZE_PIXELS, fontWeight = STATUS_FONT_WEIGHT} = {}) {
    const value = String(text ?? '');
    if (typeof document === 'undefined') {
        return value.length * AVERAGE_CHARACTER_WIDTH_PIXELS * (fontSize / STATUS_FONT_SIZE_PIXELS);
    }
    measuringContext ??= document.createElement('canvas').getContext('2d');
    if (!measuringContext) {
        return value.length * AVERAGE_CHARACTER_WIDTH_PIXELS * (fontSize / STATUS_FONT_SIZE_PIXELS);
    }
    const fontFamily = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
    measuringContext.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    return measuringContext.measureText(value).width;
}

/**
 * El ancho de una columna de estatus: el de su etiqueta más larga (o el del encabezado, con sus íconos) más lo de alrededor.
 *
 * @param {string[]} labels el encabezado primero y luego las etiquetas, ya traducidos
 * @param {{variant?: 'dot'|'chip'}} [options]
 * @returns {number} px, redondeado hacia arriba
 */
export function statusColumnWidthOf([header, ...labels], {variant = 'dot'} = {}) {
    const extra = STATUS_EXTRA_PIXELS[variant] ?? STATUS_EXTRA_PIXELS.dot;
    const widest = Math.max(0, ...labels.map((label) => textWidthOf(label) + extra));
    const headerWidth = textWidthOf(header, {fontWeight: 600}) + HEADER_ICONS_PIXELS;
    return Math.ceil(Math.max(widest, headerWidth));
}
