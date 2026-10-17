// «¿Olvidó su contraseña?»: AuthLayout y ForgotPasswordForm del framework. El servidor manda el correo con el enlace
// (aquí, de mentira: el enlace lleva a /reset-password).
//
// Lo renderiza la app: arrow (regla de la casa).
import {AuthLayout, useToolkitTranslation} from '@stackcraftmx/calcita';
import {ForgotPasswordForm} from '@stackcraftmx/calcita/forms';

import {APP_PATHS} from '@/core';
import {requestPasswordReset} from '@/modules/auth/authApi.js';
import {AuthLogo} from '@/modules/auth/AuthLogo.jsx';

export const ForgotPasswordPage = () => {
    const {t} = useToolkitTranslation('auth');
    return (
        <AuthLayout logo={<AuthLogo />} brandName={t('shell:title')} title={t('forgotPassword.title')} description={t('forgotPassword.subtitle')}>
            <ForgotPasswordForm onSubmit={requestPasswordReset} signInPath={APP_PATHS.signIn} />
        </AuthLayout>
    );
};
