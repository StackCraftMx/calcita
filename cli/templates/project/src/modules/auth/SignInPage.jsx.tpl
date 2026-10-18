// Iniciar sesión: AuthLayout y SignInForm del framework, con sus textos (namespace auth de Calcita). La pantalla solo dice qué hacer con los datos (signIn) y a dónde ir
// después: a la pantalla que se quería abrir (readRedirectParam, que no sigue una dirección de afuera) o al inicio.
//
// Abajo, mientras la app use el servidor de mentira, «Entrar con la cuenta de ejemplo»: entra sin escribir nada. Bórrelo al
// conectar el backend de verdad.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import {Navigate, useLocation} from 'react-router';
import Button from '@mui/material/Button';
import {AuthLayout, readRedirectParam, useToolkitTranslation} from '@stackcraftmx/calcita';
import {SignInForm} from '@stackcraftmx/calcita/forms';

import {APP_PATHS, AppLogo, useSession} from '@/core';
import {signIn, signInAsDemo} from '@/modules/auth/authApi.js';

export const SignInPage = () => {
    const {t} = useToolkitTranslation('auth');
    const {t: tScreens} = useToolkitTranslation('authScreens');
    const {session, refreshSession} = useSession();
    const {search} = useLocation();
    const [isEnteringDemo, setIsEnteringDemo] = useState(false);
    const nextPath = readRedirectParam(search) ?? APP_PATHS.home;

    // entró: al leer la sesión otra vez, esta pantalla se cambia sola por la siguiente (abajo)
    const enter = async (values) => {
        await signIn(values);
        await refreshSession();
    };
    const enterAsDemo = async () => {
        setIsEnteringDemo(true);
        await signInAsDemo();
        await refreshSession();
    };

    // ya tiene sesión: directo a donde iba
    if (session) {
        return <Navigate to={nextPath} replace />;
    }

    return (
        <AuthLayout logo={<AppLogo />} title={t('signIn.title')} description={t('signIn.subtitle')}
//#if !darkMode
                    showColorSchemeToggle={false}
//#endif
                    footer={<Button variant="outlined" fullWidth onClick={enterAsDemo} disabled={isEnteringDemo}>{tScreens('demo')}</Button>}>
            <SignInForm onSubmit={enter} forgotPasswordPath={APP_PATHS.forgotPassword} />
        </AuthLayout>
    );
};
