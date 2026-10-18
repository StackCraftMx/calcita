// «¿Olvidó su contraseña?»: pide el correo y avisa que revise su bandeja (ForgotPasswordForm del framework, con
// sus textos: namespace auth de Calcita).
//
// Lo renderiza la app: arrow (regla de la casa).
import {AuthLayout, useToolkitTranslation} from '@stackcraftmx/calcita';
import {ForgotPasswordForm} from '@stackcraftmx/calcita/forms';

import {APP_PATHS, AppLogo} from '@/core';
import {requestPasswordReset} from '@/modules/auth/authApi.js';

export const ForgotPasswordPage = () => {
    const {t} = useToolkitTranslation('auth');

    return (
        <AuthLayout logo={<AppLogo />} title={t('forgotPassword.title')} description={t('forgotPassword.subtitle')}
//#if !darkMode
                    showColorSchemeToggle={false}
//#endif
        >
            <ForgotPasswordForm onSubmit={requestPasswordReset} signInPath={APP_PATHS.signIn} />
        </AuthLayout>
    );
};
