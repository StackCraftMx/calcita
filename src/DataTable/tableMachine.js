// Máquina de la tabla de servidor: el ciclo de vida de la petición, y nada más.
//
// Reparto de responsabilidades, a propósito:
//   la URL (nuqs)  es la fuente de verdad de filtros, orden y página;
//   esta máquina   es la fuente de verdad de "¿está cargando?, ¿qué trajo?".
// Tener los filtros en los dos lados es lo que produce pantallas donde la tabla dice una cosa y la URL otra.
//
//   idle ──FETCH──▶ loading ──onDone──▶ ready
//                     │  ▲                │
//                     │  └──── FETCH ─────┤   (reenter: aborta la petición anterior)
//                     └──onError──▶ error ┘
//
// IMPORTANTE: abortar es una PETICIÓN al navegador, no una garantía; una respuesta que ya venía en camino puede
// resolverse igual. Por eso cada consulta lleva un requestId y se descarta todo lo que no sea la última: sin eso se
// ven filas de dos filtros distintos mezcladas.
//
// Pura: solo importa xstate. La petición la pone quien la usa con buildTableActors(fetchPage). Prueba en
// tableMachine.test.js (node --test).
import {assign, fromPromise, setup} from 'xstate';

/**
 * ¿El error es una cancelación (axios o fetch)? Cancelar una consulta que ya no interesa no es un error que mostrar.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
export function isCancellation(error) {
    return error?.name === 'AbortError' || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED';
}

const startNewRequest = assign({
    error: null,
    requestId: ({context}) => context.requestId + 1,
});

export const tableMachine = setup({
    actors: {
        // lo reemplaza buildTableActors; si alguien olvida proveerlo, que truene con un mensaje claro
        fetchPage: fromPromise(async () => {
            throw new Error('tableMachine: falta proveer fetchPage con buildTableActors().');
        }),
    },
    guards: {
        isStaleResponse: ({context, event}) => event.output.requestId !== context.requestId,
        isCancellation: ({event}) => isCancellation(event.error),
    },
}).createMachine({
    id: 'table',
    initial: 'idle',
    context: {
        rows: [],
        total: 0,
        facets: {},
        capped: false,
        // el error tal cual (normalmente un ApiError con el mensaje ya traducido)
        error: null,
        // se incrementa en cada FETCH: identifica cuál es la consulta vigente
        requestId: 0,
    },
    states: {
        // nadie ha pedido nada todavía
        idle: {
            on: {FETCH: {target: 'loading', actions: startNewRequest}},
        },
        loading: {
            invoke: {
                src: 'fetchPage',
                // las acciones de la transición corren ANTES de entrar al estado: aquí el requestId ya es el nuevo
                input: ({context, event}) => ({...event.params, requestId: context.requestId}),
                onDone: [
                    // respuesta de una consulta que ya no es la vigente: se tira en silencio (es una carrera)
                    {guard: 'isStaleResponse'},
                    {
                        target: 'ready',
                        actions: assign({
                            rows: ({event}) => event.output.rows ?? [],
                            total: ({event}) => event.output.total ?? 0,
                            capped: ({event}) => event.output.capped ?? false,
                            // si la respuesta no trae facetas (páginas 2 en adelante) se conservan las que había
                            facets: ({context, event}) => (Object.keys(event.output.facets ?? {}).length
                                ? event.output.facets
                                : context.facets),
                            error: null,
                        }),
                    },
                ],
                onError: [
                    {guard: 'isCancellation'},
                    {target: 'error', actions: assign({error: ({event}) => event.error})},
                ],
            },
            on: {FETCH: {target: 'loading', reenter: true, actions: startNewRequest}},
        },
        ready: {
            on: {FETCH: {target: 'loading', actions: startNewRequest}},
        },
        error: {
            on: {FETCH: {target: 'loading', actions: startNewRequest}},
        },
    },
});

/**
 * El actor fetchPage a partir de la función de la pantalla.
 *
 * @param {(params: {filters: object, sortOrders: Array, page: number, pageSize: number}, signal: AbortSignal) => Promise<{rows: Array, total: number, facets?: object, capped?: boolean}>} fetchPage
 */
export function buildTableActors(fetchPage) {
    return {
        fetchPage: fromPromise(async ({input, signal}) => {
            const {requestId, ...params} = input;
            const tablePage = await fetchPage(params, signal);
            // el id viaja de vuelta con la respuesta: así se sabe si sigue siendo la consulta vigente
            return {...tablePage, requestId};
        }),
    };
}
