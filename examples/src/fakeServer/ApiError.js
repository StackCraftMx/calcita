// El error que regresa el servidor de mentira, con la misma forma que el de un cliente HTTP real: el problema RFC 9457
// del backend (problem) y el mensaje ya traducido (message).
//
// En un proyecto real este error lo arma el cliente HTTP (axios) a partir de la respuesta. Aquí no hay red: lo arma el
// servidor de mentira, así las pantallas reciben exactamente lo que recibirían de verdad, y los componentes del paquete
// (applyServerProblem, toastProblem, ConfirmDialog, el panel de descargas) lo leen igual.
//
// Lo traducido manda: si el problema trae detail, ese es el mensaje; si no trae (sin conexión, status 0), el paquete pone
// su texto genérico en el idioma activo (problemMessage).
import {problemMessage, problemTitle} from '@stackcraftmx/calcita';

export class ApiError extends Error {
    /**
     * @param {{status: number, problem?: object|null}} details status 0 = no hubo respuesta (sin conexión)
     */
    constructor({status, problem = null}) {
        super(problemMessage(problem, status));
        this.name = 'ApiError';
        this.status = status;
        this.problem = problem ?? {};
        this.code = problem?.code ?? null;
        this.title = problemTitle(problem, status);
    }
}
