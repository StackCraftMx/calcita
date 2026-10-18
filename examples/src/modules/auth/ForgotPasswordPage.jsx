// «¿Olvidó su contraseña?»: ForgotPasswordScreen del framework; lo del servidor sale del conector de la cuenta.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useToolkitTranslation} from '@stackcraftmx/calcita';
import {ForgotPasswordScreen} from '@stackcraftmx/calcita/account';

import {APP_PATHS} from '@/core';
import {AuthLogo} from '@/modules/auth/AuthLogo.jsx';

export const ForgotPasswordPage = () => {
    const {t} = useToolkitTranslation('shell');
    return <ForgotPasswordScreen logo={<AuthLogo />} brandName={t('title')} signInPath={APP_PATHS.signIn} />;
};
