// Cómo se escriben números, porcentajes y fechas en pantalla.
//
// Siempre en el idioma activo (es-MX o en-US), las fechas en la zona y los montos en la moneda del proveedor
// (ToolkitProvider). Cuando una hora necesita rótulo, la pantalla lo escribe con su propio texto («hora del centro de
// México») y no con la abreviatura de Intl (GMT-6), que no le dice nada a la persona.
//
// Los Intl.* se memorizan por idioma: crear un formateador por celda en una tabla de cientos de filas se nota.
//
// Dos formas de usarlos:
//   - sueltos (formatDate, formatNumber…): con la configuración vigente, la del ToolkitProvider de la raíz. Para lo que no
//     es componente (un aviso, un Excel);
//   - dentro de un componente, useFormatters() (toolkit/useFormatters.js): con la del proveedor MÁS CERCANO. Con dos
//     proveedores (una parte de la app en otro idioma, o dos islas de React en una página vieja) cada parte escribe con
//     el suyo; con los sueltos, el último proveedor que se pintaba le cambiaba el idioma a todos.
// Los dos salen de formattersOf: una sola versión de cada formato.
//
// Funciones puras, no renderizan: function (regla de la casa).
import {parseInstant, parsePlainDate} from '@/dates.js';
import {intlLocaleOf, toolkitSettings} from '@/toolkit/toolkitSettings.js';

const formatterCache = new Map();

/**
 * Los formatos con la configuración que da settingsOf (se lee en cada llamada: si cambia el idioma, el siguiente formato ya
 * sale en el nuevo).
 *
 * @param {() => {language: string, languages?: Array<{code: string, locale?: string}>, timeZone: string, currency: string}} settingsOf
 */
