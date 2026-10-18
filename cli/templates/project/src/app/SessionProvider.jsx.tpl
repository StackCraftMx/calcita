// Carga la sesión al abrir la app y la reparte: el menú, las rutas y los botones preguntan sus permisos con la regla que
// sale de aquí (createAccessChecker), y los módulos la leen con useSession (core).
//
// Mientras llega la primera respuesta se ve la pantalla de carga: sin ella, el menú se pintaría vacío un instante.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useCallback, useEffect, useMemo, useState} from 'react';
import {FullPageLoader, createAccessChecker} from '@stackcraftmx/calcita';

import {SessionContext} from '@/core';
// en un proyecto con backend: la petición GET auth/session (con apiClient de core)
import {getSession, signOut as signOutOnServer} from '@/fakeServer/accountsServer.js';

// lo que se sabe antes de la primera respuesta: ni dentro ni fuera
const NOT_LOADED = undefined;

/**
 * @param {object} props
 * @param {(canAccess: (access: object|undefined) => boolean) => import('react').ReactNode} props.children recibe la regla
 *     de permisos de la sesión (para ToolkitProvider)
 */
export const SessionProvider = ({children}) => {
    const [session, setSession] = useState(NOT_LOADED);

    const refreshSession = useCallback(async () => {
        setSession(await getSession());
    }, []);

    const signOut = useCallback(async () => {
        await signOutOnServer();
        setSession(null);
    }, []);

    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    const canAccess = useMemo(() => createAccessChecker({abilities: session?.abilities ?? [], roles: session?.roles ?? []}), [session]);
    const value = useMemo(() => ({session: session ?? null, refreshSession, signOut}), [session, refreshSession, signOut]);

    if (session === NOT_LOADED) {
        return <FullPageLoader />;
    }
    return <SessionContext.Provider value={value}>{children(canAccess)}</SessionContext.Provider>;
};
