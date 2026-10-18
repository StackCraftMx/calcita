// Un formulario por pasos (FormWizard): la pantalla solo declara sus pasos y qué campos lleva cada uno. «Siguiente» revisa
// solo los del paso; un paso opcional se puede omitir; y si el servidor dice que no, regresa solo al paso con el error.
import {useMemo} from 'react';
import {toastSuccess} from '@stackcraftmx/calcita';
import {Form, FormNumberField, FormTextField, FormWizard, Formik, Yup} from '@stackcraftmx/calcita/forms';

const INITIAL_VALUES = {company: '', rfc: '', amount: '', guarantorName: ''};

const CreditWizard = () => {
    const schema = useMemo(() => Yup.object({
        company: Yup.string().trim().required(),
        rfc: Yup.string().trim().required().matches(/^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/i, {message: 'Escriba un RFC válido (12 o 13 caracteres).'}),
        amount: Yup.string().required(),
        guarantorName: Yup.string().trim(),
    }), []);

    // los pasos en orden: su nombre, los campos que revisa «Siguiente» y lo que lleva adentro
    const steps = [
        {key: 'company', label: 'Empresa', fields: ['company', 'rfc'], content: (
            <>
                <FormTextField name="company" label="Razón social" />
                <FormTextField name="rfc" label="RFC" />
            </>
        )},
        {key: 'credit', label: 'Crédito', fields: ['amount'], content: <FormNumberField name="amount" label="Monto" prefix="$" decimals={2} />},
        {key: 'guarantor', label: 'Aval', optional: true, fields: ['guarantorName'], content: <FormTextField name="guarantorName" label="Nombre del aval" />},
    ];

    return (
        <Formik initialValues={INITIAL_VALUES} validationSchema={schema} onSubmit={async (values) => {
            await new Promise((resolve) => setTimeout(resolve, 600));
            toastSuccess(`Se recibió la solicitud de ${values.company.trim()}.`);
        }}>
            <Form noValidate>
                <FormWizard steps={steps} submitLabel="Enviar solicitud" />
            </Form>
        </Formik>
    );
};

export default CreditWizard;
