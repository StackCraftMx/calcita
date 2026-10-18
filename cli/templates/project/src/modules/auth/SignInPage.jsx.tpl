// Iniciar sesión: SignInScreen de Calcita (la contraseña y, si la cuenta tiene verificación en dos pasos, el segundo paso).
// Lo del servidor sale del conector de la cuenta (core/accountConnector.js).
//
// Mientras la app use la demostración, abajo sale «Entrar con la cuenta de ejemplo»: entra sin escribir nada. Con el
// backend de verdad (VITE_API_URL) ya no sale.
//
// Lo renderiza la app: arrow (regla de la casa).
import Button from '@mui/material/Button';
import {useToolkitTranslation} from '@stackcraftmx/calcita';
import {SignInScreen} from '@stackcraftmx/calcita/account';

import {APP_PATHS, AppLogo, DEMO_USER, USES_DEMO_ACCOUNT} from '@/core';

// la demostración no revisa contraseñas: cualquiera sirve para la persona de ejemplo
const DEMO_PASSWORD = 'demo';

/** El botón de la demostración: entra por el mismo camino del formulario (y el mismo segundo paso). */
const DemoSignInButton = ({signIn}) => {
    const {t} = useToolkitTranslation('authScreens');
    return <Button variant="outlined" fullWidth onClick={() => signIn({email: DEMO_USER.email, password: DEMO_PASSWORD})}>{t('demo')}</Button>;
};

export const SignInPage = () => (
    <SignInScreen logo={<AppLogo />} forgotPasswordPath={APP_PATHS.forgotPassword}
//#if !darkMode
                  showColorSchemeToggle={false}
//#endif
                  footer={USES_DEMO_ACCOUNT ? ({signIn}) => <DemoSignInButton signIn={signIn} /> : undefined} />
);
