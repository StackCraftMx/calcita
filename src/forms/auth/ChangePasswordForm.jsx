// El formulario de cambiar la contraseña (formik): la actual (si se pide), la nueva con su lista de reglas que se va
// palomeando, y la nueva otra vez. Sirve para «Mi perfil» y, sin la actual, para la pantalla del enlace del correo
// («elegir una contraseña nueva»).
//
//   <ChangePasswordForm onSubmit={(values) => changePassword(values)} />
//   <ChangePasswordForm requireCurrentPassword={false} onSubmit={(values) => resetPassword({token, ...values})} />
//
// Al cambiarla, los campos se vacían y el aviso dice que ya cambió (no se queda la contraseña escrita en pantalla).
//
// Genérico del paquete: function (regla de la casa).
import {useMemo, useState} from 'react';
import {Form, Formik} from 'formik';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import PasswordChecklist from '@/auth/PasswordChecklist.jsx';
import {DEFAULT_PASSWORD_POLICY, isPasswordAccepted} from '@/auth/passwordRules.js';
import FormProblemAlert from '@/forms/FormProblemAlert.jsx';
import FormTextField from '@/forms/FormTextField.jsx';
import SubmitButton from '@/forms/SubmitButton.jsx';
import {applyServerProblem} from '@/forms/applyServerProblem.js';
import {Yup} from '@/forms/validation.js';
import ComponentTexts from '@/toolkit/ComponentTexts.jsx';

/**
 * @param {object} props
 * @param {(values: {currentPassword?: string, newPassword: string}) => Promise<unknown>} props.onSubmit cambia la
 *     contraseña; si el servidor dice que no (la actual no es), truena con su problema
 * @param {boolean} [props.requireCurrentPassword] por omisión sí; sin ella para la pantalla del enlace del correo
 * @param {object} [props.policy] las reglas de la nueva; por omisión DEFAULT_PASSWORD_POLICY
 * @param {object} [props.texts] los textos que cambian, con la forma de `auth` en los textos del paquete
 */
export default function ChangePasswordForm({onSubmit, requireCurrentPassword = true, policy = DEFAULT_PASSWORD_POLICY, texts}) {
    const {t} = useToolkitTranslation('auth', texts);
    const [isDone, setIsDone] = useState(false);
    const schema = useMemo(() => Yup.object({
        currentPassword: requireCurrentPassword ? Yup.string().required() : Yup.string(),
        newPassword: Yup.string().required()
            .test('accepted', {key: 'auth:changePassword.notAccepted'}, (value) => isPasswordAccepted(value, policy))
            .test('different', {key: 'auth:changePassword.sameAsCurrent'}, (value, context) => !requireCurrentPassword || value !== context.parent.currentPassword),
        confirmPassword: Yup.string().required().oneOf([Yup.ref('newPassword')], {key: 'auth:changePassword.mismatch'}),
    }), [policy, requireCurrentPassword]);

    const submit = async (values, formikHelpers) => {
        setIsDone(false);
        try {
            await onSubmit(requireCurrentPassword
                ? {currentPassword: values.currentPassword, newPassword: values.newPassword}
                : {newPassword: values.newPassword});
            formikHelpers.resetForm();
            setIsDone(true);
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <ComponentTexts namespace="auth" texts={texts}>
            <Formik initialValues={{currentPassword: '', newPassword: '', confirmPassword: ''}} validationSchema={schema} onSubmit={submit}>
                {({values}) => (
                    <Form noValidate>
                        <Stack spacing={2}>
                            {isDone && <Alert severity="success" role="status">{t('changePassword.done')}</Alert>}
                            <FormProblemAlert />
                            {requireCurrentPassword && (
                                <FormTextField name="currentPassword" label={t('changePassword.current')} type="password" autoComplete="current-password" />
                            )}
                            <FormTextField name="newPassword" label={t('changePassword.next')} type="password" autoComplete="new-password" />
                            <PasswordChecklist password={values.newPassword} policy={policy} />
                            <FormTextField name="confirmPassword" label={t('changePassword.confirm')} type="password" autoComplete="new-password" />
                            <SubmitButton sx={{alignSelf: 'flex-start'}}>{t('changePassword.submit')}</SubmitButton>
                        </Stack>
                    </Form>
                )}
            </Formik>
        </ComponentTexts>
    );
}
