// Elegir una contraseña nueva desde el enlace del correo (/reset-password?token=…): ResetPasswordScreen de Calcita; lo del
// servidor sale del conector de la cuenta. El backend manda en el correo la liga a esta pantalla con su clave.
//
// Lo renderiza la app: arrow (regla de la casa).
import {ResetPasswordScreen} from '@stackcraftmx/calcita/account';

import {APP_PATHS, AppLogo} from '@/core';

export const ResetPasswordPage = () => (
    <ResetPasswordScreen logo={<AppLogo />} signInPath={APP_PATHS.signIn} forgotPasswordPath={APP_PATHS.forgotPassword}
//#if !darkMode
                         showColorSchemeToggle={false}
//#endif
    />
);
