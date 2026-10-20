// Cuentas del calendario de actividad (CalendarHeatmap): niveles de color y semanas en columnas.
//
// Separadas del componente para probarlas con node --test sin navegador ni MUI.
//
// Reglas:
//   - es MAGNITUD: cuatro niveles de un solo tono más "sin actividad";
//   - los niveles se cortan por CUARTILES de los días con actividad, no por valores fijos: con 120 registros al día o
//     con 12 000 el calendario se lee igual de bien;
//   - las semanas empiezan en LUNES y el mes se rotula en la semana donde cae su día 1.
//
// Fechas de calendario ("2026-08-16") con aritmética en UTC: una fecha sin hora no tiene zona y así no se corre de día.
//
// Funciones puras, no renderizan: function (regla de la casa).

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;
// Intl en inglés de Canadá escribe la fecha como AAAA-MM-DD: así sale «hoy» en la zona del negocio sin armar el texto a mano
const PLAIN_DATE_LOCALE = 'en-CA';

/** Nivel 0 = sin actividad; 1 a 4 = el tono cada vez más lleno. */
export const HEATMAP_LEVELS = [0, 1, 2, 3, 4];

/**
 * Cortes de los cuartiles de los valores con actividad.
 *
 * @param {number[]} values un valor por día (los ceros no cuentan)
 * @returns {[number, number, number]} q1, q2 y q3
 */
export function quantileThresholds(values) {
    const activeValues = values.filter((value) => value > 0).sort((first, second) => first - second);
    // guard clause: sin actividad cualquier valor positivo sería el nivel más alto; da igual, no hay ninguno
    if (!activeValues.length) {
        return [1, 1, 1];
    }
    const valueAt = (fraction) => activeValues[Math.min(activeValues.length - 1, Math.floor(fraction * activeValues.length))];
    return [valueAt(0.25), valueAt(0.5), valueAt(0.75)];
}

/**
 * Nivel de color de un valor.
 *
 * @param {number} value
 * @param {[number, number, number]} thresholds lo que regresa quantileThresholds
 * @returns {0|1|2|3|4}
 */
export function levelOf(value, [firstQuartile, median, thirdQuartile]) {
    if (!value) {
        return 0;
    }
    // OJO: intervalos abiertos por arriba ([q1, q2) es el nivel 2). Con «<=» el valor más repetido, que suele ser
    // la carga completa de cada corte, caía en el nivel 1 y el calendario entero se veía deslavado
    if (value < firstQuartile) {
        return 1;
    }
    if (value < median) {
        return 2;
    }
    if (value < thirdQuartile) {
        return 3;
    }
    return 4;
}

/** "2026-08-16" → milisegundos UTC de ese día a las 00:00. */
function utcDayOf(plainDate) {
    const [year, month, day] = plainDate.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
}

/** milisegundos UTC → "2026-08-16". */
function plainDateOf(utcMilliseconds) {
    return new Date(utcMilliseconds).toISOString().slice(0, 10);
}

/**
 * El día de hoy (AAAA-MM-DD) en la zona del negocio: en la noche de México, en UTC ya es mañana.
 *
 * @param {string} timeZone zona de Intl ('America/Mexico_City')
 * @param {Date} [now]
 * @returns {string}
 */
export function todayInZone(timeZone, now = new Date()) {
    return new Intl.DateTimeFormat(PLAIN_DATE_LOCALE, {timeZone, year: 'numeric', month: '2-digit', day: '2-digit'}).format(now);
}

/**
 * El rango del calendario con lo que falte: sin endsOn termina hoy y sin startsOn abarca el último año (desde el día
 * siguiente al mismo de hace un año). OJO: antes, sin las dos fechas el calendario tronaba al abrir la pantalla.
 *
 * @param {{startsOn?: string, endsOn?: string, today: string}} range fechas de calendario AAAA-MM-DD
 * @returns {{startsOn: string, endsOn: string}}
 */
export function calendarRangeOf({startsOn, endsOn, today}) {
    const lastDay = endsOn ?? today;
    if (startsOn) {
        return {startsOn, endsOn: lastDay};
    }
    const [year, month, day] = lastDay.split('-').map(Number);
    // Date.UTC acomoda solo el día que se pasa del mes (31 + 1 → día 1 del siguiente; 29 de febrero → 1 de marzo)
    return {startsOn: plainDateOf(Date.UTC(year - 1, month - 1, day + 1)), endsOn: lastDay};
}

/**
 * Semanas del calendario: columnas de lunes a domingo desde la semana de startsOn hasta la de endsOn.
 *
 * Los días fuera del rango (antes de startsOn en la primera semana o después de endsOn en la última) van en null para
 * que la rejilla deje su hueco sin pintarlos como "sin actividad".
 *
 * @param {{startsOn: string, endsOn: string, days: Array<{date: string, value: number, detail?: string}>}} calendar
 *        days solo trae los días con actividad (el resto vale 0)
 * @returns {{weeks: Array<Array<{date: string, value: number, detail?: string}|null>>, monthMarks: Array<number|null>, thresholds: [number, number, number]}}
 *          monthMarks: el mes (1 a 12) que empieza en cada semana, o null
 */
export function calendarWeeksOf({startsOn, endsOn, days}) {
    const dayByDate = new Map(days.map((day) => [day.date, day]));
    const firstDay = utcDayOf(startsOn);
    const lastDay = utcDayOf(endsOn);
    // getUTCDay: 0 = domingo; lo pasamos a 0 = lunes
    const mondayOffset = (new Date(firstDay).getUTCDay() + 6) % DAYS_PER_WEEK;
    const weeks = [];
    const monthMarks = [];

    for (let weekStart = firstDay - mondayOffset * DAY_MILLISECONDS; weekStart <= lastDay; weekStart += DAYS_PER_WEEK * DAY_MILLISECONDS) {
        const week = [];
        let monthMark = null;
        for (let weekday = 0; weekday < DAYS_PER_WEEK; weekday++) {
            const dayMilliseconds = weekStart + weekday * DAY_MILLISECONDS;
            if (dayMilliseconds < firstDay || dayMilliseconds > lastDay) {
                week.push(null);
                continue;
            }
            const date = plainDateOf(dayMilliseconds);
            if (date.endsWith('-01')) {
                monthMark = Number(date.slice(5, 7));
            }
            week.push({date, value: dayByDate.get(date)?.value ?? 0, detail: dayByDate.get(date)?.detail});
        }
        weeks.push(week);
        monthMarks.push(monthMark);
    }

    return {weeks, monthMarks, thresholds: quantileThresholds(days.map((day) => day.value))};
}
