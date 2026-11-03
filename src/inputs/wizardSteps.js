// Las reglas del formulario por pasos que no dependen de formik, de react-hook-form ni de React: cómo se acomodan los pasos,
// qué pasa al pulsar el título de otro paso y en qué paso se abre. Las usan WizardLayout y los dos FormWizard.
//
// Por qué existen: editar un registro de varios pasos (un expediente, un perfil) casi nunca es recorrerlos todos; se entra a
// corregir un dato suelto y el servidor dice en qué paso está. Con «Siguiente» como único camino, eso es el camino largo.
//
// Funciones puras, sin React: function (regla de la casa). Pruebas en wizardSteps.test.js.

/**
 * Cómo se acomodan los pasos:
 *   horizontal  los pasos en fila arriba y los campos abajo (lo de siempre; en el teléfono, «Paso 2 de 4» y su nombre);
 *   vertical    uno debajo del otro, como un acordeón: los campos y los botones van dentro del paso que está abierto.
 */
export const WIZARD_ORIENTATION = Object.freeze({horizontal: 'horizontal', vertical: 'vertical'});

/**
 * Qué pasa al pulsar el título de otro paso:
 *   none     los títulos no se pulsan (lo de siempre): se avanza con «Siguiente»;
 *   free     salta directo, sin revisar el paso en el que está; al enviar, el formulario regresa al primer paso con error;
 *   checked  salta solo si el paso en el que está no tiene errores (igual que «Siguiente»).
 */
export const WIZARD_STEP_SELECTION = Object.freeze({none: 'none', free: 'free', checked: 'checked'});

/**
 * El paso en el que se abre: el de esa llave (la que dice el servidor) o el primero si no llega.
 *
 * @param {Array<{key: string}>} steps
 * @param {string} [stepKey]
 * @returns {{index: number, isUnknownKey: boolean}} isUnknownKey: llegó una llave que no es de ningún paso (se abre el primero)
 */
export function openingStepOf(steps, stepKey) {
    if (stepKey === undefined || stepKey === null) {
        return {index: 0, isUnknownKey: false};
    }
    const index = steps.findIndex((step) => step.key === stepKey);
    return index >= 0 ? {index, isUnknownKey: false} : {index: 0, isUnknownKey: true};
}

/**
 * ¿Al pulsar el título del paso `targetIndex` hay que revisar antes el paso en el que está? Solo con `checked` y si de veras
 * cambia de paso. Pulsar el paso en el que ya está no hace nada.
 *
 * @param {string} stepSelection uno de WIZARD_STEP_SELECTION
 * @param {number} activeIndex
 * @param {number} targetIndex
 * @returns {'ignore'|'jump'|'checkFirst'}
 */
export function stepSelectionActionOf(stepSelection, activeIndex, targetIndex) {
    if (stepSelection === WIZARD_STEP_SELECTION.none || targetIndex === activeIndex) {
        return 'ignore';
    }
    return stepSelection === WIZARD_STEP_SELECTION.checked ? 'checkFirst' : 'jump';
}

/**
 * ¿El paso se pinta como hecho (la palomita)? En fila y sin pulsar, los de antes del que está abierto, salvo los omitidos
 * (lo de siempre). Cuando los títulos se pulsan, «antes» ya no quiere decir «hecho» (se pudo brincar): sin palomita, salvo
 * que la pantalla lo diga en `steps[].completed` (sabe qué datos ya están completos).
 *
 * @param {{key: string, completed?: boolean}} step
 * @param {object} place
 * @param {number} place.index
 * @param {number} place.activeIndex
 * @param {Set<string>} place.skippedKeys
 * @param {boolean} place.isSelectable
 * @returns {boolean}
 */
export function isStepCompleted(step, {index, activeIndex, skippedKeys, isSelectable}) {
    if (typeof step.completed === 'boolean') {
        return step.completed;
    }
    if (isSelectable || skippedKeys.has(step.key)) {
        return false;
    }
    return index < activeIndex;
}
