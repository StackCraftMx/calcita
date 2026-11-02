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
//
// Los nombres de un rango se cambian con keys ({from: 'created_from', to: 'created_to'}) para usar los que ya tiene el
// backend. Los textos llegan ya traducidos (label, options[].label); los de la casa salen de `t` (common.filterDrawer).
//
// Puro (sin React): se prueba con node (filterDrawerFields.test.js).
//
// Genérico del paquete: function (regla de la casa).

/** Los tipos de campo del cajón. */
export const FILTER_FIELD_KIND = Object.freeze({
    text: 'text', select: 'select', multiSelect: 'multiSelect', catalog: 'catalog', checkboxes: 'checkboxes',
    numberRange: 'numberRange', dateRange: 'dateRange', comparison: 'comparison', custom: 'custom',
});

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
 * Los nombres con que viaja un campo en los filtros: uno, o dos para un rango.
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
 * Los rangos que no tienen sentido («hasta» menor que «desde»): {llave de «hasta»: true}.
 *
 * @param {object[]} fields
 * @param {Record<string, unknown>} values
 * @returns {Record<string, boolean>}
 */
export function invalidRangesOf(fields, values) {
    const invalid = {};
    for (const field of fields) {
        if (field.kind !== FILTER_FIELD_KIND.numberRange && field.kind !== FILTER_FIELD_KIND.dateRange) {
            continue;
        }
        const [fromKey, toKey] = filterKeysOf(field);
        const from = values?.[fromKey];
        const to = values?.[toKey];
        if (!isFilterValueSet(from) || !isFilterValueSet(to)) {
            continue;
        }
        // los números como números y las fechas AAAA-MM-DD como texto (ya se ordenan solas)
        const isBackwards = field.kind === FILTER_FIELD_KIND.numberRange ? Number(to) < Number(from) : String(to) < String(from);
        if (isBackwards) {
            invalid[toKey] = true;
        }
    }
    return invalid;
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
        } else if (field.kind === FILTER_FIELD_KIND.numberRange || field.kind === FILTER_FIELD_KIND.dateRange) {
            const [fromKey, toKey] = filterKeysOf(field);
            const format = field.kind === FILTER_FIELD_KIND.dateRange ? formatDate : withUnit;
            text.push({key: fromKey, label: t('filterDrawer.chipFrom', {label: field.label}), format});
            text.push({key: toKey, label: t('filterDrawer.chipTo', {label: field.label}), format});
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
