// El marco de las pantallas: AppLayout del framework (la barra con el logo, el menú por secciones y la cuenta) con el menú
// compuesto con el menu.js de cada módulo.
//
// El menú no se escribe aquí: composeMenu descubre los menu.js de los módulos y deja solo los que se pueden ver.
//#if auth
//
// Sin sesión no se entra: lleva a iniciar sesión, y de regreso a la pantalla que se quería abrir.
//#endif
//
// Lo renderiza la app: arrow (regla de la casa).
//#if auth
import {useMemo, useState} from 'react';
import {Navigate, Outlet, useLocation, useNavigate} from 'react-router';
//#endif
//#if !auth
import {useMemo} from 'react';
import {Outlet} from 'react-router';
//#endif
import {
    AppLayout,
//#if pwa
    InstallAppSetting,
//#endif
    MENU_POSITION,
    composeMenu,
    useAccessChecker,
    useToolkitTranslation,
//#if auth
    withRedirect,
//#endif
} from '@stackcraftmx/calcita';
//#if auth
import {useAccount} from '@stackcraftmx/calcita/account';
//#endif
import {useIsNavigating} from '@stackcraftmx/calcita/react-router';

//#if auth
import {APP_PATHS, AppLogo} from '@/core';
//#endif
//#if !auth
import {AppLogo} from '@/core';
//#endif

// cada módulo declara su entrada en su menu.js (orden, permiso, sección, texto e ícono)
const MENU_MODULES = import.meta.glob('@/modules/*/menu.js', {eager: true});

export const AppShell = () => {
    const {t} = useToolkitTranslation('shell');
    const canAccess = useAccessChecker();
    const isNavigating = useIsNavigating();
    const menuItems = useMemo(() => composeMenu(MENU_MODULES, {canAccess}), [canAccess]);
//#if auth
    const {session, signOut} = useAccount();
    const {pathname, search} = useLocation();
    const navigate = useNavigate();
    const [isSigningOut, setIsSigningOut] = useState(false);

    // salir a propósito: a iniciar sesión sin «regresar a», y luego se cierra la sesión
    const leave = async () => {
        setIsSigningOut(true);
        navigate(APP_PATHS.signIn);
        await signOut();
    };

    // guard clause: sin sesión, a iniciar sesión con la pantalla que se quería abrir
    if (!session) {
        return <Navigate to={withRedirect(APP_PATHS.signIn, `${pathname}${search}`)} replace />;
    }
//#endif

    return (
        <AppLayout logo={<AppLogo />} brandCaption={t('caption')} menuItems={menuItems} menuPosition={MENU_POSITION.__MENU_POSITION__}
                   isNavigating={isNavigating}
//#if auth
                   user={session.user} profilePath={APP_PATHS.profile} onSignOut={leave} isSigningOut={isSigningOut}
//#endif
//#if !darkMode
                   showColorSchemeToggle={false}
//#endif
//#if pwa
                   accountSettings={<InstallAppSetting />}
//#endif
        >
            <Outlet />
        </AppLayout>
    );
};
