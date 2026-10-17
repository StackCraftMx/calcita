// El marco de las pantallas con sesión: AppLayout del framework (la barra con el logo, el menú lateral por secciones,
// como las plantillas de MUI) con el menú compuesto con el menu.js de cada módulo y la persona de la sesión.
//
// Sin sesión no se entra: lleva a iniciar sesión, y de regreso a la pantalla que se quería abrir (?next=).
//
// Lo que se agrega sin tocar el framework: el ajuste del vidrio líquido en el menú de la cuenta (accountSettings), «Entrar con otro
// perfil» en el menú de la cuenta (accountMenuItems) y la tarjeta de abajo del menú (sidebarFooter).
//
// El menú no se escribe aquí: composeMenu descubre los menu.js de los módulos y deja solo los que la sesión puede ver;
// al cambiar los permisos de su perfil, el menú cambia solo.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import {Navigate, Outlet, useLocation, useNavigate} from 'react-router';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SwitchAccountOutlinedIcon from '@mui/icons-material/SwitchAccountOutlined';
import {AppLayout, composeMenu, useAccessChecker, useToolkitTranslation, useMenuBadges} from '@stackcraftmx/calcita';
import {useIsNavigating} from '@stackcraftmx/calcita/react-router';

import {GlassModeSetting} from '@/app/GlassModeSetting.jsx';
import {fetchMenuBadges} from '@/app/menuBadgesApi.js';
import {APP_PATHS, useSession} from '@/core';

// cada módulo declara su entrada en su menu.js (orden, permiso, sección, texto e ícono)
const MENU_MODULES = import.meta.glob('@/modules/*/menu.js', {eager: true});

/** El logo de los ejemplos: el de Stackcraft, redondo. */
const Logo = () => <Box component="img" src="/branding/stackcraft-logo.svg" alt="" sx={{width: 28, height: 28, borderRadius: '50%'}} />;

/** La tarjeta de abajo del menú lateral. */
const SidebarCard = () => {
    const {t} = useToolkitTranslation('shell');
    return (
        <Paper variant="outlined" sx={{p: 1.5, whiteSpace: 'normal', bgcolor: 'background.default'}}>
            <Typography variant="subtitle2">{t('footer.title')}</Typography>
            <Typography variant="caption" color="text.secondary" component="p">{t('footer.text')}</Typography>
        </Paper>
    );
};

export const AppShell = () => {
    const {t} = useToolkitTranslation('shell');
    const {session, signOut} = useSession();
    const {pathname, search} = useLocation();
    const navigate = useNavigate();
    const canAccess = useAccessChecker();
    const isNavigating = useIsNavigating();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const menuItems = useMemo(() => composeMenu(MENU_MODULES, {canAccess}), [canAccess]);

    // salir a propósito: a iniciar sesión sin «regresar a», y luego se cierra la sesión
    const leave = async () => {
        setIsSigningOut(true);
        navigate(APP_PATHS.signIn);
        await signOut();
    };
    const accountMenuItems = [{onClick: leave, labelKey: 'shell:account.switchProfile', Icon: SwitchAccountOutlinedIcon}];

    // los numeritos del menú (lo pendiente de cada pantalla), pedidos al servidor
    const {menuBadges} = useMenuBadges(fetchMenuBadges);

    // guard clause: sin sesión, a iniciar sesión con la pantalla que se quería abrir
    if (!session) {
        return <Navigate to={`${APP_PATHS.signIn}?next=${encodeURIComponent(`${pathname}${search}`)}`} replace />;
    }

    return (
        <AppLayout logo={<Logo />} brandName={t('title')} brandCaption={t('caption')} menuItems={menuItems} user={session.user}
                   profilePath={APP_PATHS.profile} accountMenuItems={accountMenuItems} onSignOut={leave} isSigningOut={isSigningOut}
                   isNavigating={isNavigating} menuBadges={menuBadges} accountSettings={<GlassModeSetting />} sidebarFooter={<SidebarCard />}>
            <Outlet />
        </AppLayout>
    );
};
