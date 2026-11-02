// Lo que comparten los campos de fecha, fecha con hora, hora y mes (@stackcraftmx/calcita/date-pickers): cómo viaja cada
// valor, cómo se ve en cada idioma y cómo se nombra la zona horaria en pantalla.
//
// Cada campo viaja en texto, nunca como Date (que movería una fecha de día según la zona del navegador):
//   fecha            'AAAA-MM-DD'            una fecha de calendario: no tiene hora ni zona
//   mes              'AAAA-MM'               lo mismo, sin el día
//   hora             'HH:mm', de 24 horas    una hora del día («abre a las 09:00»): tampoco tiene zona
//   fecha con hora   '2026-11-01T18:30:00Z'  un INSTANTE: viaja en UTC y se pinta en la zona del proveedor, rotulada
// '' = vacío en los cuatro. Lo que llega del servidor con otra forma (un instante con -06:00) también se lee.
//
// Puro (sin React): se prueba con node (pickerValues.test.js).
//
// Genérico del paquete: function (regla de la casa).
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

/** Cómo viaja una fecha de calendario. */
export const CALENDAR_DATE_FORMAT = 'YYYY-MM-DD';
/** Cómo viaja un mes. */
export const CALENDAR_MONTH_FORMAT = 'YYYY-MM';
/** Cómo viaja una hora del día (de 24 horas, aunque en pantalla se vea con a.m. y p.m.). */
export const TIME_OF_DAY_FORMAT = 'HH:mm';
/** Cómo viaja un instante: en UTC, con la Z al final. */
export const INSTANT_FORMAT = 'YYYY-MM-DDTHH:mm:ss[Z]';

// una hora del día no tiene fecha, pero el selector de MUI X trabaja con fechas: se le pega a un día cualquiera sin cambio
// de horario de verano en ningún país
const TIME_OF_DAY_REFERENCE_DATE = '2000-01-03';
const CALENDAR_MONTH_PATTERN = /^\d{4}-\d{2}$/;
const TIME_OF_DAY_PATTERN = /^\d{2}:\d{2}$/;

// cómo se ve cada campo en pantalla según el idioma; el que no está aquí sale como el español (como DateInput desde antes)
const DISPLAY_FORMATS_BY_LANGUAGE = Object.freeze({
    es: {date: 'DD/MM/YYYY', month: 'MMMM YYYY'},
    en: {date: 'MM/DD/YYYY', month: 'MMMM YYYY'},
});
// la hora en pantalla según el hourCycle del proveedor: 15:10 o 03:10 p. m.
const TIME_DISPLAY_FORMATS = Object.freeze({h23: 'HH:mm', h12: 'hh:mm a'});

/**
 * dayjs con las zonas horarias puestas: el selector de MUI X las necesita para pintar un instante en otra zona.
 * OJO: se llama al usarla y no al importar el archivo: el paquete se declara sin efectos al importar (sideEffects: false)
 * y un import solo por su efecto se lo puede saltar el empaquetador del proyecto.
 *
 * @returns {typeof dayjs}
 */
export function zonedDayjs() {
    // extend no repite: cada complemento se instala una sola vez
    dayjs.extend(utc);
    dayjs.extend(timezone);
    return dayjs;
}

/**
 * Cómo se ven en pantalla los cuatro campos.
 *
 * @param {string} language el del proveedor más cercano
 * @param {'h23'|'h12'} [hourCycle] el del proveedor; por omisión de 24 horas
 * @returns {{date: string, month: string, time: string, dateTime: string, ampm: boolean}}
 */
export function displayFormatsOf(language, hourCycle = 'h23') {
    const formats = DISPLAY_FORMATS_BY_LANGUAGE[language] ?? DISPLAY_FORMATS_BY_LANGUAGE.es;
    const time = TIME_DISPLAY_FORMATS[hourCycle] ?? TIME_DISPLAY_FORMATS.h23;
    return {...formats, time, dateTime: `${formats.date} ${time}`, ampm: hourCycle === 'h12'};
}

