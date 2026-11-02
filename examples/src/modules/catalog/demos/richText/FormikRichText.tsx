// En un formulario de formik: FormRichTextField se conecta solo por su nombre y enseña el error de yup. Vacío viaja '', así
// que required() funciona. Pique «Guardar» vacío para ver el error.
import {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import {toastSuccess} from '@stackcraftmx/calcita';
import {Form, Formik, SubmitButton, Yup} from '@stackcraftmx/calcita/forms';
import {FormRichTextField} from '@stackcraftmx/calcita/rich-text';

const FormikRichText = () => {
    // 1. Las reglas (el esquema se arma dentro: yup toma los mensajes al armarlo, ya en el idioma activo)
    const schema = useMemo(() => Yup.object({announcement: Yup.string().required()}), []);

    return (
        <Formik initialValues={{announcement: ''}} validationSchema={schema}
                onSubmit={(values) => {
                    toastSuccess(`Viaja: ${values.announcement}`);
                }}>
            <Form noValidate>
                <Stack spacing={1.5} sx={{maxWidth: 720}}>
                    {/* 2. El campo por su nombre */}
                    <FormRichTextField name="announcement" label="Aviso para el equipo" placeholder="Qué cambió y desde cuándo" />
                    <SubmitButton sx={{alignSelf: 'flex-start'}}>Guardar</SubmitButton>
                </Stack>
            </Form>
        </Formik>
    );
};

export default FormikRichText;
