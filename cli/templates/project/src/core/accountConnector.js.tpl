// La cuenta de la app: entrar (con su segundo paso), «¿Olvidó su contraseña?», elegir una contraseña nueva, Mi perfil y su
// seguridad ya vienen hechos en Calcita (@stackcraftmx/calcita/account). Lo ÚNICO de la app es este conector: las llamadas
// a su backend.
//
//   - Sin VITE_API_URL (en .env.local): la DEMOSTRACIÓN, todo en este navegador, para trabajar sin backend.
//   - Con VITE_API_URL: el backend de verdad. Si sigue el contrato REST de Calcita (las rutas y las respuestas están en el
//     README de Calcita, «La cuenta completa: conectar su backend»), no hay nada más que hacer. Si alguna ruta o respuesta es
//     distinta, se cambia solo esa función:
//
//       const restConnector = createRestAccountConnector(apiClient, {paths: {session: '/me'}});
//       export const accountConnector = {...restConnector, signIn: async (credentials) => …};
import {createRestAccountConnector} from '@stackcraftmx/calcita/account';
import {createDemoAccountConnector} from '@stackcraftmx/calcita/account-demo';
import QRCode from 'qrcode';

import {apiClient} from '@/core/apiClient.js';

/** La persona de la demostración (datos inventados): con su correo y cualquier contraseña se entra. */
export const DEMO_USER = Object.freeze({
    id: 'user-demo', name: 'Ana Martínez Ruiz', email: 'ana.martinez@ejemplo.com', subtitle: 'Administración', phone: '',
});

/** Sin dirección del API, la app trabaja con la demostración. */
export const USES_DEMO_ACCOUNT = !import.meta.env.VITE_API_URL;

export const accountConnector = USES_DEMO_ACCOUNT
    ? createDemoAccountConnector({
        user: DEMO_USER,
        labels: ['Administración'],
        // la sesión de la demostración se recuerda en este navegador, con el nombre de la app para no chocar con otra
        storageKey: '__APP_SLUG__:session',
        issuer: '__APP_TITLE__',
        // el QR que escanea la app autenticadora
        toQrImageUrl: (otpauthUrl) => QRCode.toDataURL(otpauthUrl, {margin: 1}),
    })
    : createRestAccountConnector(apiClient);
