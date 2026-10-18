// El conector de la cuenta de demostración (@stackcraftmx/calcita/account-demo): todo en el navegador, para arrancar sin
// backend. Va en su propia puerta para que nunca viaje por accidente a producción. También los códigos de la app
// autenticadora (TOTP), por si un servidor de mentira propio los necesita.
export {createDemoAccountConnector} from '@/account/demo/createDemoAccountConnector.js';
export {base32Of, bytesOfBase32, isValidTotpCode, newTotpSecret, otpauthUrlOf, totpCodeAt} from '@/account/demo/totp.js';
