// Las reglas de un rango de periodos (de tal quincena a tal quincena, de tal mes a tal mes) sobre una lista ORDENADA de
// opciones, cada una con su valor y si se puede elegir.
//
// Un rango vale si sus dos extremos se pueden elegir, «hasta» no va antes de «desde» y NINGUNA opción de en medio está
// apagada: no se cruza un periodo roto. Por eso la lista de «hasta» se corta en la primera opción apagada después de
// «desde».
//
// No sabe de quincenas ni de productos: quien la usa le pasa sus opciones ya ordenadas. Funciones puras, sin React: se
// prueban con node --test.
//
// Genérico del paquete: function (regla de la casa).

/**
 * @typedef {{value: string, disabled: boolean}} PeriodOption
 */

/**
 * Dónde está un valor en la lista.
 *
 * @param {PeriodOption[]} options en orden
 * @param {string|null|undefined} value
 * @returns {number} su posición; -1 si no está
 */
function positionOf(options, value) {
    return options.findIndex((option) => option.value === value);
}

/**
 * Las opciones de «hasta» para un «desde»: apagadas las de antes de «desde» y todas desde la primera apagada después de
 * él (un rango no salta un periodo roto).
 *
 * @param {PeriodOption[]} options en orden
 * @param {string|null|undefined} from el «desde» elegido; sin él, las opciones tal cual
 * @returns {PeriodOption[]} las mismas opciones, con disabled donde no se puede terminar el rango
 */
export function rangeEndOptionsOf(options, from) {
    const fromPosition = positionOf(options, from);

    // guard clause: sin «desde» no hay nada que cortar
    if (fromPosition === -1) {
        return options;
    }

    let rangeIsBroken = false;

    return options.map((option, position) => {
        if (position > fromPosition && option.disabled) {
            rangeIsBroken = true;
        }

        return {...option, disabled: position < fromPosition || rangeIsBroken || option.disabled};
    });
}

/**
 * Si un rango se puede pedir.
 *
 * @param {PeriodOption[]} options en orden
 * @param {string|null|undefined} from
 * @param {string|null|undefined} to
 * @returns {boolean} true si los dos extremos existen, se pueden elegir, van en orden y no hay nada apagado en medio
 */
export function periodRangeIsValid(options, from, to) {
    const fromPosition = positionOf(options, from);
    const toPosition = positionOf(options, to);

    // guard clause: un extremo que no existe o un rango al revés no vale
    if (fromPosition === -1 || toPosition === -1 || toPosition < fromPosition) {
        return false;
    }

    return options.slice(fromPosition, toPosition + 1).every((option) => !option.disabled);
}

/**
 * El «hasta» que queda al cambiar «desde»: el mismo si el rango sigue valiendo; si no, el propio «desde» (un rango de un
 * solo periodo siempre vale).
 *
 * @param {PeriodOption[]} options en orden
 * @param {string} from el «desde» nuevo
 * @param {string|null|undefined} to el «hasta» que había
 * @returns {string} el «hasta» que se queda
 */
export function rangeEndAfterStartChange(options, from, to) {
    return periodRangeIsValid(options, from, to) ? to : from;
}
