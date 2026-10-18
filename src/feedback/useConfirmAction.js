// Conecta confirmActionMachine con una pantalla: qué se ejecuta al confirmar y qué pasa cuando termina.
//
// Uso (una acción por hook; la pantalla pinta su ConfirmDialog con lo que regresa):
//   const deactivate = useConfirmAction({
//       run: ({subject, details}) => administrationApi.deactivate(subject.id, details),
//       onDone: (response) => { toastSuccess(response.message); refreshTable(); },
//   });
//   deactivate.open(row)                      abre la confirmación sobre ese renglón
//   <ConfirmDialog {...deactivate.dialogProps} title=... description=... />
//
// NOTA: run y onDone suelen ser funciones nuevas en cada render; la máquina siempre llama a las más recientes.
//
// Hook genérico del paquete, no renderiza: function (regla de la casa).
import {useRef} from 'react';
import {useMachine} from '@xstate/react';
import {fromPromise} from 'xstate';

import {confirmActionMachine} from '@/feedback/confirmActionMachine.js';

/**
 * @param {object} options
 * @param {(input: {subject: any, details: any}) => Promise<unknown>|void} options.run lo que se hace al confirmar (subject: lo que
 *     se le pasó a open)
 * @param {(output: any, subject: any) => void} [options.onDone] output: lo que regresó run
 * @returns {{
 *   subject: object|null, isOpen: boolean, isRunning: boolean, error: Error|null,
 *   open: (subject: any) => void, confirm: (details?: any) => void, cancel: () => void,
 *   dialogProps: {open: boolean, isPending: boolean, errorMessage: string|null, onConfirm: (details?: object) => void, onClose: () => void},
 * }}
 */
export function useConfirmAction({run, onDone}) {
    const latestRun = useRef(run);
    const latestOnDone = useRef(onDone);
    latestRun.current = run;
    latestOnDone.current = onDone;

    const [snapshot, send] = useMachine(confirmActionMachine.provide({
        actors: {runAction: fromPromise(({input}) => latestRun.current(input))},
        actions: {onDone: ({context}, params) => latestOnDone.current?.(params?.output, context.subject)},
    }));

    const {subject, error} = snapshot.context;
    const isOpen = ['confirming', 'running', 'failed'].some((stateName) => snapshot.matches(stateName));
    const isRunning = snapshot.matches('running');
    const confirm = (details) => send({type: 'CONFIRM', details});
    const cancel = () => send({type: 'CANCEL'});

    return {
        subject,
        isOpen,
        isRunning,
        error,
        open: (nextSubject) => send({type: 'OPEN', subject: nextSubject}),
        confirm,
        cancel,
        dialogProps: {
            open: isOpen,
            isPending: isRunning,
            errorMessage: error?.message ?? null,
            onConfirm: () => confirm(),
            onClose: cancel,
        },
    };
}
