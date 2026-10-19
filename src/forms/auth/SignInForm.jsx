// El formulario de iniciar sesión (formik): correo, contraseña, «mantener la sesión abierta» y la liga a «¿Olvidó su
// contraseña?». La pantalla solo dice qué hacer con los datos:
//
//   <AuthLayout title={t('auth:signIn.title')}>
//       <SignInForm onSubmit={(values) => signIn(values)} forgotPasswordPath="/forgot-password" />
//   </AuthLayout>
//
// Si onSubmit truena con el problema del servidor (RFC 9457; un 401 «correo o contraseña incorrectos», un 429 «espere
// un minuto»), el aviso sale arriba del formulario y lo de cada campo, en su campo (applyServerProblem).
//
// Genérico del paquete: function (regla de la casa).
import {useMemo} from 'react';
import {Form, Formik, useField} from 'formik';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

import FormProblemAlert from '@/forms/FormProblemAlert.jsx';
import FormTextField from '@/forms/FormTextField.jsx';
import SubmitButton from '@/forms/SubmitButton.jsx';
import {applyServerProblem} from '@/forms/applyServerProblem.js';
import {Yup} from '@/forms/validation.js';

/** «Mantener la sesión abierta», conectado a formik. */
function RememberMeField({label}) {
    const [field] = useField({name: 'remember', type: 'checkbox'});
    return <FormControlLabel label={label} control={<Checkbox {...field} />} />;
}

/**
 * @param {object} props
 * @param {(values: {email: string, password: string, remember: boolean}) => Promise<unknown>} props.onSubmit entra; si
 *     el servidor dice que no, truena con su problema
 * @param {string} [props.forgotPasswordPath] sin ella no sale la liga de «¿Olvidó su contraseña?»
 * @param {boolean} [props.showRememberMe] por omisión sí
 * @param {string} [props.initialEmail]
 * @param {object} [props.texts] los textos que cambian, con la forma de `auth` en los textos del paquete
 */
export default function SignInForm({onSubmit, forgotPasswordPath, showRememberMe = true, initialEmail = '', texts}) {
    const {t} = useToolkitTranslation('auth', texts);
    const {Link: RouterLink} = useToolkitNavigation();
    // el esquema se arma al pintar y no al importar: yup toma sus mensajes al armarlo (buildYupLocale ya corrió)
    const schema = useMemo(() => Yup.object({
        email: Yup.string().trim().required().email(),
        password: Yup.string().required(),
    }), []);

    const submit = async (values, formikHelpers) => {
        try {
            await onSubmit({...values, email: values.email.trim()});
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <Formik initialValues={{email: initialEmail, password: '', remember: false}} validationSchema={schema} onSubmit={submit}>
            <Form noValidate>
                <Stack spacing={2}>
                    <FormProblemAlert />
                    <FormTextField name="email" label={t('signIn.email')} type="email" autoComplete="username" autoFocus />
                    <FormTextField name="password" label={t('signIn.password')} type="password" autoComplete="current-password" />
                    <Stack direction="row" sx={{alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1}}>
                        {showRememberMe ? <RememberMeField label={t('signIn.remember')} /> : <span />}
                        {forgotPasswordPath && (
                            <Link component={RouterLink} to={forgotPasswordPath} variant="body2">{t('signIn.forgot')}</Link>
                        )}
                    </Stack>
                    <SubmitButton fullWidth>{t('signIn.submit')}</SubmitButton>
                </Stack>
            </Form>
        </Formik>
    );
}
