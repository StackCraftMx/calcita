// El formulario de «¿Olvidó su contraseña?» (formik): el correo, y al enviarlo, el aviso de que revise su correo en el
// mismo lugar, con la liga para regresar.
//
// OJO, a propósito: el aviso dice «si {{correo}} tiene una cuenta», aunque el sistema sepa si la tiene. Decir «ese correo
// no existe» le confirma a cualquiera qué correos sí tienen cuenta (enumeración de cuentas); el backend también contesta
// igual en los dos casos.
//
// Genérico del paquete: function (regla de la casa).
import {useMemo, useState} from 'react';
import {Form, Formik} from 'formik';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

import FormProblemAlert from '@/forms/FormProblemAlert.jsx';
import FormTextField from '@/forms/FormTextField.jsx';
import SubmitButton from '@/forms/SubmitButton.jsx';
import {applyServerProblem} from '@/forms/applyServerProblem.js';
import {Yup} from '@/forms/validation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {object} props
 * @param {(values: {email: string}) => Promise<unknown>} props.onSubmit pide el enlace; si el servidor falla, truena con su
 *     problema
 * @param {string} [props.signInPath] la liga para regresar a iniciar sesión
 * @param {object} [props.texts] los textos que cambian, con la forma de `auth` en los textos del paquete
 */
export default function ForgotPasswordForm({onSubmit, signInPath, texts, ...unknownProps}) {
    warnUnknownProps('ForgotPasswordForm', unknownProps);
    const {t} = useToolkitTranslation('auth', texts);
    const {Link: RouterLink} = useToolkitNavigation();
    const [sentToEmail, setSentToEmail] = useState(null);
    const schema = useMemo(() => Yup.object({email: Yup.string().trim().required().email()}), []);

    const backToSignIn = signInPath && <Link component={RouterLink} to={signInPath} variant="body2">{t('forgotPassword.backToSignIn')}</Link>;

    const submit = async (values, formikHelpers) => {
        const email = values.email.trim();
        try {
            await onSubmit({email});
            setSentToEmail(email);
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    if (sentToEmail) {
        return (
            <Stack spacing={2}>
                <Alert severity="success" role="status">
                    <AlertTitle>{t('forgotPassword.sentTitle')}</AlertTitle>
                    {t('forgotPassword.sent', {email: sentToEmail})}
                </Alert>
                {backToSignIn}
            </Stack>
        );
    }

    return (
        <Formik initialValues={{email: ''}} validationSchema={schema} onSubmit={submit}>
            <Form noValidate>
                <Stack spacing={2}>
                    <FormProblemAlert />
                    <FormTextField name="email" label={t('forgotPassword.email')} type="email" autoComplete="username" autoFocus />
                    <SubmitButton fullWidth>{t('forgotPassword.submit')}</SubmitButton>
                    {backToSignIn}
                </Stack>
            </Form>
        </Formik>
    );
}
