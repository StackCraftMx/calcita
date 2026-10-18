// La sesión al alcance de los módulos: quién está dentro, sus permisos, y cómo volver a leerla después de un cambio
// (guardar sus datos) o salir.
//
// La carga app/SessionProvider.jsx; aquí solo vive el contexto, para que los módulos la lean sin importar nada de app/.
import {createContext, useContext} from 'react';

export const SessionContext = createContext({
    session: null,
    refreshSession: async () => {},
    signOut: async () => {},
});

/**
 * {session: {user, abilities, roles} | null, refreshSession, signOut}
 *
 * @returns {{session: object|null, refreshSession: () => Promise<void>, signOut: () => Promise<void>}}
 */
export const useSession = () => useContext(SessionContext);
