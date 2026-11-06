// Los campos del cajón de búsqueda (FilterDrawer): cómo viaja cada uno en los filtros de la lista, cuántos hay puestos y
// cómo se dicen en sus chips. Un campo se declara una vez y de ahí sale todo:
//
//   text          un texto                            {name}: 'ana'
//   select        una opción                          {name}: 'card'
//   multiSelect   varias opciones (lista)             {name}: ['card', 'cash']
//   catalog       una o varias de un catálogo largo   {name}: 'NL' o ['NL', 'JA'] (multiple)
//   checkboxes    varias, a la vista                  {name}: ['email', 'sms']
//   numberRange   desde y hasta                       {name}_min: '3', {name}_max: '10'
//   dateRange     del día al día (AAAA-MM-DD)         {name}_from: '2026-11-01', {name}_to: '2026-11-30'
//   comparison    un número con su operador           {name}: 'gte:500' (mayor o igual que 500)
//   custom        uno propio (render)                 {name}: lo que el proyecto decida
//                 o un rango propio, con keys         {keys.from}: …, {keys.to}: …
//
// Los nombres de un rango se cambian con keys ({from: 'created_from', to: 'created_to'}) para usar los que ya tiene el
// backend. Un custom con keys es un rango propio: guarda en sus dos llaves, cuenta como un filtro, da dos chips («desde» y
// «hasta») y, con isBackwards(from, to), no deja buscar si está al revés, como los de la casa.
//
// Un dateRange se acota con minDate y maxDate ('AAAA-MM-DD'), disablePast y disableFuture (hoy en la zona del producto): el
// calendario no deja escoger fuera, cada extremo acota al otro y lo que se teclee fuera se dice en su campo y no deja buscar
// (drawerProblemsOf). Nada se borra solo.
//
// Los textos llegan ya traducidos (label, options[].label); los de la casa salen de `t` (common.filterDrawer).
//
// Puro (sin React): se prueba con node (filterDrawerFields.test.js).
//
// Genérico del paquete: function (regla de la casa).

/** Los tipos de campo del cajón. */
export const FILTER_FIELD_KIND = Object.freeze({
    text: 'text', select: 'select', multiSelect: 'multiSelect', catalog: 'catalog', checkboxes: 'checkboxes',
    numberRange: 'numberRange', dateRange: 'dateRange', comparison: 'comparison', custom: 'custom',
});

/**
 * Lo que puede estar mal en un campo del cajón; cada uno es su texto en common.filterDrawer. Mientras haya uno, «Buscar» no
 * busca.
 */
export const FILTER_FIELD_PROBLEM = Object.freeze({rangeBackwards: 'rangeBackwards', beforeMinDate: 'dateBeforeMin', afterMaxDate: 'dateAfterMax'});

/** Los operadores de un campo de comparación, como viajan ('gte:500'). */
export const COMPARISON_OPERATOR = Object.freeze({equals: 'eq', greaterThan: 'gt', greaterOrEqual: 'gte', lessThan: 'lt', lessOrEqual: 'lte'});

// cómo se dice cada operador en un chip, corto
const OPERATOR_SYMBOLS = Object.freeze({eq: '=', gt: '>', gte: '≥', lt: '<', lte: '≤'});
const COMPARISON_SEPARATOR = ':';
// los que guardan una lista: así los lee la tabla en la dirección
const LIST_KINDS = new Set([FILTER_FIELD_KIND.multiSelect, FILTER_FIELD_KIND.checkboxes]);

/**
 * ¿El campo guarda una lista?
 *
 * @param {{kind: string, multiple?: boolean}} field
 * @returns {boolean}
 */
export function isListField(field) {
    return LIST_KINDS.has(field.kind) || (field.kind === FILTER_FIELD_KIND.catalog && Boolean(field.multiple));
}

