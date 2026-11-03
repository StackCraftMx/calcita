// El texto del error de un campo, dentro de un componente: con el idioma, los textos y la lectura de mensajes
// (readValidationMessage) del proveedor más cercano. Lo usan todos los campos de la casa; un campo propio del proyecto
// también:
//
//   const validationTextOf = useValidationText({name, label, messages});
//   const errorText = validationTextOf(error);
//
// No importa yup (validationMessages.js tampoco): sirve en un proyecto que valida con otra cosa.
//
// Hook genérico: function (regla de la casa).
import {useCallback} from 'react';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

/**
 * @param {object} [options]
 * @param {string} [options.name] el name del campo: para su texto propio (validation:fields.<campo>.<regla>)
 * @param {string} [options.label] el nombre del campo, para los textos que lo dicen ({{label}})
 * @param {Record<string, string|object>} [options.messages] los textos de la pantalla para este campo, por regla
 * @returns {(error: unknown) => string|undefined}
 */
export function useValidationText({name, label, messages} = {}) {
    const {readValidationMessage} = useToolkitSettings();
    const {t} = useToolkitTranslation(['validation']);
    const labelText = typeof label === 'string' ? label : undefined;
    return useCallback(
        (error) => translateValidationMessage(t, error, {label: labelText, messages, readMessage: readValidationMessage, fieldName: name}),
        [t, name, labelText, messages, readValidationMessage],
    );
}
