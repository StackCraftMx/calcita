// Mi perfil: ProfileScreen de Calcita (sus datos; seguridad con la verificación en dos pasos, las sesiones abiertas y la
// bitácora; y preferencias). Lo del servidor sale del conector de la cuenta (core/accountConnector.js).
//
// Lo renderiza la app: arrow (regla de la casa).
import {ProfileScreen} from '@stackcraftmx/calcita/account';

//#if darkMode
export const ProfilePage = () => <ProfileScreen />;
//#endif
//#if !darkMode
// sin modo oscuro, Preferencias no ofrece claro u oscuro
export const ProfilePage = () => <ProfileScreen showColorScheme={false} />;
//#endif
