// Formulario por pasos (wizard) con formik: un solo formulario partido en pasos, con pasos opcionales que se pueden omitir.
//
// Cómo se porta, para que la pantalla solo declare sus pasos:
//   - «Siguiente» revisa SOLO los campos del paso (fields) y no avanza si alguno tiene error; los marca como tocados para
//     que se vea por qué;
//   - «Omitir este paso» (solo en los opcionales) regresa sus campos a como empezaron: omitir es no dar ese dato, no dejar
//     lo que se escribió a medias;
//   - el último paso envía TODO el formulario (el esquema de yup completo vale para todos los pasos);
//   - si el envío falla por un campo de un paso anterior (yup o el 422 del servidor con applyServerProblem), el wizard
//     regresa solo a ese paso: un error que no se ve no se puede corregir.
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
import WizardLayout from '@/inputs/WizardLayout.jsx';

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
 * @param {import('react').ReactNode} props.steps[].content los campos del paso
 * @param {string} props.submitLabel ya traducido: el botón del último paso
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`: {wizard: {next, back, skip, optional, skipped, stepOf}}
 */
export default function FormWizard({steps, submitLabel, texts}) {
    const {validateForm, setFieldTouched, setFieldValue, initialValues, errors, isSubmitting} = useFormikContext();
    const [activeIndex, setActiveIndex] = useState(0);
    const [skippedKeys, setSkippedKeys] = useState(() => new Set());
    const wasSubmitting = useRef(false);
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
        const stepFields = activeStep.fields ?? [];
        const formErrors = await validateForm();
        stepFields.forEach((field) => setFieldTouched(field, true, false));
        // guard clause: el paso tiene errores; se queda para que se corrijan
        if (stepFields.some((field) => getIn(formErrors, field))) {
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
        <WizardLayout steps={steps} activeIndex={activeIndex} skippedKeys={skippedKeys} isSubmitting={isSubmitting}
                      onBack={() => setActiveIndex((currentIndex) => currentIndex - 1)} onNext={goNext} onSkip={skipStep}
                      submitButton={<SubmitButton>{submitLabel}</SubmitButton>} problemAlert={<FormProblemAlert />} texts={texts} />
    );
}
