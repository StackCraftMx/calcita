// «¿Olvidó su contraseña?», completa: pide el correo y avisa que revise su bandeja (ForgotPasswordForm). Lo del servidor
// sale del conector de la cuenta (requestPasswordReset).
//
//   <ForgotPasswordScreen signInPath="/sign-in" logo={<AppLogo />} />
//
// Genérico del paquete: function (regla de la casa).
import {useAccount} from '@/account/AccountProvider.jsx';
import {AuthLayout} from '@/appShell/AuthLayout.jsx';
import ForgotPasswordForm from '@/forms/auth/ForgotPasswordForm.jsx';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

/**
 * @param {object} props
 * @param {string} [props.signInPath] la liga para regresar a entrar
 * @param {import('react').ReactNode} [props.logo]
 * @param {string} [props.brandName]
 * @param {boolean} [props.showLanguageToggle]
 * @param {boolean} [props.showColorSchemeToggle]
 */
export default function ForgotPasswordScreen({signInPath, logo, brandName, showLanguageToggle = true, showColorSchemeToggle = true}) {
    const {t} = useToolkitTranslation('auth');
    const {connector} = useAccount();

    return (
        <AuthLayout logo={logo} brandName={brandName} title={t('forgotPassword.title')} description={t('forgotPassword.subtitle')}
                    showLanguageToggle={showLanguageToggle} showColorSchemeToggle={showColorSchemeToggle}>
            <ForgotPasswordForm onSubmit={connector.requestPasswordReset} signInPath={signInPath} />
        </AuthLayout>
    );
}
