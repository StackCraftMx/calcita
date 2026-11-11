// Lo que necesita cada campo de fecha antes de pintarse: los textos (con los de la pantalla encima), el id que une la
// etiqueta con el campo, el error ya traducido y cómo se ve en el idioma y el hourCycle del proveedor más cercano.
//
// Hook genérico: function (regla de la casa).
import {useId} from 'react';

import {displayFormatsOf} from '@/datePickers/pickerValues.js';
import {useValidationText} from '@/forms/useValidationText.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

/**
 * @param {object} field
 * @param {string} [field.name]
 * @param {string} field.kind de qué campo es (date, dateTime, time, month): da el principio del id si no hay name
 * @param {string|{key: string, values?: object}} [field.error]
 * @param {string} [field.label] el nombre del campo, para los textos de error que lo dicen
 * @param {Record<string, string|object>} [field.messages] el texto del error por regla de validación (gana al de Calcita)
 * @param {object} [field.texts] los textos que cambian, con la forma de `common`
 * @returns {{language: string, timeZone: string, inputId: string, errorText: string|undefined, validationTextOf: (error: unknown) => string|undefined, formats: ReturnType<typeof displayFormatsOf>}}
 */
export function usePickerField({name, kind, error, label, messages, texts}) {
    const {language} = useToolkitTranslation('common', texts);
    const validationTextOf = useValidationText({name, label, messages});
    const {timeZone, hourCycle} = useToolkitSettings();
    const generatedId = useId();

    return {
        language,
        timeZone,
        inputId: `${name ?? kind}-${generatedId}`,
        errorText: validationTextOf(error),
        // para el aviso del tope (useLimitWarning)
        validationTextOf,
        formats: displayFormatsOf(language, hourCycle),
    };
}
