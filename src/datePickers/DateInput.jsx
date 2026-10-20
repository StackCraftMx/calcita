// Campo de FECHA suelto con el DatePicker de MUI X (@stackcraftmx/calcita/date-pickers), con la etiqueta arriba como los
// demás campos del paquete.
//
// Al formulario (y al servidor) viaja la fecha de calendario 'AAAA-MM-DD' en texto; en pantalla se ve DD/MM/AAAA en español
// y MM/DD/AAAA en inglés, con el calendario y sus textos en el idioma activo. '' = sin fecha. Una fecha de calendario no
// tiene hora ni zona: nunca se pasa por Date (que la movería de día según la zona).
//
// Cada campo trae su LocalizationProvider con dayjs: la pantalla no tiene que poner nada alrededor.
//
// Genérico del paquete: function (regla de la casa).
import {useId} from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {enUS, esES} from '@mui/x-date-pickers/locales';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/** Cómo viaja una fecha de calendario. */
export const CALENDAR_DATE_FORMAT = 'YYYY-MM-DD';

// cómo se ve y con qué textos sale el calendario en cada idioma
const DATE_LOOK_BY_LANGUAGE = Object.freeze({
    es: {adapterLocale: 'es', displayFormat: 'DD/MM/YYYY', localeText: esES.components.MuiLocalizationProvider.defaultProps.localeText},
    en: {adapterLocale: 'en', displayFormat: 'MM/DD/YYYY', localeText: enUS.components.MuiLocalizationProvider.defaultProps.localeText},
});

/**
 * Una fecha de calendario 'AAAA-MM-DD' como la quiere el DatePicker; null si está vacía.
 *
 * @param {string|null|undefined} calendarDate
 * @returns {import('dayjs').Dayjs|null}
 */
function pickerValueOf(calendarDate) {
    // dayjs lee 'AAAA-MM-DD' como día local (a diferencia de new Date, que lo toma en UTC y lo mueve de día)
    return calendarDate ? dayjs(calendarDate) : null;
}

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|null|undefined} props.value 'AAAA-MM-DD' o ''
 * @param {(value: string) => void} props.onChange recibe 'AAAA-MM-DD' ('' al borrar o con una fecha a medias)
 * @param {() => void} [props.onBlur]
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText]
 * @param {string} [props.minDate] 'AAAA-MM-DD'
 * @param {string} [props.maxDate] 'AAAA-MM-DD'
 * @param {boolean} [props.disableFuture] p. ej. una fecha de nacimiento
 * @param {boolean} [props.disablePast] p. ej. una cita
 * @param {'day'|'month'|'year'} [props.openTo] por dónde abre el calendario (year para un nacimiento)
 * @param {boolean} [props.disabled]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function DateInput({
    name, label, value, onChange, onBlur, error, helperText = ' ', minDate, maxDate, disableFuture = false, disablePast = false,
    openTo = 'day', disabled = false, inputRef, texts,
    ...unknownProps
}) {
    warnUnknownProps('DateInput', unknownProps);
    const {t, language} = useToolkitTranslation('common', texts);
    const generatedId = useId();
    const inputId = `${name ?? 'date'}-${generatedId}`;
    const errorText = translateValidationMessage(t, error);
    const look = DATE_LOOK_BY_LANGUAGE[language] ?? DATE_LOOK_BY_LANGUAGE.es;

    return (
        <FieldFrame inputId={inputId} label={label}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={look.adapterLocale} localeText={look.localeText}>
                <DatePicker
                    format={look.displayFormat}
                    value={pickerValueOf(value)}
                    minDate={pickerValueOf(minDate) ?? undefined}
                    maxDate={pickerValueOf(maxDate) ?? undefined}
                    disableFuture={disableFuture}
                    disablePast={disablePast}
                    disabled={disabled}
                    openTo={openTo}
                    views={openTo === 'year' ? ['year', 'month', 'day'] : undefined}
                    inputRef={inputRef}
                    // una fecha a medias (25/1_/____) todavía no es fecha: viaja como vacía hasta que se complete
                    onChange={(pickedDate) => onChange(pickedDate?.isValid() ? pickedDate.format(CALENDAR_DATE_FORMAT) : '')}
                    onClose={onBlur}
                    slotProps={{
                        textField: {
                            id: inputId, name, size: 'small', fullWidth: true, onBlur, error: Boolean(errorText), helperText: errorText ?? helperText,
                        },
                    }}
                />
            </LocalizationProvider>
        </FieldFrame>
    );
}
