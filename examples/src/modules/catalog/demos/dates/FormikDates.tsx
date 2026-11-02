// Los mismos campos en un formulario de formik: FormDateTimeField, FormTimeField y FormMonthField se conectan solos a su
// campo por `name` y enseñan el error de yup. Dentro de una FormSection se vuelven renglones, como los demás campos.
import {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import {FormSection, toastSuccess} from '@stackcraftmx/calcita';
import {FormDateTimeField, FormMonthField, FormTimeField} from '@stackcraftmx/calcita/date-pickers';
import {Form, Formik, SubmitButton, Yup} from '@stackcraftmx/calcita/forms';

const INITIAL_VALUES = {visitAt: '', reminderTime: '08:00', billingMonth: ''};
type VisitValues = typeof INITIAL_VALUES;

// ─── El servidor de mentira (en su proyecto NO va) ───
const scheduleVisit = async (values: VisitValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {message: `Viaja: ${JSON.stringify(values)}`};
};

const FormikDates = () => {
    // 1. Las reglas: el esquema se arma dentro del componente (yup toma los mensajes al armarlo, ya en el idioma activo)
    const schema = useMemo(() => Yup.object({
        visitAt: Yup.string().required(),
        reminderTime: Yup.string().required(),
        billingMonth: Yup.string().required(),
    }), []);

    return (
        <Formik initialValues={INITIAL_VALUES} validationSchema={schema} onSubmit={async (values) => toastSuccess((await scheduleVisit(values)).message)}>
            <Form noValidate>
                <Stack spacing={2} sx={{maxWidth: 560}}>
                    {/* 2. Los campos por su nombre: cada uno viaja en su forma (instante en UTC, HH:mm, AAAA-MM) */}
                    <FormSection title="Visita">
                        <FormDateTimeField name="visitAt" label="Fecha y hora" disablePast minutesStep={30} />
                        <FormTimeField name="reminderTime" label="Recordar el día a las" />
                        <FormMonthField name="billingMonth" label="Se cobra en" />
                    </FormSection>
                    <SubmitButton sx={{alignSelf: 'flex-start'}}>Agendar</SubmitButton>
                </Stack>
            </Form>
        </Formik>
    );
};

export default FormikDates;
