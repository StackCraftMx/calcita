// La cuenta completa (@stackcraftmx/calcita/account): entrar con su segundo paso, «¿Olvidó su contraseña?», elegir una
// contraseña nueva, Mi perfil y su seguridad. El proyecto solo escribe el conector (las llamadas a su backend), o usa el de
// REST si su backend sigue el contrato. Pide @simplewebauthn/browser (las llaves de acceso).
export {ACCOUNT_CONNECTOR_FUNCTIONS, missingConnectorFunctionsOf} from '@/account/accountConnector.js';
export {ACCOUNT_REST_PATHS, createRestAccountConnector, securityChangeFromResponse, securityFromResponse} from '@/account/restAccountConnector.js';
export {default as AccountProvider, useAccount} from '@/account/AccountProvider.jsx';
export {default as AccountSecuritySection} from '@/account/AccountSecuritySection.jsx';
export {default as ForgotPasswordScreen} from '@/account/ForgotPasswordScreen.jsx';
export {PROFILE_TAB, default as ProfileScreen} from '@/account/ProfileScreen.jsx';
export {default as ResetPasswordScreen} from '@/account/ResetPasswordScreen.jsx';
export {default as SignInScreen} from '@/account/SignInScreen.jsx';

// los tipos del contrato, para escribir un conector propio con la ayuda del editor (también desde TypeScript)
/** @typedef {import('@/account/accountConnector.js').AccountConnector} AccountConnector */
/** @typedef {import('@/account/accountConnector.js').AccountSession} AccountSession */
/** @typedef {import('@/account/accountConnector.js').AccountUser} AccountUser */
/** @typedef {import('@/account/accountConnector.js').AccountSecurity} AccountSecurity */
