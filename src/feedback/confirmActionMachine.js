// Máquina de "¿Seguro?": toda acción que cambia algo, manda un correo o descarga un archivo pasa por aquí.
//
//   idle ──OPEN──▶ confirming ──CONFIRM──▶ running ──ok──▶ done
//    ▲                │  ▲                    │
//    └──── CANCEL ────┘  └──── CONFIRM ─── failed ◀──error──┘
//                                  └── CANCEL ──▶ idle
//
// Por qué una máquina y no un useState con banderas: las dos trampas que ya se pagaron en otras pantallas son
// "cancelar igual ejecutó" y "doble clic en Confirmar mandó dos POST". Aquí no son posibles por construcción: CONFIRM
// solo existe en confirming y failed, y running no escucha nada (ni CONFIRM ni CANCEL) hasta que la petición termina.
// Lo prueba confirmActionMachine.test.js.
//
// Pura: solo importa xstate. La acción real (runAction) y lo que pasa al terminar (onDone) los pone quien la usa con
// useConfirmAction; core no conoce el API.
import {assign, fromPromise, setup} from 'xstate';

export const confirmActionMachine = setup({
    actors: {
        // ({input: {subject}}) → lo que regrese el API; lo reemplaza useConfirmAction
        runAction: fromPromise(async () => {
            throw new Error('confirmActionMachine: falta proveer runAction.');
        }),
    },
    actions: {
        // se llama con el resultado de runAction (p. ej. para el aviso y para volver a pedir la tabla)
        onDone: () => {},
    },
}).createMachine({
    id: 'confirmAction',
    initial: 'idle',
    context: {
        // sobre qué renglón se va a actuar (lo que se pinta en el diálogo y lo que recibe runAction)
        subject: null,
        // datos que la persona agrega en el diálogo antes de confirmar (p. ej. el motivo)
        details: null,
        error: null,
        output: null,
    },
    states: {
        idle: {
            on: {
                OPEN: {target: 'confirming', actions: assign({subject: ({event}) => event.subject, details: null, error: null})},
            },
        },
        confirming: {
            on: {
                CONFIRM: {target: 'running', actions: assign({details: ({event}) => event.details ?? null})},
                CANCEL: {target: 'idle', actions: assign({error: null})},
            },
        },
        running: {
            entry: assign({error: null}),
            invoke: {
                src: 'runAction',
                input: ({context}) => ({subject: context.subject, details: context.details}),
                onDone: {
                    target: 'done',
                    actions: [assign({output: ({event}) => event.output ?? null}), {type: 'onDone', params: ({event}) => ({output: event.output})}],
                },
                onError: {target: 'failed', actions: assign({error: ({event}) => event.error})},
            },
            // NOTA: sin CANCEL ni CONFIRM a propósito; a media petición no se cierra el diálogo ni sale otra petición
        },
        done: {
            on: {
                OPEN: {target: 'confirming', actions: assign({subject: ({event}) => event.subject, details: null, error: null, output: null})},
            },
        },
        failed: {
            on: {
                // reintentar desde el mismo diálogo, con el error a la vista
                CONFIRM: {target: 'running', actions: assign({details: ({event, context}) => event.details ?? context.details})},
                CANCEL: {target: 'idle', actions: assign({error: null})},
            },
        },
    },
});
