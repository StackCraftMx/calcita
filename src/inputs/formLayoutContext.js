// Si un campo está dentro de una FormSection (el formulario agrupado de Apple): ahí cada campo se pinta como renglón, con
// la etiqueta a la izquierda y el valor a la derecha. Fuera de ella, la etiqueta va arriba del campo.
//
// Va en su propio archivo y no junto a FormSection: FieldFrame lo lee, y así FieldFrame no importa a FormSection (que a su
// vez usa FormRow).
import {createContext, useContext} from 'react';

export const FormSectionContext = createContext(false);

/** true si el campo va dentro de una FormSection. */
export const useIsInsideFormSection = () => useContext(FormSectionContext);
