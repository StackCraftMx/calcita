// Qué instrucciones de «instalar la app» le tocan a cada persona según su equipo. La lógica de walk-ot tal cual (ya
// probada en iPhone y Android), sin React ni el DOM: recibe el navigator y devuelve datos, así se prueba en node.
//
// Por qué hay variantes y no un solo juego de pasos: agregar a la pantalla de inicio NO es igual en todos lados y cambia
// con el tiempo.
//   - iOS 26 (el rediseño de Liquid Glass) escondió Compartir dentro del botón ⋯:
//       ⋯ → Compartir → Agregar a inicio → «Abrir como app web» prendido → Agregar
//   - iOS 16 a 18 tenían Compartir directo en la barra de abajo: Compartir → Agregar a inicio → Agregar
//   - Android con Chrome, Samsung Internet o Edge avisa con su propio diálogo (beforeinstallprompt): un botón, sin pasos.
//   - Firefox de Android nunca avisa: menú ⋮ → Instalar, a mano.
// Cuando un navegador cambie su camino (un iOS 27), se agrega UNA variante y sus pasos en los textos, sin reescribir nada.
//
// Funciones puras, sin React: function (regla de la casa).

// la versión de iOS que movió Compartir dentro del ⋯
const IOS_LIQUID_GLASS_MAJOR = 26;

/**
 * Lo que se le enseña a la persona. `native`: el navegador tiene su propio diálogo de instalar (un botón). Sin manera
 * razonable de instalar (Android con Chromium antes de que avise, Safari o Firefox de escritorio) no hay variante (null)
 * y no se enseña nada.
 */
export const INSTALL_VARIANT = Object.freeze({
    native: 'native',
    // iPhone y iPad con iOS 26 o más nuevo
    iosModern: 'iosModern',
    // iPhone con iOS 16 a 18
    iosClassic: 'iosClassic',
    // Firefox de Android: no avisa, va a mano
    androidFirefox: 'androidFirefox',
});

/**
 * La versión mayor de iOS del user agent del iPhone («CPU iPhone OS 26_0 like Mac OS X» → 26). El iPad (iPadOS 13 en
 * adelante) se presenta como «Macintosh» y no trae versión.
 *
 * @param {string} [userAgent]
 * @returns {number|null} null si no se pudo leer
 */
export function parseIOSMajor(userAgent = '') {
    const fromOS = /OS (\d+)_/.exec(userAgent);
    if (fromOS) {
        return Number(fromOS[1]);
    }
    // algunos user agents traen la versión como «Version/26.0»
    const fromVersion = /Version\/(\d+)/.exec(userAgent);
    return fromVersion ? Number(fromVersion[1]) : null;
}

/**
 * Describe el equipo a partir del navigator. Solo lee; no decide nada.
 *
 * @param {{userAgent?: string, maxTouchPoints?: number}} [navigatorLike] window.navigator o algo con su forma
 * @returns {{userAgent: string, isIOS: boolean, isIPhone: boolean, isIPad: boolean, isAndroid: boolean, isFirefox: boolean, isSamsung: boolean, iosMajor: number|null}}
 */
export function detectPlatform(navigatorLike) {
    const userAgent = navigatorLike?.userAgent ?? '';
    const maxTouchPoints = navigatorLike?.maxTouchPoints ?? 0;

    const isIPhone = /iPhone|iPod/i.test(userAgent);
    // OJO: el iPad con iPadOS 13 o más nuevo dice «Macintosh»; lo delata la pantalla táctil (una Mac reporta 0 toques).
    // /iPad/ cubre los iPad viejos.
    const isIPad = /iPad/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
    return {
        userAgent,
        isIOS: isIPhone || isIPad,
        isIPhone,
        isIPad,
        isAndroid: /Android/i.test(userAgent),
        isFirefox: /Firefox|FxiOS/i.test(userAgent),
        isSamsung: /SamsungBrowser/i.test(userAgent),
        // solo el iPhone trae su versión en el user agent; el iPad queda en null a propósito
        iosMajor: isIPhone ? parseIOSMajor(userAgent) : null,
    };
}

/**
 * Qué enseñar.
 *
 * @param {object} options
 * @param {ReturnType<typeof detectPlatform>} options.platform
 * @param {boolean} options.canPromptNative el navegador ya avisó que se puede instalar (beforeinstallprompt)
 * @param {boolean} options.isInstalled ya se abrió como app instalada
 * @returns {string|null} una de INSTALL_VARIANT, o null si no hay nada que ofrecer
 */
export function resolveInstallVariant({platform, canPromptNative, isInstalled}) {
    // ya instalada: no se le vuelve a ofrecer
    if (isInstalled) {
        return null;
    }
    if (canPromptNative) {
        return INSTALL_VARIANT.native;
    }
    if (platform.isIOS) {
        // iPhone con versión conocida y anterior a la 26: el camino clásico. Con iOS 26 o más nuevo, iPad o sin versión,
        // el moderno: es el vigente, y en uno viejo el ⋯ no aparece pero los pasos se pueden seguir igual
        if (platform.iosMajor !== null && platform.iosMajor < IOS_LIQUID_GLASS_MAJOR) {
            return INSTALL_VARIANT.iosClassic;
        }
        return INSTALL_VARIANT.iosModern;
    }
    if (platform.isAndroid && platform.isFirefox) {
        return INSTALL_VARIANT.androidFirefox;
    }
    // Android con Chromium que todavía no avisa: esos navegadores SÍ avisan cuando la app ya se puede instalar; enseñar
    // pasos a mano mientras tanto sería molestar. El escritorio sin aviso del navegador, tampoco
    return null;
}