/**
 * ¿El campo es un rango propio? Un custom con sus dos llaves (keys.from y keys.to).
 *
 * @param {{kind: string, keys?: {from?: string, to?: string}}} field
 * @returns {boolean}
 */
function isCustomRange(field) {
    return field.kind === FILTER_FIELD_KIND.custom && Boolean(field.keys?.from) && Boolean(field.keys?.to);
}

/**
 * ¿El campo guarda un «desde» y un «hasta»? Los rangos de la casa y los propios.
 *
 * @param {{kind: string, keys?: {from?: string, to?: string}}} field
 * @returns {boolean}
 */
export function isRangeField(field) {
    return field.kind === FILTER_FIELD_KIND.numberRange || field.kind === FILTER_FIELD_KIND.dateRange || isCustomRange(field);
}

/**
 * Los nombres con que viaja un campo en los filtros: uno, o dos para un rango (también uno propio: custom con keys).
 *
 * @param {{name: string, kind: string, keys?: {from?: string, to?: string}}} field
 * @returns {string[]}
 */
export function filterKeysOf(field) {
    if (field.kind === FILTER_FIELD_KIND.numberRange) {
        return [field.keys?.from ?? `${field.name}_min`, field.keys?.to ?? `${field.name}_max`];
    }
    if (field.kind === FILTER_FIELD_KIND.dateRange) {
        return [field.keys?.from ?? `${field.name}_from`, field.keys?.to ?? `${field.name}_to`];
    }
    if (isCustomRange(field)) {
        return [field.keys.from, field.keys.to];
    }
    return [field.name];
}

/**
 * Un valor de comparación ('gte:500') en sus partes; null si viene vacío o no se entiende.
 *
 * @param {unknown} text
 * @returns {{operator: string, value: string}|null}
 */
export function comparisonOf(text) {
    const [operator, ...rest] = String(text ?? '').split(COMPARISON_SEPARATOR);
    const value = rest.join(COMPARISON_SEPARATOR);
    return OPERATOR_SYMBOLS[operator] && value !== '' ? {operator, value} : null;
}

/**
 * Las partes de una comparación como viajan; '' si falta el número.
 *
 * @param {string} operator COMPARISON_OPERATOR
 * @param {string} value
 * @returns {string}
 */
export function comparisonTextOf(operator, value) {
    return value === '' || value === null || value === undefined ? '' : `${operator}${COMPARISON_SEPARATOR}${value}`;
}

/**
 * ¿Ese valor de filtro está puesto? Un texto vacío o una lista vacía no cuentan.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isFilterValueSet(value) {
    return Array.isArray(value) ? value.length > 0 : value !== '' && value !== null && value !== undefined;
}

/**
 * Los tipos de filtro para ServerTable (filterKinds): los de lista se leen como lista en la dirección.
 *
 * @param {object[]} fields
 * @returns {Record<string, string>}
 */
export function filterDrawerKindsOf(fields) {
    return Object.fromEntries(fields.filter(isListField).map((field) => [field.name, 'multiSelect']));
}

/**
 * Lo que hay en los filtros para los campos del cajón (lo demás no se toca).
 *
 * @param {object[]} fields
 * @param {Record<string, unknown>} filters
 * @returns {Record<string, unknown>}
 */
export function drawerValuesOf(fields, filters) {
    return Object.fromEntries(fields.flatMap((field) => filterKeysOf(field).map((key) => [key, filters?.[key] ?? (isListField(field) ? [] : '')])));
}

/**
 * Los campos del cajón vacíos: lo que deja «Limpiar».
 *
 * @param {object[]} fields
 * @returns {Record<string, unknown>}
 */
export function emptyDrawerValuesOf(fields) {
    return drawerValuesOf(fields, {});
}

/**
 * Los campos del cajón vacíos, para sumarlos a filterDefaults de ServerTable: la tabla solo guarda en la dirección los
 * filtros que declara ahí.
 *
 * @param {object[]} fields
 * @returns {Record<string, unknown>}
 */
