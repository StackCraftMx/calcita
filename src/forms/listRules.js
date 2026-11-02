// Las reglas de yup para una lista de renglones (FormRepeatingFields), con sus mensajes en el idioma activo:
//
//   uniqueInListRule('tiers', 'min_quantity')            sin repetidos en esa columna («Ya está en el renglón 2»)
//   orderedInListRule('tiers', 'min_quantity')           de menor a mayor («Debe ir entre 10 (renglón 1) y 50 (renglón 3)»)
//   listTotalAtMostRule('amount', (values) => values.credit_limit, {currency: 'MXN'})
//                                                        lo que suman entre todos no pasa de un tope (con Money, sin floats)
//
//   Yup.object({
//       tiers: Yup.array().of(Yup.object({
//           min_quantity: Yup.string().required().test(uniqueInListRule('tiers', 'min_quantity'))
//               .test(orderedInListRule('tiers', 'min_quantity')),
//       })),
//       split: Yup.array().of(…).test(listTotalAtMostRule('amount', (values) => values.credit_limit)),
//   })
//
// El repetido y el fuera de orden se marcan en SU renglón (no se borra lo que escribió la persona): el primero que aparece
// se queda bien y el que repite dice con cuál choca. Un campo vacío pasa: que sea obligatorio lo dice required().
//
// Son objetos de .test() y no un Yup propio: el proyecto usa su copia de yup y aquí no se importa. Funcionan con formik y
// con react-hook-form (yupResolver).
//
// Genérico del paquete: function (regla de la casa). Pruebas en listRules.test.js.
import {Money} from '@/money/money.js';

/**
 * La lista completa desde la regla de un campo de un renglón: yup da en context.from los objetos de arriba (el renglón y
 * el que tiene la lista).
 *
 * @param {{from?: Array<{value: object}>}} context
 * @param {string} listName
 * @returns {object[]}
 */
function rowsOf(context, listName) {
    return context.from?.[1]?.value?.[listName] ?? [];
}

/**
 * @param {unknown} value
 * @returns {number|null} el número, o null si viene vacío o no es número
 */
function numberOf(value) {
    if (value === '' || value === null || value === undefined) {
        return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

/**
 * Sin repetidos en una columna: el renglón que repite dice con cuál choca.
 *
 * @param {string} listName la lista en el formulario ('tiers')
 * @param {string} field la columna ('min_quantity')
 * @returns {import('yup').TestConfig<any, any>} para .test() de yup
 */
export function uniqueInListRule(listName, field) {
    return {
        name: 'uniqueInList',
        message: {key: 'validation:listDuplicate'},
        test: (value, context) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            const firstIndex = rowsOf(context, listName).findIndex((row) => String(row?.[field] ?? '') === String(value));
            if (firstIndex === -1 || firstIndex >= context.options.index) {
                return true;
            }
            return context.createError({message: {key: 'validation:listDuplicate', values: {row: firstIndex + 1}}});
        },
    };
}

/**
 * En orden por una columna, comparado con el renglón de arriba y el de abajo que tengan valor.
 *
 * @param {string} listName
 * @param {string} field
 * @param {{ascending?: boolean, allowEqual?: boolean, displayOf?: (text: string) => string}} [options] ascending: de menor
 *     a mayor (por omisión); displayOf: cómo se dice el valor del vecino en el mensaje (p. ej. con %)
 * @returns {import('yup').TestConfig<any, any>} para .test() de yup
 */
export function orderedInListRule(listName, field, {ascending = true, allowEqual = false, displayOf = (text) => text} = {}) {
    const isInOrder = (lower, higher) => (allowEqual ? lower <= higher : lower < higher);
    return {
        name: 'orderedInList',
        message: {key: 'validation:listOrderBetween'},
        test: (value, context) => {
            const current = numberOf(value);
            if (current === null) {
                return true;
            }
            const rows = rowsOf(context, listName);
            const index = context.options.index;
            const hasValue = (rowIndex) => numberOf(rows[rowIndex]?.[field]) !== null;
            let previousIndex = index - 1;
            while (previousIndex >= 0 && !hasValue(previousIndex)) {
                previousIndex -= 1;
            }
            let nextIndex = index + 1;
            while (nextIndex < rows.length && !hasValue(nextIndex)) {
                nextIndex += 1;
            }
            const previous = previousIndex >= 0 ? numberOf(rows[previousIndex][field]) : null;
            const next = nextIndex < rows.length ? numberOf(rows[nextIndex][field]) : null;
            const fitsPrevious = previous === null || (ascending ? isInOrder(previous, current) : isInOrder(current, previous));
            const fitsNext = next === null || (ascending ? isInOrder(current, next) : isInOrder(next, current));
            if (fitsPrevious && fitsNext) {
                return true;
            }
            const values = {
                previous: previous === null ? '' : displayOf(String(rows[previousIndex][field])), previousRow: previousIndex + 1,
                next: next === null ? '' : displayOf(String(rows[nextIndex][field])), nextRow: nextIndex + 1,
            };
            // entre los dos si choca con ambos; si no, solo con el que choca (de menor a mayor: mayor que el de arriba)
            let key = 'validation:listOrderBetween';
            if (fitsNext) {
                key = ascending ? 'validation:listOrderAbovePrevious' : 'validation:listOrderBelowPrevious';
            } else if (fitsPrevious) {
                key = ascending ? 'validation:listOrderBelowNext' : 'validation:listOrderAboveNext';
            }
            return context.createError({message: {key, values}});
        },
    };
}

/**
 * Lo que suma una columna, con Money (sin errores de decimales). Los vacíos cuentan como cero y los que no son número no
 * cuentan (su propio campo ya lo dice).
 *
 * @param {object[]} rows
 * @param {string} field
 * @param {{currency?: string}} [options]
 * @returns {Money}
 */
export function listTotalOf(rows, field, {currency} = {}) {
    return (rows ?? []).reduce((total, row) => {
        try {
            const text = String(row?.[field] ?? '').trim();
            return text ? total.plus(Money.fromString(text, {currency})) : total;
        } catch {
            return total;
        }
    }, Money.zero({currency}));
}

/**
 * Lo que suman entre todos no pasa de un tope (el reparto de un presupuesto, de un límite de crédito). Va en la lista:
 * Yup.array().test(listTotalAtMostRule(…)); el mensaje sale abajo de la lista.
 *
 * @param {string} field la columna que se suma
 * @param {number|string|((parent: object) => number|string|null)} max el tope, o cómo sacarlo de los demás valores del
 *     formulario (el límite que se escribió arriba)
 * @param {{currency?: string}} [options]
 * @returns {import('yup').TestConfig<any, any>} para .test() de yup
 */
export function listTotalAtMostRule(field, max, {currency} = {}) {
    return {
        name: 'listTotalAtMost',
        message: {key: 'validation:listTotalMax'},
        test: (rows, context) => {
            const maxText = typeof max === 'function' ? max(context.parent ?? {}) : max;
            if (maxText === '' || maxText === null || maxText === undefined) {
                return true;
            }
            let limit;
            try {
                limit = Money.fromString(String(maxText), {currency});
            } catch {
                return true;
            }
            const total = listTotalOf(Array.isArray(rows) ? rows : [], field, {currency});
            if (!total.isGreaterThan(limit)) {
                return true;
            }
            return context.createError({message: {key: 'validation:listTotalMax', values: {total: total.format(), max: limit.format()}}});
        },
    };
}
