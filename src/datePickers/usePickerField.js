// Lo que necesita cada campo de fecha antes de pintarse: los textos (con los de la pantalla encima), el id que une la
// etiqueta con el campo, el error ya traducido y cómo se ve en el idioma y el hourCycle del proveedor más cercano.
//
// Hook genérico: function (regla de la casa).
import {useId} from 'react';

import {displayFormatsOf} from '@/datePickers/pickerValues.js';
import {translateValidationMessage} from '@/forms/validationMessages.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

/**
 * @param {object} field
 * @param {string} [field.name]
 * @param {string} field.kind de qué campo es (date, dateTime, time, month): da el principio del id si no hay name
 * @param {string|{key: string, values?: object}} [field.error]
 * @param {object} [field.texts] los textos que cambian, con la forma de `common`
 * @returns {{language: string, timeZone: string, inputId: string, errorText: string|undefined, formats: ReturnType<typeof displayFormatsOf>}}
 */
export function usePickerField({name, kind, error, texts}) {
    const {t, language} = useToolkitTranslation('common', texts);
    const {timeZone, hourCycle} = useToolkitSettings();
    const generatedId = useId();

    return {
        language,
        timeZone,
        inputId: `${name ?? kind}-${generatedId}`,
        errorText: translateValidationMessage(t, error),
        formats: displayFormatsOf(language, hourCycle),
    };
}