export function formattersOf(settingsOf) {
    function cachedFormatter(kind, options, createFormatter) {
        const settings = settingsOf();
        const locale = intlLocaleOf(settings.language, settings.languages);
        const cacheKey = `${kind}|${locale}|${JSON.stringify(options)}`;
        if (!formatterCache.has(cacheKey)) {
            formatterCache.set(cacheKey, createFormatter(locale, options));
        }
        return formatterCache.get(cacheKey);
    }

    /**
     * Número con separador de miles: 321,540.
     *
     * @param {number|string|null|undefined} value
     * @param {string} [fallback] lo que se pinta si no hay dato
     * @returns {string}
     */
    function formatNumber(value, fallback = '—') {
        if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) {
            return fallback;
        }
        const formatter = cachedFormatter('number', {maximumFractionDigits: 0},
            (locale, options) => new Intl.NumberFormat(locale, options));
        return formatter.format(Number(value));
    }

    /**
     * Una lista en una frase, con su «y» antes de la última parte: «resumen, motivos de rechazo y descargas».
     *
     * @param {string[]} items las partes de la lista, ya traducidas
     * @returns {string} la frase; '' si la lista viene vacía
     */
    function formatList(items) {
        const formatter = cachedFormatter('list', {style: 'long', type: 'conjunction'},
            (locale, options) => new Intl.ListFormat(locale, options));
        return formatter.format(items);
    }


    /**
     * Monto en la moneda del proveedor con dos decimales: $2,567,951.00. Recibe el texto que manda el API (numeric de la base) o un número;
     * solo pinta, nunca suma (las sumas las hace el backend al centavo).
     *
     * @param {number|string|null|undefined} value
     * @param {string} [fallback] lo que se pinta si no hay dato
     * @returns {string}
     */
    function formatCurrency(value, fallback = '—') {
        if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) {
            return fallback;
        }
        const formatter = cachedFormatter('currency', {
            style: 'currency', currency: settingsOf().currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2, maximumFractionDigits: 2,
        }, (locale, options) => new Intl.NumberFormat(locale, options));
        return formatter.format(Number(value));
    }

    /**
     * Tamaño de un archivo en la unidad que se lee mejor: 950 B, 12.4 kB, 60.1 MB, 2.3 GB.
     *
     * @param {number|null|undefined} bytes
     * @param {string} [fallback] lo que se pinta si no hay dato
     * @returns {string}
     */
    function formatFileSize(bytes, fallback = '—') {
        if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) {
            return fallback;
        }
        // unidades de Intl en base 1000, igual que las que enseña el navegador en sus descargas
        const units = [['gigabyte', 1e9], ['megabyte', 1e6], ['kilobyte', 1e3]];
        for (const [unit, unitBytes] of units) {
            if (Number(bytes) >= unitBytes) {
                const formatter = cachedFormatter(`fileSize-${unit}`, {style: 'unit', unit, maximumFractionDigits: 1},
                    (locale, options) => new Intl.NumberFormat(locale, options));
                return formatter.format(Number(bytes) / unitBytes);
            }
        }
        // OJO: con la forma corta Intl no pone plural («74 byte», y «1 B» con el uno); la larga dice «74 bytes» y «1 byte»,
        // como lo enseña la Mac. Las demás unidades se quedan cortas (kB, MB): ahí la abreviatura sí se lee bien.
        const formatter = cachedFormatter('fileSize-byte', {style: 'unit', unit: 'byte', unitDisplay: 'long', maximumFractionDigits: 0},
            (locale, options) => new Intl.NumberFormat(locale, options));
        return formatter.format(Number(bytes));
    }

    /**
     * Porcentaje a partir de una proporción o de un número ya en porcentaje.
     *
     * @param {number|null|undefined} value 99.58 (con isRatio false) o 0.9958 (con isRatio true)
     * @param {{fractionDigits?: number, isRatio?: boolean, fallback?: string}} [options]
     * @returns {string}
     */
    function formatPercent(value, {fractionDigits = 2, isRatio = false, fallback = '—'} = {}) {
        if (value === null || value === undefined || Number.isNaN(Number(value))) {
            return fallback;
        }
        const ratio = isRatio ? Number(value) : Number(value) / 100;
        const formatter = cachedFormatter('percent', {style: 'percent', minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits},
            (locale, options) => new Intl.NumberFormat(locale, options));
        return formatter.format(ratio);
    }

    /**
     * Fecha y hora de un instante ISO en la zona del negocio.
     *
     * @param {string|null|undefined} value instante ISO con desfase
     * @param {{fallback?: string}} [options]
     * @returns {string}
     */
    function formatDateTime(value, {fallback = '—'} = {}) {
        const instant = parseInstant(value);
        if (!instant) {
            return fallback;
        }
        const options = {
            timeZone: settingsOf().timeZone,
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
        };
        const formatter = cachedFormatter('dateTime', options, (locale, formatOptions) => new Intl.DateTimeFormat(locale, formatOptions));
        return formatter.format(instant);
    }

    /**
     * Solo la fecha. Acepta un instante ISO (se pasa a la zona del negocio) o una fecha de calendario "2026-08-16"
     * (se pinta tal cual, sin moverla de día).
     *
     * @param {string|null|undefined} value
     * @param {{fallback?: string}} [options]
     * @returns {string}
     */
    function formatDate(value, {fallback = '—'} = {}) {
        const calendarDate = parsePlainDate(value);
        if (calendarDate) {
            const formatter = cachedFormatter('plainDate', {timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric'},
                (locale, options) => new Intl.DateTimeFormat(locale, options));
            // mediodía UTC y Intl en UTC: el mismo día en cualquier zona
            return formatter.format(new Date(Date.UTC(calendarDate.year, calendarDate.month - 1, calendarDate.day, 12)));
        }
        const instant = parseInstant(value);
        if (!instant) {
            return fallback;
        }
        const formatter = cachedFormatter('date', {timeZone: settingsOf().timeZone, day: 'numeric', month: 'short', year: 'numeric'},
            (locale, options) => new Intl.DateTimeFormat(locale, options));
        return formatter.format(instant);
    }

    /**
     * Solo la hora (24 h) de un instante ISO en la zona del negocio: "07:00".
     *
     * Existe aparte de formatDateTime porque las pantallas escriben "16 ago 2026 · 07:00" con punto medio, y Intl une
     * fecha y hora con coma: se arma formatDate + formatTime.
     *
     * @param {string|null|undefined} value instante ISO con desfase
     * @param {{fallback?: string}} [options]
     * @returns {string}
     */
    function formatTime(value, {fallback = '—'} = {}) {
        const instant = parseInstant(value);
        if (!instant) {
            return fallback;
        }
        const formatter = cachedFormatter('time', {timeZone: settingsOf().timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'},
            (locale, options) => new Intl.DateTimeFormat(locale, options));
        return formatter.format(instant);
    }

    /**
     * Nombre de un mes de calendario: "agosto 2026" (long) o "ago 2026" (short).
     *
     * OJO: no se usa Intl con {month, year} juntos porque en español sale "agosto de 2026" y las pantallas dicen
     * "agosto 2026"; se pide solo el mes y se pega el año.
     *
     * @param {number} year
     * @param {number} month 1 a 12
     * @param {{style?: 'long'|'short', capitalize?: boolean}} [options] capitalize: "Agosto 2026" (fila de mes)
     */
    function formatMonthName(year, month, {style = 'long', capitalize = false} = {}) {
        if (!Number.isInteger(Number(year)) || !Number.isInteger(Number(month))) {
            return '—';
        }
        const formatter = cachedFormatter('monthName', {timeZone: 'UTC', month: style},
            (locale, options) => new Intl.DateTimeFormat(locale, options));
        // día 15 a mediodía UTC: el mismo mes en cualquier zona
        const monthName = formatter.format(new Date(Date.UTC(Number(year), Number(month) - 1, 15, 12))).replace(/\.$/, '');
        const label = `${monthName} ${year}`;
        return capitalize ? label.charAt(0).toUpperCase() + label.slice(1) : label;
    }

    /**
     * Nombre corto de un mes sin año: "ene", "feb" (rótulos de columnas de calendario y rejillas por periodo).
     *
     * @param {number} month 1 a 12
     * @returns {string}
     */
    function formatMonthShortName(month) {
        const formatter = cachedFormatter('monthShortName', {timeZone: 'UTC', month: 'short'},
            (locale, options) => new Intl.DateTimeFormat(locale, options));
        // 2024 empieza en lunes y es bisiesto: da igual, solo se pide el mes a mediodía UTC
        return formatter.format(new Date(Date.UTC(2024, Number(month) - 1, 15, 12))).replace(/\.$/, '');
    }

    /**
     * Nombre corto de un día de la semana: "lun", "mié" (renglones del calendario de actividad).
     *
     * @param {number} isoWeekday 1 = lunes ... 7 = domingo
     * @returns {string}
     */
    function formatWeekdayShortName(isoWeekday) {
        const formatter = cachedFormatter('weekdayShortName', {timeZone: 'UTC', weekday: 'short'},
            (locale, options) => new Intl.DateTimeFormat(locale, options));
        // el 1 de enero de 2024 fue lunes: lunes + (isoWeekday - 1) días
        return formatter.format(new Date(Date.UTC(2024, 0, Number(isoWeekday), 12))).replace(/\.$/, '');
    }

    return Object.freeze({
        formatNumber, formatList, formatCurrency, formatFileSize, formatPercent, formatDateTime, formatDate, formatTime, formatMonthName,
        formatMonthShortName, formatWeekdayShortName,
    });
}

// los sueltos: con la configuración vigente (la del proveedor de la raíz)
const currentFormatters = formattersOf(toolkitSettings);
export const {
    formatNumber, formatList, formatCurrency, formatFileSize, formatPercent, formatDateTime, formatDate, formatTime, formatMonthName,
    formatMonthShortName, formatWeekdayShortName,
} = currentFormatters;

/**
 * Día del mes de una fecha de calendario ("2026-08-16" → 16), sin moverla de zona.
 *
 * @param {string|null|undefined} value
 * @returns {number|null}
 */
export function dayOfPlainDate(value) {
    return parsePlainDate(value)?.day ?? null;
}
