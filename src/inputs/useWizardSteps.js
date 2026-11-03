// Lo que los dos FormWizard (formik y react-hook-form) hacen igual con el paso abierto: en qué paso empieza, avisar hacia
// afuera cada vez que cambia y qué pasa al pulsar el título de otro paso. Lo de cada librería (cómo se revisa un paso) llega
// en isStepValid.
//
// Hook genérico: function (regla de la casa).
import {useEffect, useRef, useState} from 'react';

import {WIZARD_STEP_SELECTION, openingStepOf, stepSelectionActionOf} from '@/inputs/wizardSteps.js';
import {createLogger} from '@/observability/logger.js';

const logger = createLogger('FormWizard');

/**
 * @param {object} options
 * @param {Array<{key: string}>} options.steps
 * @param {string} [options.initialStepKey] el paso en el que se abre (el que diga el servidor); por omisión el primero
 * @param {string} [options.stepSelection] uno de WIZARD_STEP_SELECTION; por omisión none
 * @param {(stepKey: string, index: number) => void} [options.onStepChange] cada vez que cambia el paso abierto
 * @param {(index: number) => Promise<boolean>} options.isStepValid revisa los campos de ese paso y marca sus errores
 * @returns {{activeIndex: number, setActiveIndex: import('react').Dispatch<import('react').SetStateAction<number>>, selectStep: ((index: number) => Promise<void>)|undefined}}
 *   selectStep es undefined con none: así WizardLayout sabe que los títulos no se pulsan
 */
export function useWizardSteps({steps, initialStepKey, stepSelection = WIZARD_STEP_SELECTION.none, onStepChange, isStepValid}) {
    const [opening] = useState(() => openingStepOf(steps, initialStepKey));
    const [activeIndex, setActiveIndex] = useState(opening.index);
    const announcedIndex = useRef(opening.index);

    // una llave que no es de ningún paso no tumba la pantalla: se abre el primero y se dice
    useEffect(() => {
        if (opening.isUnknownKey) {
            logger.warn(`initialStepKey «${initialStepKey}» no es de ningún paso: se abrió el primero`, {stepKeys: steps.map((step) => step.key)});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // hacia afuera, solo cuando de veras cambia (no al abrir): la pantalla puede guardar el paso en la dirección
    useEffect(() => {
        if (announcedIndex.current !== activeIndex) {
            announcedIndex.current = activeIndex;
            onStepChange?.(steps[activeIndex].key, activeIndex);
        }
    }, [activeIndex, onStepChange, steps]);

    const selectStep = async (index) => {
        const action = stepSelectionActionOf(stepSelection, activeIndex, index);
        if (action === 'ignore') {
            return;
        }
        // con checked, un paso con errores no se deja: se queda ahí para que se corrijan
        if (action === 'checkFirst' && !(await isStepValid(activeIndex))) {
            return;
        }
        setActiveIndex(index);
    };

    return {activeIndex, setActiveIndex, selectStep: stepSelection === WIZARD_STEP_SELECTION.none ? undefined : selectStep};
}
