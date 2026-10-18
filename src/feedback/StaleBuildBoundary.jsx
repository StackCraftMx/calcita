// La barrera de errores de las pantallas, para una app sin router de datos (con react-router va RouteErrorScreen, que el
// router le pasa solo). Si una pantalla truena al pintarse, en lugar de dejar la página en blanco dice qué pasó y ofrece
// recargar:
//   - se publicó otra versión con la pestaña abierta (el archivo de la pantalla ya no existe; recoverFromStaleChunk ya
//     recargó una vez y volvió a fallar): «Hay una versión nueva» y «Recargar»;
//   - otra cosa: «Algo falló de nuestro lado» y «Intentar de nuevo» (recarga).
// Al cambiar resetKey (normalmente la dirección de la página) se vuelve a intentar: el error era de la pantalla anterior.
//
//   <StaleBuildBoundary resetKey={pathname}>{pantallas}</StaleBuildBoundary>
//
// OJO: es una clase porque React solo atrapa los errores al pintar con componentDidCatch; no hay hook para eso.
import {Component} from 'react';

import {isStaleChunkError} from '@/api/staleChunks.js';
import {createLogger} from '@/observability/logger.js';
import ErrorPage, {ERROR_PAGE_KIND} from '@/ui/layout/ErrorPage.jsx';

const log = createLogger('navigation');

/** Recargar la página: trae la versión publicada. */
function reloadPage() {
    window.location.reload();
}

/**
 * @extends {Component<{resetKey?: string, homePath?: string, children?: import('react').ReactNode}, {error: unknown}>}
 */
export default class StaleBuildBoundary extends Component {
    state = {error: null};

    static getDerivedStateFromError(error) {
        return {error};
    }

    componentDidCatch(error) {
        log.error('una pantalla no se pudo pintar', {name: error?.name, message: error?.message});
    }

    componentDidUpdate(previousProps) {
        if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
            this.setState({error: null});
        }
    }

    render() {
        const {error} = this.state;
        if (!error) {
            return this.props.children;
        }
        const kind = isStaleChunkError(error) ? ERROR_PAGE_KIND.newVersion : ERROR_PAGE_KIND.serverError;
        return <ErrorPage kind={kind} onRetry={reloadPage} homePath={this.props.homePath} />;
    }
}
