// Mensajes de error propios sin tocar el esquema: cada mensaje de Calcita lleva su regla, y el texto sale del primero que
// exista: el de la pantalla (messages del campo), el de los textos del proyecto para ese campo (validation.fields.<campo>) o
// el general. También entiende los mensajes de un sistema que ya existe ({msg} de su propio setLocale).
import {useState} from 'react';
import Typography from '@mui/material/Typography';
import {FormSection} from '@stackcraftmx/calcita';
import {Form, Formik, FormMaskedField, FormNumberField, FormTextField, SubmitButton, Yup, percentRule, sameAsFieldRule} from '@stackcraftmx/calcita/forms';
import {postalCodeRule, rfcRule} from '@stackcraftmx/calcita/mexico';

const INITIAL_VALUES = {rfc: '', postal_code: '', clabe: '', clabe_confirmation: '', commission: '', short_name: ''};

// el esquema es una función: los mensajes de Calcita (buildYupLocale) ya están puestos cuando se arma
const buildSchema = () => Yup.object({
    // 1. el de la pantalla: el campo trae `messages` para la regla rfc
    rfc: Yup.string().required().test(rfcRule()),
    // 2. el de los textos del proyecto: validation.fields.postal_code.postalCode (en todas las pantallas)
    postal_code: Yup.string().required().test(postalCodeRule()),
    clabe: Yup.string().required(),
    // 3. reglas listas: igual a otro campo y un porcentaje con tope
    clabe_confirmation: Yup.string().required().test(sameAsFieldRule('clabe', {otherLabel: 'la CLABE'})),
    commission: Yup.string().required().test(percentRule({max: 30})),
    // 4. un esquema que viene de un sistema que ya existe: su mensaje es {msg} y se entiende igual
    short_name: Yup.string().required({msg: 'catalog:forms.ownMessages.legacyRequired'}),
});

const OwnErrorMessages = () => {
    const [sent, setSent] = useState<string | null>(null);

    return (
        // async: formik apaga «Revisando» cuando termina la promesa (sin ella, el botón se quedaba girando)
        <Formik initialValues={INITIAL_VALUES} validationSchema={buildSchema()} onSubmit={async (values) => setSent(JSON.stringify(values))}>
            <Form noValidate>
                <FormSection title="Datos para facturar">
                    <FormTextField name="rfc" label="RFC" uppercase
                                   messages={{rfc: 'Revise el RFC: 12 caracteres si es empresa, 13 si es persona.'}} />
                    <FormMaskedField name="postal_code" label="Código postal" mask="postalCode" placeholder="06600" />
                    <FormMaskedField name="clabe" label="CLABE de la cuenta" mask="clabe" />
                    <FormMaskedField name="clabe_confirmation" label="Confirme la CLABE" mask="clabe" />
                    <FormNumberField name="commission" label="Comisión" suffix="%" decimals={1} />
                    <FormTextField name="short_name" label="Nombre corto" />
                </FormSection>
                <SubmitButton sx={{mt: 2}}>Revisar</SubmitButton>
                {sent && (
                    <Typography variant="body2" color="text.secondary" sx={{mt: 1.5, overflowWrap: 'anywhere'}}>Viaja: {sent}</Typography>
                )}
            </Form>
        </Formik>
    );
};

export default OwnErrorMessages;
