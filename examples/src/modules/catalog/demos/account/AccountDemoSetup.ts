// Sin backend todavía: la cuenta de demostración, todo en el navegador (con la verificación en dos pasos funcionando con
// el teléfono de verdad). En cuanto exista la dirección del API, el mismo archivo usa el backend; las pantallas no cambian
// y la demostración ni siquiera viaja en lo construido.
import QRCode from 'qrcode';
import {createApiClient} from '@stackcraftmx/calcita';
import {createRestAccountConnector} from '@stackcraftmx/calcita/account';
import {createDemoAccountConnector} from '@stackcraftmx/calcita/account-demo';

const API_URL = import.meta.env.VITE_API_URL;

// con la dirección del API (en .env.local), el backend de verdad; sin ella, la cuenta de demostración
export const accountConnector = API_URL
    ? createRestAccountConnector(createApiClient({baseUrl: API_URL}))
    : createDemoAccountConnector({
        user: {id: 'user-demo', name: 'Ana Martínez Ruiz', email: 'ana.martinez@ejemplo.com', subtitle: 'Administración'},
        labels: ['Administración'],
        storageKey: 'mi-tienda:session',
        // el QR que escanea la app autenticadora
        toQrImageUrl: (otpauthUrl: string) => QRCode.toDataURL(otpauthUrl, {margin: 1}),
    });
