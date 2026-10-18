// El error que regresa el servidor de mentira: el ApiError del paquete (el mismo que arma createApiClient con una
// respuesta de verdad), con el problema RFC 9457 del backend (problem) y el mensaje ya traducido (message). Así las
// pantallas reciben exactamente lo que recibirían de un servidor real, y los componentes del paquete (applyServerProblem,
// toastProblem, ConfirmDialog, el panel de descargas) lo leen igual.
export {ApiError} from '@stackcraftmx/calcita';
