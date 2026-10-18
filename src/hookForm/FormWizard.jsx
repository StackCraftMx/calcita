// Formulario por pasos (wizard) con react-hook-form: el mismo del de formik (@stackcraftmx/calcita/forms), con las mismas
// props y el mismo comportamiento:
//   - «Siguiente» revisa SOLO los campos del paso (trigger con sus nombres) y no avanza si alguno tiene error;
//   - «Omitir este paso» (solo en los opcionales) regresa sus campos a su valor de inicio (resetField): omitir es no dar ese
//     dato, no dejar lo que se escribió a medias;
//   - el último paso envía TODO el formulario (el esquema de yup completo vale para todos los pasos);
//   - si el envío falla por un campo de un paso anterior (yup o el 422 del servidor con applyServerProblem), regresa solo a
//     ese paso: un error que no se ve no se puede corregir.
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
import WizardLayout from '@/inputs/WizardLayout.jsx';

/**
 * @param {object} props
 * @param {Object[]} props.steps en orden
 * @param {string} props.steps[].key
 * @param {string} props.steps[].label ya traducido
 * @param {string[]} [props.steps[].fields] los campos del paso (los que revisa «Siguiente»)
 * @param {boolean} [props.steps[].optional] se puede omitir
 * @param {import('react').ReactNode} props.steps[].content los campos del paso
 * @param {string} props.submitLabel ya traducido: el botón del último paso
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`: {wizard: {next, back, skip, optional, skipped, stepOf}}
 */
export default function FormWizard({steps, submitLabel, texts}) {
    const {trigger, resetField, getFieldState, formState} = useFormContext();
    const {isSubmitting, submitCount} = formState;
    const [activeIndex, setActiveIndex] = useState(0);
    const [skippedKeys, setSkippedKeys] = useState(() => new Set());
    const wasSubmitting = useRef(false);
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
        const stepFields = activeStep.fields ?? [];
        // guard clause: el paso tiene errores; se queda para que se corrijan (trigger los marca y los pinta)
        const isStepValid = stepFields.length === 0 || await trigger(stepFields, {shouldFocus: true});
        if (!isStepValid) {
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
        <WizardLayout steps={steps} activeIndex={activeIndex} skippedKeys={skippedKeys} isSubmitting={isSubmitting}
                      onBack={() => setActiveIndex((currentIndex) => currentIndex - 1)} onNext={goNext} onSkip={skipStep}
                      submitButton={<SubmitButton>{submitLabel}</SubmitButton>} problemAlert={<FormProblemAlert />} texts={texts} />
    );
}
