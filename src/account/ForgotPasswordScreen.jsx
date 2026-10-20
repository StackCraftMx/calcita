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
import ComponentTexts from '@/toolkit/ComponentTexts.jsx';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {object} props
 * @param {string} [props.signInPath] la liga para regresar a entrar
 * @param {import('react').ReactNode} [props.logo]
 * @param {string} [props.brandName]
 * @param {boolean} [props.showLanguageToggle]
 * @param {boolean} [props.showColorSchemeToggle]
 * @param {object} [props.texts] los textos que cambian, con la forma de `auth` en los textos del paquete
 */
export default function ForgotPasswordScreen({signInPath, logo, brandName, showLanguageToggle = true, showColorSchemeToggle = true, texts, ...unknownProps}) {
    warnUnknownProps('ForgotPasswordScreen', unknownProps);
    const {t} = useToolkitTranslation('auth', texts);
    const {connector} = useAccount();

    return (
        <ComponentTexts namespace="auth" texts={texts}>
            <AuthLayout logo={logo} brandName={brandName} title={t('forgotPassword.title')} description={t('forgotPassword.subtitle')}
                        showLanguageToggle={showLanguageToggle} showColorSchemeToggle={showColorSchemeToggle}>
                <ForgotPasswordForm onSubmit={connector.requestPasswordReset} signInPath={signInPath} />
            </AuthLayout>
        </ComponentTexts>
    );
}
