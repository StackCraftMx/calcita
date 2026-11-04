// Si un campo está dentro de una FormSection (el formulario agrupado de Apple): ahí cada campo se pinta como renglón, con
// la etiqueta a la izquierda y el valor a la derecha. Fuera de ella, la etiqueta va arriba del campo.
//
// El valor es false fuera de una sección (RepeatingFields lo vuelve a poner en false para sus renglones) y, dentro, cómo
// pide la sección sus renglones: {labelPlacement, labelWidth}.
//
// Va en su propio archivo y no junto a FormSection: FieldFrame lo lee, y así FieldFrame no importa a FormSection (que a su
// vez usa FormRow).
import {createContext, useContext} from 'react';

/** @typedef {{labelPlacement: string, labelWidth?: string|number}} FormSectionLayout */

/** @type {import('react').Context<false|FormSectionLayout>} */
export const FormSectionContext = createContext(/** @type {false|FormSectionLayout} */ (false));

/** true si el campo va dentro de una FormSection. */
export const useIsInsideFormSection = () => Boolean(useContext(FormSectionContext));

/** Cómo pide la sección sus renglones ({labelPlacement, labelWidth}); false fuera de una sección. */
export const useFormSectionLayout = () => useContext(FormSectionContext);
