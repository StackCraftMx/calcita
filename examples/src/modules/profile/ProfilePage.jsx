// «Mi perfil»: ProfileScreen del framework (sus datos, seguridad con la verificación en dos pasos, sesiones y bitácora, y
// preferencias). Lo del servidor sale del conector de la cuenta (app/accountConnector.js).
//
// Lo renderiza la app: arrow (regla de la casa).
import {ProfileScreen} from '@stackcraftmx/calcita/account';

export const ProfilePage = () => <ProfileScreen />;
