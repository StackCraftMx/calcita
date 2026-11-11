// Los topes de un campo de fecha dentro de un componente: los que aplican (pickerLimits.js) y cómo se escribe el tope en el
// mensaje, igual que lo enseña el campo («01/11/2026», «noviembre 2026», «09:00»). El modo (avisar o corregir) lo da
// useLimitWarning, como en los demás campos.
//
// Lo usan el campo (para su aviso y para corregir al salir) y su versión de formik (para que el tope también impida enviar
// el formulario): así los dos calculan el tope en un solo lugar.
//
// Hook genérico: function (regla de la casa).
import dayjs from 'dayjs';

import {adapterLocaleOf} from '@/datePickers/PickerFrame.jsx';
import {PICKER_KIND, fixedPickerText, pickerBoundsOf, pickerLimitProblemOf} from '@/datePickers/pickerLimits.js';
import {
    displayFormatsOf, earliestInstantFromNow, latestInstantOf, pickerInstantOf, pickerMonthOf, pickerTimeOf,
} from '@/datePickers/pickerValues.js';
import {useCurrentMinute} from '@/datePickers/useCurrentMinute.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';

/**
 * @param {string} kind PICKER_KIND
 * @param {object} limits los del campo, con la forma de su valor
 * @param {string} [limits.min]
 * @param {string} [limits.max]
 * @param {boolean} [limits.disablePast]
 * @param {boolean} [limits.disableFuture]
 * @param {number} [limits.minimumMinutesFromNow] solo fecha con hora: «al menos N minutos después de ahora»
 * @param {string} [limits.timeZone] solo fecha con hora: la zona en la que se enseña
 * @returns {{bounds: {min?: string, max?: string}, screenMin: string|undefined, hasLimits: boolean, problemOf: (value: unknown) => object|null, fixedOf: (value: string) => string}}
 *     screenMin: el mínimo de la pantalla con el de «ahora + N minutos» ya puesto (el que el selector apaga)
 */
export function usePickerLimits(kind, {min, max, disablePast, disableFuture, minimumMinutesFromNow, timeZone}) {
    const settings = useToolkitSettings();
    const hasClockRule = minimumMinutesFromNow != null;
    const currentMinute = useCurrentMinute(hasClockRule);
    // el mínimo de una fecha con hora: el de la pantalla o el de «ahora + N minutos», el más tarde (como lo pinta el campo)
    const earliest = hasClockRule ? latestInstantOf(min, earliestInstantFromNow(minimumMinutesFromNow, currentMinute)) : min;
    const bounds = pickerBoundsOf({min: earliest || undefined, max, disablePast, disableFuture}, kind);
    const formats = displayFormatsOf(settings.language, settings.hourCycle);
    const locale = adapterLocaleOf(settings.language);
    const shownTimeZone = timeZone ?? settings.timeZone;

    // el tope como se ve en el campo, en el idioma activo
    const formatBound = (bound) => {
        if (kind === PICKER_KIND.dateTime) {
            return pickerInstantOf(bound, shownTimeZone).locale(locale).format(formats.dateTime);
        }
        if (kind === PICKER_KIND.time) {
            return pickerTimeOf(bound).locale(locale).format(formats.time);
        }
        if (kind === PICKER_KIND.month) {
            return pickerMonthOf(bound).locale(locale).format(formats.month);
        }
        // dayjs lee 'AAAA-MM-DD' como día local (new Date lo toma en UTC y lo mueve de día)
        return dayjs(bound).locale(locale).format(formats.date);
    };

    return {
        bounds,
        screenMin: earliest || undefined,
        hasLimits: Boolean(bounds.min || bounds.max),
        problemOf: (value) => pickerLimitProblemOf(typeof value === 'string' ? value : '', bounds, kind, formatBound),
        fixedOf: (value) => fixedPickerText(value, bounds),
    };
}
