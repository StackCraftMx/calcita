// Formulario por pasos (wizard) con formik: un solo formulario partido en pasos, con pasos opcionales que se pueden omitir.
//
// Cómo se porta, para que la pantalla solo declare sus pasos:
//   - «Siguiente» revisa SOLO los campos del paso (fields) y no avanza si alguno tiene error; los marca como tocados para
//     que se vea por qué;
//   - «Omitir este paso» (solo en los opcionales) regresa sus campos a como empezaron: omitir es no dar ese dato, no dejar
//     lo que se escribió a medias;
//   - el último paso envía TODO el formulario (el esquema de yup completo vale para todos los pasos);
//   - si el envío falla por un campo de un paso anterior (yup o el 422 del servidor con applyServerProblem), el wizard
//     regresa solo a ese paso: un error que no se ve no se puede corregir;
//   - para editar un registro (se entra a corregir un dato suelto): initialStepKey abre en el paso que diga el servidor,
//     orientation="vertical" pone los campos dentro de su paso, y stepSelection deja pulsar el título de otro paso para
//     saltar directo (free) o solo si el paso abierto no tiene errores (checked). onStepChange avisa cada cambio de paso.
//
// Va DENTRO de <Formik> y <Form>:
//   <Formik initialValues={…} validationSchema={…} onSubmit={…}>
//       <Form noValidate>
//           <FormWizard submitLabel="Enviar solicitud" steps={[
//               {key: 'datos', label: 'Sus datos', fields: ['name', 'email'], content: <>…campos…</>},
//               {key: 'aval', label: 'Aval', optional: true, fields: ['guarantor'], content: <>…</>},
//           ]} />
//       </Form>
//   </Formik>
//
// Lo que se ve vive en WizardLayout (inputs/), el mismo del FormWizard de react-hook-form. Los textos («Siguiente»,
// «Anterior»…) se cambian con `texts`: {wizard: {next: 'Continuar'}}.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useRef, useState} from 'react';
import {getIn, useFormikContext} from 'formik';

import FormProblemAlert from '@/forms/FormProblemAlert.jsx';
import SubmitButton from '@/forms/SubmitButton.jsx';
import {useWizardSteps} from '@/inputs/useWizardSteps.js';
import WizardLayout from '@/inputs/WizardLayout.jsx';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * El primer paso que tiene un campo con error; -1 si ninguno.
 *
 * @param {Array<{fields?: string[]}>} steps
 * @param {object} errors los de formik
 * @returns {number}
 */
function firstStepWithErrorOf(steps, errors) {
    return steps.findIndex((step) => (step.fields ?? []).some((field) => getIn(errors, field)));
}

/**
 * @param {object} props
 * @param {Object[]} props.steps en orden
 * @param {string} props.steps[].key
 * @param {string} props.steps[].label ya traducido
 * @param {string[]} [props.steps[].fields] los campos del paso (los que revisa «Siguiente»)
 * @param {boolean} [props.steps[].optional] se puede omitir
 * @param {import('react').ReactNode} [props.steps[].nextDisabledReason] ya traducido: el paso todavía no se puede dejar («Faltan 2
 *     documentos»). «Siguiente» se ve apagado con el motivo en un aviso (escrito, en el teléfono); en el último paso se apaga
 *     el de enviar. Con stepSelection checked tampoco se salta a un paso de adelante. Sin él, como siempre
 * @param {import('react').ReactNode} props.steps[].content los campos del paso
 * @param {boolean} [props.steps[].completed] lleva la palomita (cuando los títulos se pulsan, solo si la pantalla lo dice)
 * @param {string} props.submitLabel ya traducido: el botón del último paso
 * @param {'horizontal'|'vertical'} [props.orientation] uno de WIZARD_ORIENTATION; por omisión horizontal
 * @param {boolean} [props.hideBackOnFirstStep] en el primer paso no se pinta «Anterior»; por omisión sale apagado, como antes
 * @param {string} [props.initialStepKey] la llave del paso en el que se abre (la que diga el servidor); por omisión el primero
 * @param {'none'|'free'|'checked'} [props.stepSelection] uno de WIZARD_STEP_SELECTION: si el título de otro paso se pulsa y qué
 *   revisa antes; por omisión none (se avanza con «Siguiente», como siempre)
 * @param {(stepKey: string, index: number) => void} [props.onStepChange] cada vez que cambia el paso abierto
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`: {wizard: {next, back, skip, optional, skipped, stepOf}}
 */
export default function FormWizard({
    steps, submitLabel, orientation, hideBackOnFirstStep, initialStepKey, stepSelection, onStepChange, texts, ...unknownProps
}) {
    warnUnknownProps('FormWizard', unknownProps);
    const {validateForm, setFieldTouched, setFieldValue, initialValues, errors, isSubmitting} = useFormikContext();
    const [skippedKeys, setSkippedKeys] = useState(() => new Set());
    const wasSubmitting = useRef(false);

    // revisa SOLO los campos de un paso y los marca como tocados para que se vea por qué no avanza
    const isStepValid = async (index) => {
        const stepFields = steps[index].fields ?? [];
        const formErrors = await validateForm();
        stepFields.forEach((field) => setFieldTouched(field, true, false));
        return !stepFields.some((field) => getIn(formErrors, field));
    };
    const {activeIndex, setActiveIndex, selectStep} = useWizardSteps({steps, initialStepKey, stepSelection, onStepChange, isStepValid});
    const activeStep = steps[activeIndex];

    // al terminar un envío fallido, regresa al paso con el primer error (solo en ese momento: escribir en otro paso no
    // debe jalar a la persona de regreso)
    useEffect(() => {
        if (wasSubmitting.current && !isSubmitting) {
            const errorStepIndex = firstStepWithErrorOf(steps, errors);
            if (errorStepIndex >= 0) {
                setActiveIndex(errorStepIndex);
            }
        }
        wasSubmitting.current = isSubmitting;
    }, [isSubmitting, errors, steps]);

    const goNext = async () => {
        // el paso tiene errores: se queda ahí para que se corrijan
        if (!(await isStepValid(activeIndex))) {
            return;
        }
        setSkippedKeys((currentKeys) => new Set([...currentKeys].filter((key) => key !== activeStep.key)));
        setActiveIndex((currentIndex) => currentIndex + 1);
    };

    const skipStep = () => {
        for (const field of activeStep.fields ?? []) {
            setFieldValue(field, getIn(initialValues, field), false);
            setFieldTouched(field, false, false);
        }
        setSkippedKeys((currentKeys) => new Set([...currentKeys, activeStep.key]));
        setActiveIndex((currentIndex) => currentIndex + 1);
    };

    return (
        // un paso con su motivo para no avanzar (steps[].nextDisabledReason): «Siguiente» apagado y, en el último, también el de
        // enviar; este sí con disabled de verdad, así un Enter en un campo tampoco envía
        <WizardLayout steps={steps} activeIndex={activeIndex} skippedKeys={skippedKeys} isSubmitting={isSubmitting} orientation={orientation} hideBackOnFirstStep={hideBackOnFirstStep}
                      nextDisabledReason={activeStep.nextDisabledReason} onBack={() => setActiveIndex((currentIndex) => currentIndex - 1)}
                      onNext={goNext} onSkip={skipStep} onStepSelect={selectStep}
                      submitButton={<SubmitButton disabled={Boolean(activeStep.nextDisabledReason)}>{submitLabel}</SubmitButton>}
                      problemAlert={<FormProblemAlert />} texts={texts} />
    );
}
