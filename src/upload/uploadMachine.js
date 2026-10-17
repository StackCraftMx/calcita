// Máquina del flujo de SUBIDA de un archivo (compañera de una zona para soltar archivos).
//
//   idle ──UPLOAD──▶ uploading.sending ──(PROGRESS 100%)──▶ uploading.processing
//                         │                                        │
//                         ├────────────── DONE ────────────────────┼──▶ done
//                         ├────────────── FAIL ────────────────────┴──▶ failed
//                         └─── CANCEL (el cleanup aborta la petición) ──▶ cancelled
//
// Por qué máquina y no cuatro useState: los estados imposibles dejan de existir (no hay "resultado y error a la vez"
// ni "progreso sin carga") y el flujo sending → processing → done queda DECLARADO, no regado en callbacks.
//
// Contexto: progress (% de bytes enviados; null fuera de sending) · result (lo que resuelva la subida) · problem (el
// error RFC 9457 del rechazo, normalmente un ApiError).
//
// Uso:
//   const [uploadSnapshot, sendToUpload] = useMachine(uploadMachine.provide({actors: buildUploadActors(uploadFile)}));
//   sendToUpload({type: 'UPLOAD', input: {file}});
//
// Pura: solo importa xstate.
import {assign, fromCallback, setup} from 'xstate';

const resetContext = assign({progress: null, result: null, problem: null});

export const uploadMachine = setup({
    actors: {
        upload: fromCallback(() => {
            throw new Error('uploadMachine: falta proveer upload con buildUploadActors().');
        }),
    },
    guards: {
        // 100% enviado no es terminado: el servidor sigue trabajando
        isFullySent: ({event}) => event.percent >= 100,
    },
}).createMachine({
    id: 'upload',
    initial: 'idle',
    context: {progress: null, result: null, problem: null},
    states: {
        idle: {
            on: {UPLOAD: {target: 'uploading', actions: resetContext}},
        },
        uploading: {
            invoke: {src: 'upload', input: ({event}) => event.input},
            initial: 'sending',
            states: {
                sending: {
                    on: {
                        PROGRESS: [
                            {guard: 'isFullySent', target: 'processing', actions: assign({progress: ({event}) => event.percent})},
                            {actions: assign({progress: ({event}) => event.percent})},
                        ],
                    },
                },
                // cuerpo entregado; esperando la respuesta del servidor (progreso indeterminado)
                processing: {},
            },
            on: {
                DONE: {target: 'done', actions: assign({result: ({event}) => event.output, progress: null})},
                FAIL: {target: 'failed', actions: assign({problem: ({event}) => event.problem, progress: null})},
                // salir de uploading DETIENE el actor y su cleanup aborta la petición de verdad (no solo la UI)
                CANCEL: {target: 'cancelled', actions: assign({progress: null})},
            },
        },
        done: {
            on: {UPLOAD: {target: 'uploading', actions: resetContext}, RESET: {target: 'idle', actions: resetContext}},
        },
        failed: {
            on: {UPLOAD: {target: 'uploading', actions: resetContext}, RESET: {target: 'idle', actions: resetContext}},
        },
        // cancelado por la persona: el archivo sigue elegido y se puede reintentar o limpiar
        cancelled: {
            on: {UPLOAD: {target: 'uploading', actions: resetContext}, RESET: {target: 'idle', actions: resetContext}},
        },
    },
});

/**
 * El actor upload a partir de la función de la pantalla.
 *
 * fromCallback y no fromPromise: hacen falta EVENTOS a medio camino (el avance) y un CLEANUP que aborte la petición.
 *
 * @param {(input: object, onProgress: (percent: number) => void, signal: AbortSignal) => Promise<unknown>} uploadFile
 */
export function buildUploadActors(uploadFile) {
    return {
        upload: fromCallback(({input, sendBack}) => {
            const abortController = new AbortController();
            uploadFile(input, (percent) => sendBack({type: 'PROGRESS', percent}), abortController.signal)
                .then((output) => sendBack({type: 'DONE', output}))
                .catch((problem) => {
                    // aborto esperado (CANCEL): la máquina ya cambió de estado sola
                    if (problem?.name === 'AbortError' || problem?.name === 'CanceledError') {
                        return;
                    }
                    sendBack({type: 'FAIL', problem});
                });
            return () => abortController.abort();
        }),
    };
}
