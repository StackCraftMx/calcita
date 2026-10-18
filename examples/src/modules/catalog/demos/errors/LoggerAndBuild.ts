// El registro (createLogger) y el aviso de versión nueva:
//   - un log por tema ('api', 'session'), con datos estructurados y SIN datos personales (ids, códigos, status y el
//     request_id; nunca correos ni nombres). Por omisión solo salen error y warn; en desarrollo se pide todo;
//   - reportPublishedBuild anota la versión que el servidor dice que está publicada (createApiClient lo hace solo con el
//     encabezado X-Frontend-Build); NewBuildNotice avisa «hay una versión nueva» cuando no es la de esta pestaña.
import {createLogger, setLogLevel} from '@stackcraftmx/calcita';

if (import.meta.env.DEV) {
    setLogLevel('debug');
}

const log = createLogger('orders');

export function logCancelFailed(orderId: number, status: number, requestId: string | null) {
    log.warn('No se pudo cancelar el pedido', {orderId, status, requestId});
}

// en la raíz, junto a los avisos: <NewBuildNotice variant="floating" />
// y en ToolkitProvider, la versión de esta pestaña: <ToolkitProvider buildId={import.meta.env.VITE_BUILD_ID} …>
