// Las llamadas de «Mi perfil» que no son de la cuenta (las de la cuenta van por el conector, app/accountConnector.js). Aquí
// iría axios; en los ejemplos van al servidor de mentira, con la misma forma.
export {getMyNotifications, updateMyNotifications} from '@/fakeServer/accountsServer.js';