/**
 * El nombre de la zona horaria como lo dice una persona («Hora estándar central», «Pacific Time»), para rotular la fecha
 * con hora. Si el navegador no sabe nombrarla, la zona tal cual (America/Mexico_City).
 *
 * @param {string} timeZone la zona IANA del proveedor
 * @param {string} intlLocale es-MX, en-US…
 * @param {Date} [at] el momento que se nombra (en las zonas con horario de verano el nombre puede cambiar)
 * @returns {string}
 */
export function timeZoneNameOf(timeZone, intlLocale, at = new Date()) {
    try {
        const name = new Intl.DateTimeFormat(intlLocale, {timeZone, timeZoneName: 'longGeneric'})
            .formatToParts(at)
            .find((part) => part.type === 'timeZoneName')?.value;
        return name ? name.charAt(0).toLocaleUpperCase(intlLocale) + name.slice(1) : timeZone;
    } catch {
        return timeZone;
    }
}

/**
 * Un instante como lo quiere el selector, en la zona en que se pinta; null si está vacío o no se entiende.
 *
 * @param {string|null|undefined} instantText '2026-11-01T18:30:00Z' o con su desfase ('…-06:00')
 * @param {string} timeZone la zona en que se pinta
 * @returns {import('dayjs').Dayjs|null}
 */
export function pickerInstantOf(instantText, timeZone) {
    // OJO: las zonas se ponen ANTES de ver si está vacío. El selector con timezone las pide al pintarse aunque no tenga
    // valor («Missing UTC plugin»): un «Posponer hasta…» vacío tumbaba la pantalla
    const zoned = zonedDayjs();
    if (!instantText) {
        return null;
    }
    const instant = zoned.utc(instantText);
    return instant.isValid() ? instant.tz(timeZone) : null;
}

/**
 * Lo que eligió la persona como instante en UTC; '' si está vacío o a medias.
 *
 * @param {import('dayjs').Dayjs|null} pickedValue
 * @returns {string}
 */
export function instantTextOf(pickedValue) {
    return pickedValue?.isValid() ? pickedValue.utc().format(INSTANT_FORMAT) : '';
}

/**
 * Una hora del día 'HH:mm' como la quiere el selector; null si está vacía o no tiene esa forma.
 *
 * @param {string|null|undefined} timeText
 * @returns {import('dayjs').Dayjs|null}
 */
export function pickerTimeOf(timeText) {
    if (!timeText || !TIME_OF_DAY_PATTERN.test(timeText)) {
        return null;
    }
    const time = dayjs(`${TIME_OF_DAY_REFERENCE_DATE}T${timeText}`);
    return time.isValid() ? time : null;
}

/**
 * Lo que eligió la persona como 'HH:mm'; '' si está vacío o a medias.
 *
 * @param {import('dayjs').Dayjs|null} pickedValue
 * @returns {string}
 */
export function timeTextOf(pickedValue) {
    return pickedValue?.isValid() ? pickedValue.format(TIME_OF_DAY_FORMAT) : '';
}

/**
 * Un mes 'AAAA-MM' como lo quiere el selector (su día 1); null si está vacío o no tiene esa forma.
 *
 * @param {string|null|undefined} monthText
 * @returns {import('dayjs').Dayjs|null}
 */
export function pickerMonthOf(monthText) {
    if (!monthText || !CALENDAR_MONTH_PATTERN.test(monthText)) {
        return null;
    }
    // dayjs lee 'AAAA-MM-DD' como día local (new Date lo tomaría en UTC y lo movería de día)
    const month = dayjs(`${monthText}-01`);
    return month.isValid() ? month : null;
}

/**
 * Lo que eligió la persona como 'AAAA-MM'; '' si está vacío o a medias.
 *
 * @param {import('dayjs').Dayjs|null} pickedValue
 * @returns {string}
 */
export function monthTextOf(pickedValue) {
    return pickedValue?.isValid() ? pickedValue.format(CALENDAR_MONTH_FORMAT) : '';
}
