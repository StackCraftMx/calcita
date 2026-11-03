// Editar un registro por pasos: se entra a corregir un dato suelto, no a recorrer todo. El formulario abre en el paso que
// dice el servidor (initialStepKey), va en vertical con los campos dentro de su paso y los títulos se pulsan para saltar
// (stepSelection): directo, o solo si el paso abierto no tiene errores. onStepChange avisa cada cambio de paso.
import {useMemo, useState} from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {SegmentedControl, WIZARD_ORIENTATION, WIZARD_STEP_SELECTION, toastSuccess} from '@stackcraftmx/calcita';
import {Form, FormTextField, FormWizard, Formik, Yup} from '@stackcraftmx/calcita/forms';

// el registro como ya está guardado: le falta el folio de la constancia
const SAVED_SUPPLIER = {company: 'Ferretera del Norte', rfc: 'FNO120315AB1', email: 'compras@ferreteranorte.example', certificateFolio: '', guarantorName: ''};
// lo que contestaría el servidor al abrir el registro: qué paso hay que corregir y por qué
const SERVER_REVIEW = {stepKey: 'documents', note: 'Falta el folio de la constancia de situación fiscal.'};

type StepSelection = typeof WIZARD_STEP_SELECTION[keyof typeof WIZARD_STEP_SELECTION];

const EditingWizard = () => {
    const [stepSelection, setStepSelection] = useState<StepSelection>(WIZARD_STEP_SELECTION.free);
    const [openStepKey, setOpenStepKey] = useState(SERVER_REVIEW.stepKey);
    const schema = useMemo(() => Yup.object({
        company: Yup.string().trim().required(),
        rfc: Yup.string().trim().required().matches(/^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/i, {message: 'Escriba un RFC válido (12 o 13 caracteres).'}),
        email: Yup.string().trim().required().email(),
        certificateFolio: Yup.string().trim().required(),
        guarantorName: Yup.string().trim(),
    }), []);

    // los pasos en orden; con los títulos que se pulsan, la palomita la pone la pantalla (sabe qué datos ya están completos)
    const steps = [
        {key: 'company', label: 'Empresa', fields: ['company', 'rfc'], completed: true, content: (
            <>
                <FormTextField name="company" label="Razón social" />
                <FormTextField name="rfc" label="RFC" />
            </>
        )},
        {key: 'contact', label: 'Contacto', fields: ['email'], completed: true, content: <FormTextField name="email" label="Correo de compras" type="email" />},
        {key: 'documents', label: 'Documentos', fields: ['certificateFolio'], content: <FormTextField name="certificateFolio" label="Folio de la constancia" />},
        {key: 'guarantor', label: 'Aval', optional: true, fields: ['guarantorName'], content: <FormTextField name="guarantorName" label="Nombre del aval" />},
    ];

    return (
        <Stack spacing={2}>
            <SegmentedControl ariaLabel="Al pulsar otro paso" value={stepSelection} onChange={(value) => {
                setStepSelection(value as StepSelection);
                setOpenStepKey(SERVER_REVIEW.stepKey);
            }} options={[
                {value: WIZARD_STEP_SELECTION.free, label: 'Salta sin revisar'},
                {value: WIZARD_STEP_SELECTION.checked, label: 'Revisa antes'},
            ]} />
            <Alert severity="warning">{SERVER_REVIEW.note}</Alert>
            <Typography variant="body2" color="text.secondary">Paso abierto: {steps.find((step) => step.key === openStepKey)?.label}</Typography>
            {/* key: con otra regla de salto, el formulario vuelve a abrir en el paso que dice el servidor */}
            <Formik key={stepSelection} initialValues={SAVED_SUPPLIER} validationSchema={schema} onSubmit={async (values) => {
                await new Promise((resolve) => setTimeout(resolve, 600));
                toastSuccess(`Se guardaron los cambios de ${values.company.trim()}.`);
            }}>
                <Form noValidate>
                    <FormWizard steps={steps} submitLabel="Guardar cambios" orientation={WIZARD_ORIENTATION.vertical}
                                initialStepKey={SERVER_REVIEW.stepKey} stepSelection={stepSelection}
                                onStepChange={(stepKey) => setOpenStepKey(stepKey)} />
                </Form>
            </Formik>
        </Stack>
    );
};

export default EditingWizard;
