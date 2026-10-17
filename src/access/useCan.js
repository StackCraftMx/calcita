// ¿Esta sesión puede ver esto? Con la regla que el proyecto le dio a ToolkitProvider (canAccess).
//
//   const canCancel = useCan({ability: 'orders.cancel'});
//   {canCancel && <Button>Cancelar pedido</Button>}
//
// Hook genérico del paquete: function (regla de la casa).
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';

/**
 * @param {object|undefined|null} access la regla (accessRules.js); sin ella, sí
 * @returns {boolean}
 */
export function useCan(access) {
    return useToolkitSettings().canAccess(access);
}

/**
 * La regla del proyecto, para preguntar por varias cosas a la vez (p. ej. armar el menú).
 *
 * @returns {(access: object|undefined|null) => boolean}
 */
export function useAccessChecker() {
    return useToolkitSettings().canAccess;
}
