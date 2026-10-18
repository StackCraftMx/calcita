// El MISMO formulario por pasos con react-hook-form (FormWizard de @stackcraftmx/calcita/react-hook-form): mismas props y
// mismo comportamiento que el de formik. «Siguiente» revisa solo los campos del paso, el paso opcional se omite y regresa a
// su valor de inicio, y si el servidor dice que no, vuelve solo al paso con el error. Los textos de los botones se cambian con
// `texts` (la forma de `common` en los textos del paquete).
import {useMemo} from 'react';
import {ApiError, toastSuccess} from '@stackcraftmx/calcita';
import {Yup} from '@stackcraftmx/calcita/forms';
import {
    FormNumberField, FormProvider, FormTextField, FormWizard, applyServerProblem, useForm, yupResolver,
} from '@stackcraftmx/calcita/react-hook-form';

// 1. Los campos con su valor de arranque
const INITIAL_VALUES = {company: '', rfc: '', amount: '', guarantorName: ''};
type CreditValues = typeof INITIAL_VALUES;

// ─── El servidor de mentira (en su proyecto NO va): rechaza el RFC XAXX010101000, el genérico del SAT ───
const sendRequest = async (values: CreditValues) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (values.rfc.trim().toUpperCase() === 'XAXX010101000') {
        throw new ApiError({status: 422, problem: {title: 'Revise los datos', errors: {rfc: ['El RFC genérico no sirve para un crédito.']}}});
    }
    return {message: `Se recibió la solicitud de ${values.company.trim()}.`};
};

const CreditWizardHookForm = () => {
    // 2. Las reglas de todo el formulario (cada paso revisa solo las suyas)
    const resolver = useMemo(() => yupResolver(Yup.object({
        company: Yup.string().trim().required(),
        rfc: Yup.string().trim().required().matches(/^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/i, {message: 'Escriba un RFC válido (12 o 13 caracteres).'}),
        amount: Yup.string().required(),
        guarantorName: Yup.string().trim().default(''),
    })), []);
    const form = useForm<CreditValues>({resolver, defaultValues: INITIAL_VALUES});

    // 3. Qué hacer al enviar: si el servidor rechaza el RFC, el wizard regresa solo al paso «Empresa»
    const send = form.handleSubmit(async (values) => {
        try {
            toastSuccess((await sendRequest(values)).message);
            form.reset();
        } catch (error) {
            applyServerProblem(error, form);
        }
    });

    // 4. Los pasos en orden: su nombre, los campos que revisa «Siguiente» y lo que lleva adentro
    const steps = [
        {key: 'company', label: 'Empresa', fields: ['company', 'rfc'], content: (
            <>
                <FormTextField name="company" label="Razón social" />
                <FormTextField name="rfc" label="RFC" uppercase />
            </>
        )},
        {key: 'credit', label: 'Crédito', fields: ['amount'], content: <FormNumberField name="amount" label="Monto" prefix="$" decimals={2} />},
        {key: 'guarantor', label: 'Aval', optional: true, fields: ['guarantorName'], content: <FormTextField name="guarantorName" label="Nombre del aval" />},
    ];

    return (
        <FormProvider {...form}>
            <form onSubmit={send} noValidate>
                <FormWizard steps={steps} submitLabel="Enviar solicitud" texts={{wizard: {next: 'Continuar', back: 'Regresar'}}} />
            </form>
        </FormProvider>
    );
};

export default CreditWizardHookForm;
