// Llaves de acceso (passkeys) desde el navegador (@stackcraftmx/calcita/passkeys). Pide @simplewebauthn/browser: por eso va
// en su propia puerta y solo viaja a la pantalla que la usa.
export {createPasskey, passkeysSupported, signWithPasskey} from '@/security/passkeys.js';
