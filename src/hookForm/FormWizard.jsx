// Formulario por pasos (wizard) con react-hook-form: el mismo del de formik (@stackcraftmx/calcita/forms), con las mismas
// props y el mismo comportamiento:
//   - «Siguiente» revisa SOLO los campos del paso (trigger con sus nombres) y no avanza si alguno tiene error;
//   - «Omitir este paso» (solo en los opcionales) regresa sus campos a su valor de inicio (resetField): omitir es no dar ese
//     dato, no dejar lo que se escribió a medias;
//   - el último paso envía TODO el formulario (el esquema de yup completo vale para todos los pasos);
//   - si el envío falla por un campo de un paso anterior (yup o el 422 del servidor con applyServerProblem), regresa solo a
//     ese paso: un error que no se ve no se puede corregir;
//   - para editar un registro (se entra a corregir un dato suelto): initialStepKey abre en el paso que diga el servidor,
//     orientation="vertical" pone los campos dentro de su paso, y stepSelection deja pulsar el título de otro paso para
//     saltar directo (free) o solo si el paso abierto no tiene errores (checked). onStepChange avisa cada cambio de paso.
//
// Va DENTRO de <FormProvider> y del <form> con su handleSubmit (usa useFormContext):
//   const form = useForm({resolver: yupResolver(schema), defaultValues});
//   <FormProvider {...form}>
//       <form noValidate onSubmit={form.handleSubmit(send)}>
//           <FormWizard submitLabel="Enviar solicitud" steps={[
//               {key: 'datos', label: 'Sus datos', fields: ['name', 'email'], content: <>…campos…</>},
//               {key: 'aval', label: 'Aval', optional: true, fields: ['guarantor'], content: <>…</>},
//           ]} />
//       </form>
//   </FormProvider>
//
// Lo que se ve vive en WizardLayout (inputs/). Los textos se cambian con `texts`: {wizard: {next: 'Continuar'}}.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useRef, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import FormProblemAlert from '@/hookForm/FormProblemAlert.jsx';
import SubmitButton from '@/hookForm/SubmitButton.jsx';
import {useWizardSteps} from '@/inputs/useWizardSteps.js';
import WizardLayout from '@/inputs/WizardLayout.jsx';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {object} props
 * @param {Object[]} props.steps en orden
 * @param {string} props.steps[].key
 * @param {string} props.steps[].label ya traducido
 * @param {string[]} [props.steps[].fields] los campos del paso (los que revisa «Siguiente»)
 * @param {boolean} [props.steps[].optional] se puede omitir
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
    const {trigger, resetField, getFieldState, formState} = useFormContext();
    const {isSubmitting, submitCount} = formState;
    const [skippedKeys, setSkippedKeys] = useState(() => new Set());
    const wasSubmitting = useRef(false);

    // revisa SOLO los campos de un paso (trigger los marca, los pinta y pone el foco en el primero con error)
    const isStepValid = async (index) => {
        const stepFields = steps[index].fields ?? [];
        return stepFields.length === 0 || trigger(stepFields, {shouldFocus: true});
    };
    const {activeIndex, setActiveIndex, selectStep} = useWizardSteps({steps, initialStepKey, stepSelection, onStepChange, isStepValid});
    const activeStep = steps[activeIndex];

    // al terminar un envío fallido, regresa al paso con el primer error (solo en ese momento: escribir en otro paso no
    // debe jalar a la persona de regreso). OJO: getFieldState necesita formState para leer los errores de ahora
    useEffect(() => {
        if (wasSubmitting.current && !isSubmitting) {
            const errorStepIndex = steps.findIndex((step) => (step.fields ?? []).some((field) => getFieldState(field, formState).invalid));
            if (errorStepIndex >= 0) {
                setActiveIndex(errorStepIndex);
            }
        }
        wasSubmitting.current = isSubmitting;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSubmitting, submitCount]);

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
            resetField(field);
        }
        setSkippedKeys((currentKeys) => new Set([...currentKeys, activeStep.key]));
        setActiveIndex((currentIndex) => currentIndex + 1);
    };

    return (
        <WizardLayout steps={steps} activeIndex={activeIndex} skippedKeys={skippedKeys} isSubmitting={isSubmitting} orientation={orientation} hideBackOnFirstStep={hideBackOnFirstStep}
                      onBack={() => setActiveIndex((currentIndex) => currentIndex - 1)} onNext={goNext} onSkip={skipStep} onStepSelect={selectStep}
                      submitButton={<SubmitButton>{submitLabel}</SubmitButton>} problemAlert={<FormProblemAlert />} texts={texts} />
    );
}
