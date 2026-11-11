// El marco que comparten los campos de fecha, fecha con hora, hora y mes: la etiqueta arriba como los demás campos del
// paquete (FieldFrame; dentro de una FormSection, el renglón de Apple) y el LocalizationProvider de MUI X con dayjs, el
// idioma activo y los textos del calendario en ese idioma. Así la pantalla no pone nada alrededor.
//
// También arma las piezas de MUI X que se repiten en los cuatro (textFieldSlotPropsOf): el campo chico, a todo lo ancho,
// con su error o su ayuda abajo, y lo que la pantalla le pase en pickerProps.slotProps.textField encima.
//
// Genérico del paquete: function (regla de la casa).

// con .js: Node (la prueba de humo, Next al pintar en el servidor) no completa la extensión de un archivo suelto de dayjs
import 'dayjs/locale/es.js';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {enUS, esES} from '@mui/x-date-pickers/locales';

import FieldFrame from '@/inputs/FieldFrame.jsx';

// el idioma de dayjs (nombres de meses y días) y los textos del calendario de MUI X en cada idioma; el que no está aquí
// sale en español, como desde antes
const ADAPTER_BY_LANGUAGE = Object.freeze({
    es: {adapterLocale: 'es', localeText: esES.components.MuiLocalizationProvider.defaultProps.localeText},
    en: {adapterLocale: 'en', localeText: enUS.components.MuiLocalizationProvider.defaultProps.localeText},
});

/**
 * El idioma de dayjs de cada idioma de la app (el que no está, español): para escribir una fecha como la escribe el campo.
 *
 * @param {string} language
 * @returns {string}
 */
export function adapterLocaleOf(language) {
    return (ADAPTER_BY_LANGUAGE[language] ?? ADAPTER_BY_LANGUAGE.es).adapterLocale;
}

/**
 * Los slotProps del selector con el campo de la casa y, encima, lo que pasó la pantalla en pickerProps.slotProps.
 *
 * @param {object} textField lo de la casa: id, name, onBlur, error, helperText
 * @param {object} [pickerProps] lo que la pantalla le pasa al selector de MUI X
 * @returns {object}
 */
export function textFieldSlotPropsOf(textField, pickerProps) {
    const screenSlotProps = pickerProps?.slotProps ?? {};
    return {
        ...screenSlotProps,
        textField: {size: 'small', fullWidth: true, ...textField, ...screenSlotProps.textField},
    };
}

/**
 * @param {object} props
 * @param {string} props.inputId
 * @param {import('react').ReactNode} props.label ya traducida
 * @param {string} props.language el del proveedor más cercano
 * @param {boolean} [props.required] el asterisco en la etiqueta
 * @param {import('react').ReactNode} props.children el selector de MUI X
 */
export default function PickerFrame({inputId, label, language, required = false, children}) {
    const adapter = ADAPTER_BY_LANGUAGE[language] ?? ADAPTER_BY_LANGUAGE.es;

    return (
        <FieldFrame inputId={inputId} label={label} required={required}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapter.adapterLocale} localeText={adapter.localeText}>
                {children}
            </LocalizationProvider>
        </FieldFrame>
    );
}
