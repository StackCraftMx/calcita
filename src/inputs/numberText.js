// El texto de un número mientras se escribe: lo que se ve («2,850,000.50») y lo que viaja al servidor («2850000.50»).
//
// Todo se hace sobre el TEXTO, nunca con números de JavaScript: Number('12345678901234567.89') ya no es exacto y
// (1.005).toFixed(2) da '1.00'. Así un importe llega al servidor (y a Money) tal cual se escribió.
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (numberText.test.js).

const DECIMAL_POINT = '.';
const THOUSANDS_SEPARATOR = ',';
const DIGITS_PER_GROUP = 3;
const NEGATIVE_SIGN = '-';

/**
 * Deja solo dígitos y UN punto, con el tope de decimales del campo. Lo demás (letras, comas, espacios) se va.
 *
 * @param {string|number|null|undefined} text lo que se tecleó o se pegó
 * @param {number} decimals cuántos decimales caben
 * @param {boolean} [allowNegative] si se puede escribir el signo de menos al principio
 * @returns {string} '2850000.5'; '' si no quedó nada
 */
export function cleanNumberText(text, decimals, allowNegative = false) {
    const rawText = String(text ?? '').trim();
    const isNegative = allowNegative && rawText.startsWith(NEGATIVE_SIGN);
    const digitsAndPoints = rawText.replace(/[^\d.]/g, '');
    const [wholeDigits, ...decimalParts] = digitsAndPoints.split(DECIMAL_POINT);
    const sign = isNegative ? NEGATIVE_SIGN : '';
    if (decimalParts.length === 0 || decimals === 0) {
        return `${sign}${wholeDigits}`;
    }
    return `${sign}${wholeDigits}${DECIMAL_POINT}${decimalParts.join('').slice(0, decimals)}`;
}

/**
 * Con separador de miles, sin tocar los decimales que se están escribiendo: '2850000.5' → '2,850,000.5'.
 *
 * @param {string|null|undefined} numberText lo que regresa cleanNumberText
 * @returns {string}
 */
export function groupThousands(numberText) {
    if (numberText === '' || numberText === null || numberText === undefined) {
        return '';
    }
    const text = String(numberText);
    const sign = text.startsWith(NEGATIVE_SIGN) ? NEGATIVE_SIGN : '';
    const [wholeDigits, decimalDigits] = text.slice(sign.length).split(DECIMAL_POINT);
    // los grupos de tres se cuentan de derecha a izquierda: 2850000 → 2,850,000
    const groups = [];
    for (let end = wholeDigits.length; end > 0; end -= DIGITS_PER_GROUP) {
        groups.unshift(wholeDigits.slice(Math.max(0, end - DIGITS_PER_GROUP), end));
    }
    const groupedWhole = groups.join(THOUSANDS_SEPARATOR) || (decimalDigits === undefined ? '' : '0');
    return decimalDigits === undefined ? `${sign}${groupedWhole}` : `${sign}${groupedWhole}${DECIMAL_POINT}${decimalDigits}`;
}

/**
 * Al salir del campo: con todos sus decimales, completando con ceros y cortando lo de más (nunca redondea).
 * '2850000.5' → '2850000.50'; '1.005' → '1.00'; '' se queda '' (el campo puede ser opcional).
 *
 * @param {string} numberText lo que regresa cleanNumberText
 * @param {number} decimals
 * @returns {string}
 */
export function completeDecimals(numberText, decimals) {
    const sign = numberText.startsWith(NEGATIVE_SIGN) ? NEGATIVE_SIGN : '';
    const unsignedText = numberText.slice(sign.length);
    // guard clause: vacío, o solo un punto o un menos, no es un número
    if (unsignedText === '' || unsignedText === DECIMAL_POINT) {
        return '';
    }
    const [wholeDigits, decimalDigits = ''] = unsignedText.split(DECIMAL_POINT);
    // sin ceros de más a la izquierda («007» → «7»), pero sin dejar el entero vacío («.5» → «0.5»)
    const wholePart = wholeDigits.replace(/^0+(?=\d)/, '') || '0';
    if (decimals === 0) {
        return `${sign}${wholePart}`;
    }
    // lo de más se corta (un valor que llegó del servidor con más decimales que el campo); nunca se redondea
    return `${sign}${wholePart}${DECIMAL_POINT}${decimalDigits.slice(0, decimals).padEnd(decimals, '0')}`;
}
