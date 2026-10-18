// El marco de la app (AppLayout): la barra con el logo, el menú a un lado (se encoge a íconos) o arriba, la cuenta con sus
// ajustes y, en el teléfono, la barra de pestañas. El menú NO se escribe aquí: composeMenu junta el menu.js de cada módulo
// (import.meta.glob) y deja solo lo que la sesión puede ver. Módulo nuevo = cero ediciones en el marco.
import {useMemo} from 'react';
import {Outlet, useNavigate} from 'react-router';
import {AppLayout, InstallAppSetting, MENU_POSITION, composeMenu, useAccessChecker, useMenuBadges} from '@stackcraftmx/calcita';
import {useAccount} from '@stackcraftmx/calcita/account';
import {useIsNavigating} from '@stackcraftmx/calcita/react-router';

const MENU_MODULES = import.meta.glob('/src/modules/*/menu.js', {eager: true});

// los numeritos del menú (lo pendiente de cada pantalla): {orders: 13, approvals: 2}, por el badgeKey de cada menu.js
const loadMenuBadges = async () => (await fetch('/api/menu-badges')).json();

export const AppShell = () => {
    const {session, signOut} = useAccount();
    const navigate = useNavigate();
    const canAccess = useAccessChecker();
    const isNavigating = useIsNavigating();
    const menuItems = useMemo(() => composeMenu(MENU_MODULES, {canAccess}), [canAccess]);
    const {menuBadges} = useMenuBadges(loadMenuBadges);

    const leave = async () => {
        navigate('/sign-in');
        await signOut();
    };

    return (
        <AppLayout logo={<img src="/favicon.svg" alt="" width={28} height={28} />} brandCaption="Panel de administración"
                   menuItems={menuItems} menuPosition={MENU_POSITION.side} menuBadges={menuBadges} isNavigating={isNavigating}
                   user={session?.user ?? null} profilePath="/profile" onSignOut={leave} accountSettings={<InstallAppSetting />}>
            <Outlet />
        </AppLayout>
    );
};