export function filterDrawerDefaultsOf(fields) {
    return emptyDrawerValuesOf(fields);
}

/**
 * Cuántos campos del cajón tienen algo puesto (un rango con «desde» y «hasta» cuenta uno): el número del botón «Filtros».
 *
 * @param {object[]} fields
 * @param {Record<string, unknown>} filters
 * @returns {number}
 */
export function activeDrawerFilterCountOf(fields, filters) {
    return fields.filter((field) => filterKeysOf(field).some((key) => isFilterValueSet(filters?.[key]))).length;
}

/**
 * ¿Ese rango está al revés («hasta» antes que «desde»)? Los números como números, las fechas AAAA-MM-DD como texto (ya se
 * ordenan solas) y uno propio con su isBackwards (sin él, nunca).
 */
function isBackwardsRange(field, from, to) {
    if (field.kind === FILTER_FIELD_KIND.numberRange) {
        return Number(to) < Number(from);
    }
    if (field.kind === FILTER_FIELD_KIND.dateRange) {
        return String(to) < String(from);
    }
    return Boolean(field.isBackwards?.(from, to));
}

/**
 * Los rangos que no tienen sentido («hasta» menor que «desde»): {llave de «hasta»: true}. También los propios (custom con
 * keys) que traen isBackwards.
 *
 * @param {object[]} fields
 * @param {Record<string, unknown>} values
 * @returns {Record<string, boolean>}
 */
export function invalidRangesOf(fields, values) {
    const invalid = {};
    for (const field of fields.filter(isRangeField)) {
        const [fromKey, toKey] = filterKeysOf(field);
        const from = values?.[fromKey];
        const to = values?.[toKey];
        if (isFilterValueSet(from) && isFilterValueSet(to) && isBackwardsRange(field, from, to)) {
            invalid[toKey] = true;
        }
    }
    return invalid;
}

// la más temprana y la más tardía de unas fechas AAAA-MM-DD (las vacías no cuentan)
const earliestDateOf = (...dates) => dates.filter(Boolean).sort()[0];
const latestDateOf = (...dates) => dates.filter(Boolean).sort().at(-1);

/**
 * Los topes de un dateRange: minDate y maxDate del campo, y hoy si pide disablePast o disableFuture (el más estrecho gana).
 *
 * @param {{minDate?: string, maxDate?: string, disablePast?: boolean, disableFuture?: boolean}} field
 * @param {string} today AAAA-MM-DD en la zona del producto (todayInZone)
 * @returns {{minDate?: string, maxDate?: string}}
 */
export function dateLimitsOf(field, today) {
    return {
        minDate: latestDateOf(field.minDate, field.disablePast && today),
        maxDate: earliestDateOf(field.maxDate, field.disableFuture && today),
    };
}

/**
 * Los topes de cada extremo de un dateRange para su calendario: los del campo y, además, cada extremo acota al otro (el
 * «desde» no pasa del «hasta» puesto y el «hasta» no baja del «desde»).
 *
 * @param {object} field
 * @param {Record<string, unknown>} values el borrador del cajón
 * @param {string} today AAAA-MM-DD en la zona del producto
 * @returns {{from: {minDate?: string, maxDate?: string}, to: {minDate?: string, maxDate?: string}}}
 */
export function dateRangeBoundsOf(field, values, today) {
    const [fromKey, toKey] = filterKeysOf(field);
    const {minDate, maxDate} = dateLimitsOf(field, today);
    return {
        from: {minDate, maxDate: earliestDateOf(maxDate, values?.[toKey] || undefined)},
        to: {minDate: latestDateOf(minDate, values?.[fromKey] || undefined), maxDate},
    };
}

