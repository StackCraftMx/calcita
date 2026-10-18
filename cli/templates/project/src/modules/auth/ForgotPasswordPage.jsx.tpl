// «¿Olvidó su contraseña?»: ForgotPasswordScreen de Calcita; lo del servidor sale del conector de la cuenta.
//
// Lo renderiza la app: arrow (regla de la casa).
import {ForgotPasswordScreen} from '@stackcraftmx/calcita/account';

import {APP_PATHS, AppLogo} from '@/core';

export const ForgotPasswordPage = () => (
    <ForgotPasswordScreen logo={<AppLogo />} signInPath={APP_PATHS.signIn}
//#if !darkMode
                          showColorSchemeToggle={false}
//#endif
    />
);
