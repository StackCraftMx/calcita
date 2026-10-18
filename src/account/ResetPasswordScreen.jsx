// Elegir una contraseña nueva desde el enlace del correo, completa: ChangePasswordForm sin la contraseña actual (quien llega
// aquí la olvidó). El enlace trae su clave (?token=) y el servidor la revisa al guardar (connector.resetPassword). Sin
// clave en la dirección, se dice que el enlace no sirve y cómo pedir otro.
//
//   <ResetPasswordScreen signInPath="/sign-in" forgotPasswordPath="/forgot-password" logo={<AppLogo />} />
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import {useAccount} from '@/account/AccountProvider.jsx';
import {AuthLayout} from '@/appShell/AuthLayout.jsx';
import ChangePasswordForm from '@/forms/auth/ChangePasswordForm.jsx';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

/**
 * @param {object} props
 * @param {string} props.signInPath a dónde ir al terminar
 * @param {string} [props.forgotPasswordPath] para pedir otro enlace si este no sirve
 * @param {string} [props.tokenParam] cómo se llama la clave en la dirección; por omisión 'token'
 * @param {import('react').ReactNode} [props.logo]
 * @param {string} [props.brandName]
 * @param {boolean} [props.showLanguageToggle]
 * @param {boolean} [props.showColorSchemeToggle]
 */
export default function ResetPasswordScreen({
    signInPath, forgotPasswordPath, tokenParam = 'token', logo, brandName, showLanguageToggle = true, showColorSchemeToggle = true,
}) {
    const {t} = useToolkitTranslation('account');
    const {connector} = useAccount();
    const {useLocation, Link} = useToolkitNavigation();
    const {search} = useLocation();
    const [isDone, setIsDone] = useState(false);
    const token = new URLSearchParams(search).get(tokenParam);

    const save = async ({newPassword}) => {
        await connector.resetPassword({token, newPassword});
        setIsDone(true);
    };

    return (
        <AuthLayout logo={logo} brandName={brandName} title={t('reset.title')} description={t('reset.subtitle')}
                    showLanguageToggle={showLanguageToggle} showColorSchemeToggle={showColorSchemeToggle}>
            {!token && (
                <Stack spacing={2}>
                    <Alert severity="error">{t('reset.missingToken')}</Alert>
                    {forgotPasswordPath && <Button component={Link} to={forgotPasswordPath} variant="contained">{t('reset.askAgain')}</Button>}
                </Stack>
            )}
            {token && isDone && (
                <Stack spacing={2}>
                    <Alert severity="success" role="status">{t('reset.done')}</Alert>
                    <Button component={Link} to={signInPath} variant="contained">{t('reset.goToSignIn')}</Button>
                </Stack>
            )}
            {token && !isDone && <ChangePasswordForm requireCurrentPassword={false} onSubmit={save} />}
        </AuthLayout>
    );
}
