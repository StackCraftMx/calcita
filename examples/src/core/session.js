// La sesión de la app al alcance de los módulos: quién está dentro, su perfil y sus permisos, y cómo volver a leerla
// después de un cambio (guardar sus datos, cambiar los permisos de su perfil) o salir.
//
// La carga app/SessionProvider.jsx (GET auth/session); aquí solo vive el contexto, para que los módulos la lean sin
// importar nada de app/. En un proyecto real es igual: el backend manda la sesión y el front solo la lee.
import {createContext, useContext} from 'react';

export const SessionContext = createContext({
    session: null,
    refreshSession: async () => {},
    signOut: async () => {},
});

/**
 * {session: {user, profile, abilities, roles} | null, refreshSession, signOut}
 *
 * @returns {{session: object|null, refreshSession: () => Promise<void>, signOut: () => Promise<void>}}
 */
export const useSession = () => useContext(SessionContext);
