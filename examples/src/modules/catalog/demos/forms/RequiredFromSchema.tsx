// Lo obligatorio, a la vista: el asterisco sale del mismo esquema de yup que revisa el formulario, así la pantalla no repite
// a mano cuáles se piden. Se prende una vez en la raíz (<ToolkitProvider requiredFromSchema>); aquí la demo lo prende solo
// para ella con un proveedor adentro. Las condiciones cuentan: el RFC se pide solo a una empresa, y su asterisco aparece al
// elegirla. Lo que la pantalla diga con required gana.
//
// El Formik de Calcita le enseña el esquema a los campos; con el de 'formik', envuelva los campos en
// <FormSchemaProvider schema={schema}>. Con react-hook-form el esquema queda dentro del resolver: ahí cada campo lleva required.
//
// El onChange que la pantalla le pase a un campo también corre, después del de formik y con el valor nuevo.
import {useMemo, useState} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {FormSection, ToolkitProvider, toastSuccess} from '@stackcraftmx/calcita';
import {Form, FormCheckboxGroupField, FormSelectField, FormTextField, Formik, SubmitButton, Yup} from '@stackcraftmx/calcita/forms';

const CUSTOMER_KIND = Object.freeze({company: 'company', person: 'person'});
const KIND_OPTIONS = [{value: CUSTOMER_KIND.company, label: 'Empresa'}, {value: CUSTOMER_KIND.person, label: 'Persona'}];
const NOTICE_OPTIONS = [{value: 'email', label: 'Correo'}, {value: 'sms', label: 'Mensaje al celular'}];

const RequiredFromSchema = () => {
    const [chosenKind, setChosenKind] = useState('');
    // 1. El esquema de siempre: lo que pide, lleva asterisco solo
    const schema = useMemo(() => Yup.object({
        kind: Yup.string().required(),
        name: Yup.string().trim().required(),
        // solo a una empresa se le pide el RFC
        rfc: Yup.string().trim().when('kind', {is: CUSTOMER_KIND.company, then: (rule) => rule.required()}),
        email: Yup.string().trim().required().email(),
        // una lista con min(1) pide al menos uno: también lleva asterisco
        noticesBy: Yup.array().of(Yup.string()).min(1),
        nickname: Yup.string().trim(),
    }), []);

    return (
        // 2. Prendido en la raíz de su app; aquí, solo para la demo
        <ToolkitProvider requiredFromSchema>
            <Formik initialValues={{kind: CUSTOMER_KIND.person, name: '', rfc: '', email: '', noticesBy: [], nickname: ''}} validationSchema={schema}
                    onSubmit={(values) => {
                        toastSuccess(`Se guardó a ${values.name.trim()}.`);
                    }}>
                <Form noValidate>
                    <Stack spacing={2}>
                        <FormSection title="Datos del cliente" footer="Los que llevan * son obligatorios.">
                            {/* 3. Su propio onChange también corre (el valor ya lo guardó formik) */}
                            <FormSelectField name="kind" label="Tipo de cliente" options={KIND_OPTIONS}
                                             onChange={(kind) => setChosenKind(KIND_OPTIONS.find((option) => option.value === kind)?.label ?? '')} />
                            <FormTextField name="name" label="Nombre o razón social" />
                            <FormTextField name="rfc" label="RFC" uppercase />
                            <FormTextField name="email" label="Correo" type="email" />
                            <FormCheckboxGroupField name="noticesBy" label="Avisarle por" options={NOTICE_OPTIONS} />
                            <FormTextField name="nickname" label="Cómo le dicen" />
                        </FormSection>
                        {chosenKind && <Typography variant="body2" color="text.secondary">Cambió a: {chosenKind}</Typography>}
                        <SubmitButton sx={{alignSelf: 'flex-start'}}>Guardar</SubmitButton>
                    </Stack>
                </Form>
            </Formik>
        </ToolkitProvider>
    );
};

export default RequiredFromSchema;
