// Elegir una contraseña nueva desde el enlace del correo: ResetPasswordScreen del framework (lee la clave de ?token=); lo
// del servidor sale del conector de la cuenta.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useToolkitTranslation} from '@stackcraftmx/calcita';
import {ResetPasswordScreen} from '@stackcraftmx/calcita/account';

import {APP_PATHS} from '@/core';
import {AuthLogo} from '@/modules/auth/AuthLogo.jsx';

export const ResetPasswordPage = () => {
    const {t} = useToolkitTranslation('shell');
    return <ResetPasswordScreen logo={<AuthLogo />} brandName={t('title')} signInPath={APP_PATHS.signIn} forgotPasswordPath={APP_PATHS.forgotPassword} />;
};
