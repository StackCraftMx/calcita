// La cuenta al alcance de toda la app: carga la sesión al abrir (connector.loadSession) y la reparte. Las pantallas de la
// cuenta y la barra la leen con useAccount; el menú, las rutas y los botones preguntan sus permisos con la regla que sale de
// aquí (createAccessChecker), que se le pasa a ToolkitProvider:
//
//   <AccountProvider connector={accountConnector}>
//       {(canAccess) => <ToolkitProvider canAccess={canAccess} …>…</ToolkitProvider>}
//   </AccountProvider>
//
// Mientras llega la primera respuesta se ve la pantalla de carga (sin ella, el menú se pintaría vacío un instante); si el
// servidor no contesta, la página de error con «Intentar de nuevo», no la de entrar (no es que no haya sesión).
//
// Genérico del paquete: function (regla de la casa).
import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';

import {missingConnectorFunctionsOf} from '@/account/accountConnector.js';
import {createAccessChecker} from '@/access/accessRules.js';
import ErrorPage, {ERROR_PAGE_KIND} from '@/ui/layout/ErrorPage.jsx';
import FullPageLoader from '@/ui/layout/FullPageLoader.jsx';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

const AccountContext = createContext(null);
// lo que se sabe antes de la primera respuesta: ni dentro ni fuera
const NOT_LOADED = undefined;

/**
 * @param {object} props
 * @param {import('@/account/accountConnector.js').AccountConnector} props.connector las llamadas al backend
 * @param {unknown} [props.refreshKey] al cambiar, la sesión se vuelve a leer (p. ej. el idioma, si el backend manda los
 *     nombres de los perfiles traducidos)
 * @param {import('@/account/accountConnector.js').AccountSession|null} [props.initialSession] la sesión que ya se conoce
 *     (p. ej. la que leyó el servidor al pintar): se usa sin esperar la primera respuesta
 * @param {(canAccess: (access: object|null|undefined) => boolean) => import('react').ReactNode} props.children recibe la
 *     regla de permisos de la sesión
 */
export default function AccountProvider({connector, refreshKey, initialSession = NOT_LOADED, children, ...unknownProps}) {
    warnUnknownProps('AccountProvider', unknownProps);
    // guard clause: un conector incompleto es un error de quien lo escribió; se avisa al arrancar y no al picar un botón
    const missingFunctions = missingConnectorFunctionsOf(connector);
    if (missingFunctions.length > 0) {
        throw new Error(`Al conector de la cuenta le faltan estas funciones: ${missingFunctions.join(', ')}`);
    }

    const [session, setSession] = useState(initialSession);
    const [loadError, setLoadError] = useState(null);

    const refreshSession = useCallback(async () => {
        try {
            setSession(await connector.loadSession());
            setLoadError(null);
        } catch (error) {
            setLoadError(error);
        }
    }, [connector]);

    const signOut = useCallback(async () => {
        await connector.signOut();
        setSession(null);
    }, [connector]);

    // con la sesión ya conocida no se pide al abrir; sí cuando cambia refreshKey
    const skipsFirstLoad = useRef(initialSession !== NOT_LOADED);
    useEffect(() => {
        if (skipsFirstLoad.current) {
            skipsFirstLoad.current = false;
            return;
        }
        refreshSession();
    }, [refreshSession, refreshKey]);

    const canAccess = useMemo(() => createAccessChecker({abilities: session?.abilities ?? [], roles: session?.roles ?? []}), [session]);
    const value = useMemo(() => ({connector, session: session ?? null, refreshSession, signOut}), [connector, session, refreshSession, signOut]);

    if (loadError && session === NOT_LOADED) {
        return <ErrorPage kind={ERROR_PAGE_KIND.serverError} text={loadError.message} onRetry={refreshSession} />;
    }
    if (session === NOT_LOADED) {
        return <FullPageLoader />;
    }
    return <AccountContext.Provider value={value}>{children(canAccess)}</AccountContext.Provider>;
}

/**
 * La cuenta: {session, refreshSession, signOut, connector}. session es null si nadie está dentro.
 *
 * @returns {{session: import('@/account/accountConnector.js').AccountSession|null, refreshSession: () => Promise<void>, signOut: () => Promise<void>, connector: import('@/account/accountConnector.js').AccountConnector}}
 */
export function useAccount() {
    const account = useContext(AccountContext);
    if (!account) {
        throw new Error('useAccount necesita estar dentro de <AccountProvider>');
    }
    return account;
}