/**
 * Lo que está mal en los campos del cajón, por llave: un rango al revés (en su «hasta») y una fecha fuera de los topes de
 * su dateRange (la que se tecleó: el calendario ya no deja escogerla). Mientras haya algo, «Buscar» no busca.
 *
 *   {created_to: {problem: 'rangeBackwards'}, paid_from: {problem: 'dateBeforeMin', date: '2026-01-01'}}
 *
 * @param {object[]} fields
 * @param {Record<string, unknown>} values
 * @param {{today?: string}} [options] hoy AAAA-MM-DD en la zona del producto (para disablePast y disableFuture)
 * @returns {Record<string, {problem: string, date?: string}>} problem es FILTER_FIELD_PROBLEM; date, el tope que se pasó
 */
export function drawerProblemsOf(fields, values, {today} = {}) {
    const problems = Object.fromEntries(Object.keys(invalidRangesOf(fields, values)).map((key) => [key, {problem: FILTER_FIELD_PROBLEM.rangeBackwards}]));
    for (const field of fields.filter((candidate) => candidate.kind === FILTER_FIELD_KIND.dateRange)) {
        const {minDate, maxDate} = dateLimitsOf(field, today);
        for (const key of filterKeysOf(field)) {
            const date = values?.[key];
            if (!isFilterValueSet(date)) {
                continue;
            }
            if (minDate && String(date) < minDate) {
                problems[key] = {problem: FILTER_FIELD_PROBLEM.beforeMinDate, date: minDate};
            } else if (maxDate && String(date) > maxDate) {
                problems[key] = {problem: FILTER_FIELD_PROBLEM.afterMaxDate, date: maxDate};
            }
        }
    }
    return problems;
}

/**
 * Los chips de los campos del cajón, con la forma de buildChipConfig: cada valor con su etiqueta, ya dicho en palabras.
 *
 * @param {object[]} fields
 * @param {object} helpers
 * @param {(key: string, values?: object) => string} helpers.t el de common (filterDrawer.chipFrom, chipTo)
 * @param {(date: string) => string} [helpers.formatDate] cómo se ve una fecha
 * @returns {{text: Array<{key: string, label: string, format?: (value: string) => string}>, multiSelect: Array<{key: string, label: string, itemLabel?: (value: string) => string}>}}
 */
export function filterDrawerChipsOf(fields, {t, formatDate = (date) => date}) {
    const text = [];
    const multiSelect = [];
    const optionLabelOf = (field, value) => field.options?.find((option) => (option.value ?? option.code) === value)?.label ?? String(value);
    for (const field of fields) {
        const withUnit = (value) => `${field.prefix ?? ''}${value}${field.suffix ? ` ${field.suffix}` : ''}`;
        if (isListField(field)) {
            multiSelect.push({key: field.name, label: field.label, itemLabel: (value) => optionLabelOf(field, value)});
        } else if (isRangeField(field)) {
            const [fromKey, toKey] = filterKeysOf(field);
            // un rango propio se dice con su chipFormat (o tal cual)
            const format = field.kind === FILTER_FIELD_KIND.dateRange ? formatDate : (isCustomRange(field) ? field.chipFormat : withUnit);
            text.push({key: fromKey, label: t('filterDrawer.chipFrom', {label: field.label}), ...(format && {format})});
            text.push({key: toKey, label: t('filterDrawer.chipTo', {label: field.label}), ...(format && {format})});
        } else if (field.kind === FILTER_FIELD_KIND.comparison) {
            text.push({
                key: field.name, label: field.label,
                format: (value) => {
                    const parts = comparisonOf(value);
                    return parts ? `${OPERATOR_SYMBOLS[parts.operator]} ${withUnit(parts.value)}` : String(value);
                },
            });
        } else if (field.kind === FILTER_FIELD_KIND.select || field.kind === FILTER_FIELD_KIND.catalog) {
            text.push({key: field.name, label: field.label, format: (value) => optionLabelOf(field, value)});
        } else {
            text.push({key: field.name, label: field.label, ...(field.chipFormat && {format: field.chipFormat})});
        }
    }
    return {text, multiSelect};
}
