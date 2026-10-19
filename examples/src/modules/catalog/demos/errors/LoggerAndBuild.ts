// El registro (createLogger) y el aviso de versión nueva:
//   - un log por tema ('api', 'session'), con datos estructurados y SIN datos personales (ids, códigos, status y el
//     request_id; nunca correos ni nombres). Por omisión solo salen error y warn; en desarrollo se pide todo;
//   - reportPublishedBuild anota la versión que el servidor dice que está publicada (createApiClient lo hace solo con el
//     encabezado X-Frontend-Build); NewBuildNotice avisa «hay una versión nueva» cuando no es la de esta pestaña;
//   - usePublishedBuildWatch se entera sin el API: vuelve a leer version.json al abrir la app (la anclada al inicio del
//     iPhone no recarga sola) y cada tanto. Si estuvo fuera 15 minutos o más se recarga sola; si no, sale el aviso.
//     El build deja ese archivo con su versión (vea el plugin de vite.config.js de los ejemplos: version.json + VITE_BUILD_ID).
//
// Cómo se extiende: cada cuánto revisa (checkEveryMinutes), desde cuánto tiempo fuera recarga sola (reloadAfterHiddenMinutes;
// null = nunca, solo el aviso), cómo recarga (onReload, p. ej. guardar un borrador antes), dónde está el archivo (url) y la
// versión de la pestaña (buildId; páselo siempre: la raíz monta esto antes que ToolkitProvider).
import {createLogger, setLogLevel, usePublishedBuildWatch} from '@stackcraftmx/calcita';

if (import.meta.env.DEV) {
    setLogLevel('debug');
}

const log = createLogger('orders');

export function logCancelFailed(orderId: number, status: number, requestId: string | null) {
    log.warn('No se pudo cancelar el pedido', {orderId, status, requestId});
}

// en la raíz, junto a los avisos: <NewBuildNotice variant="floating" />
// y en ToolkitProvider, la versión de esta pestaña: <ToolkitProvider buildId={import.meta.env.VITE_BUILD_ID} …>

// en la raíz de la app, una vez: vigila si ya se publicó otra versión (solo en lo construido)
export function useAppBuildWatch() {
    // con BASE_URL: detrás de un proxy con prefijo (ASSET_URL=/ventas) el archivo vive en /ventas/version.json
    usePublishedBuildWatch({url: import.meta.env.PROD ? `${import.meta.env.BASE_URL}version.json` : null, buildId: import.meta.env.VITE_BUILD_ID, reloadAfterHiddenMinutes: 15});
}
