// El marco de su app: la barra de arriba, el menú y la cuenta. Se escribe UNA sola vez, en src/app/AppShell.jsx, y todas
// sus pantallas se pintan adentro (en <Outlet />).
//
// Usted no escribe el menú aquí. Cada módulo trae su propia entrada (su menu.js, vea «Agregar un módulo al menú») y este
// archivo solo las junta. Agregar un módulo nuevo no toca este archivo.
import {useMemo} from 'react';
import {Outlet, useNavigate} from 'react-router';
import {AppLayout, InstallAppSetting, MENU_POSITION, composeMenu, useAccessChecker, useMenuBadges} from '@stackcraftmx/calcita';
import {useAccount} from '@stackcraftmx/calcita/account';
import {useIsNavigating} from '@stackcraftmx/calcita/react-router';

// 1. Busca el menu.js de cada carpeta de src/modules (Vite lo hace al construir; no hay una lista que mantener)
const MENU_MODULES = import.meta.glob('/src/modules/*/menu.js', {eager: true});

// 2. Los numeritos del menú (lo pendiente de cada pantalla). Su backend contesta algo como {orders: 13, approvals: 2}
const loadMenuBadges = async () => (await fetch('/api/menu-badges')).json();

export const AppShell = () => {
    const {session, signOut} = useAccount();                 // quién entró (la cuenta de Calcita)
    const navigate = useNavigate();
    const canAccess = useAccessChecker();                     // sus reglas de permisos
    const isNavigating = useIsNavigating();                   // la rayita de «cargando» al cambiar de pantalla

    // 3. Junta las entradas, las ordena y deja solo las que esta persona puede ver
    const menuItems = useMemo(() => composeMenu(MENU_MODULES, {canAccess}), [canAccess]);
    const {menuBadges} = useMenuBadges(loadMenuBadges);

    const leave = async () => {
        navigate('/sign-in');
        await signOut();
    };

    // 4. El marco. Lo de abajo es lo mínimo; la tabla «Cómo se extiende» trae todo lo demás que acepta
    return (
        <AppLayout
            logo={<img src="/favicon.svg" alt="" width={28} height={28} />}
            brandCaption="Panel de administración"               // el renglón chico bajo el nombre de la app
            menuItems={menuItems}
            menuPosition={MENU_POSITION.side}                    // el menú a un lado; MENU_POSITION.top, arriba en la barra
            menuBadges={menuBadges}
            isNavigating={isNavigating}
            user={session?.user ?? null}                         // sale en la cuenta (nombre, correo, iniciales)
            profilePath="/profile"                               // a dónde lleva «Mi perfil»
            onSignOut={leave}                                    // sin esto no sale «Salir»
            accountSettings={<InstallAppSetting />}              // ajustes suyos dentro del menú de la cuenta
        >
            <Outlet />
        </AppLayout>
    );
};
