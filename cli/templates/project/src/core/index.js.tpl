// La puerta de core: lo que comparten dos o más módulos. Desde afuera se importa de aquí (@/core); adentro de core, por
// ruta. Core no importa módulos ni app/: si algo lo usan dos módulos, sube aquí.
export {APP_PATHS} from '@/core/appPaths.js';
export {AppLogo} from '@/core/AppLogo.jsx';
export {apiClient} from '@/core/apiClient.js';
//#if auth
export {DEMO_USER, USES_DEMO_ACCOUNT, accountConnector} from '@/core/accountConnector.js';
//#endif
