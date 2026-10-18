// Si la app se abrió en un teléfono o tableta con Android: ahí el tema arranca en el estilo minimalista y no con vidrio.
// Dos razones: el vidrio líquido es el lenguaje de Apple (en Android la gente espera el de Google y se ve ajeno), y el
// desenfoque pesa en los teléfonos baratos, que casi todos son Android. Es solo el valor de ARRANQUE: si la app deja elegir
// el estilo, gana lo que elija la persona.
//
//   - Chrome y Edge en Android dicen su sistema directo (navigator.userAgentData.platform). Los demás (Firefox, Samsung
//     Internet, los navegadores dentro de otras apps) traen «Android» en su identificación (userAgent).
//   - Sirve para elegir un estilo, nunca para seguridad: la identificación del navegador la puede cambiar cualquiera.
//   - Pintando en el servidor no hay navigator: regresa false. Con Next, para decidir desde el servidor se le pasa lo que
//     mandó el navegador: isAndroidDevice({userAgent: headers.get('user-agent')}).
//
// Funciones puras, no renderizan: function (regla de la casa). Pruebas en androidDevice.test.js.

const ANDROID_PLATFORM = 'Android';
const ANDROID_IN_USER_AGENT = /\bAndroid\b/i;

/**
 * @param {{userAgent?: string|null, userAgentData?: {platform?: string}|null}|null} [navigatorLike] por omisión el del
 *     navegador; se pasa a mano en el servidor o en pruebas
 * @returns {boolean}
 */
export function isAndroidDevice(navigatorLike = globalThis.navigator) {
    if (!navigatorLike) {
        return false;
    }
    const platform = navigatorLike.userAgentData?.platform;
    if (platform) {
        return platform === ANDROID_PLATFORM;
    }
    return ANDROID_IN_USER_AGENT.test(navigatorLike.userAgent ?? '');
}
