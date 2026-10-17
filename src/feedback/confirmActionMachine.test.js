// Pruebas de la máquina de confirmación (regla de tablas: nada se ejecuta con un solo clic). Sin navegador: npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createActor, fromPromise, waitFor} from 'xstate';

import {confirmActionMachine} from '@/feedback/confirmActionMachine.js';

/** Actor con una acción que cuenta cuántas veces se ejecutó y que tarda lo que diga la prueba. */
function startActor({fails = false} = {}) {
    const calls = [];
    let releaseAction;
    const actionFinished = new Promise((resolve) => {
        releaseAction = resolve;
    });
    const actor = createActor(confirmActionMachine.provide({
        actors: {
            runAction: fromPromise(async ({input}) => {
                calls.push(input);
                await actionFinished;
                if (fails) {
                    throw Object.assign(new Error('falló'), {status: 500});
                }
                return {message: 'listo'};
            }),
        },
    }));
    actor.start();
    return {actor, calls, releaseAction};
}

test('cancelar la confirmación no ejecuta la acción', async () => {
    // abrimos el diálogo sobre un renglón y lo cerramos sin confirmar
    const {actor, calls} = startActor();
    actor.send({type: 'OPEN', subject: {id: 7}});
    actor.send({type: 'CANCEL'});

    assert.equal(actor.getSnapshot().value, 'idle');
    assert.equal(calls.length, 0);
});

test('un doble clic en Confirmar ejecuta la acción una sola vez', async () => {
    // el segundo CONFIRM llega mientras la primera petición sigue en camino
    const {actor, calls, releaseAction} = startActor();
    actor.send({type: 'OPEN', subject: {id: 7}});
    actor.send({type: 'CONFIRM'});
    actor.send({type: 'CONFIRM'});
    actor.send({type: 'CANCEL'});

    assert.equal(actor.getSnapshot().value, 'running');
    releaseAction();
    await waitFor(actor, (snapshot) => snapshot.matches('done'));
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0], {subject: {id: 7}, details: null});
});

test('CONFIRM sin haber abierto el diálogo no ejecuta nada', async () => {
    // un botón habilitado por error no puede disparar la acción
    const {actor, calls} = startActor();
    actor.send({type: 'CONFIRM'});

    assert.equal(actor.getSnapshot().value, 'idle');
    assert.equal(calls.length, 0);
});

test('si la acción falla el diálogo se queda con el error y se puede reintentar', async () => {
    // el error se muestra en el mismo diálogo; reintentar vuelve a ejecutar con los mismos datos
    const {actor, calls, releaseAction} = startActor({fails: true});
    actor.send({type: 'OPEN', subject: {id: 9}});
    actor.send({type: 'CONFIRM', details: {reason: 'Dejó la empresa'}});
    releaseAction();
    await waitFor(actor, (snapshot) => snapshot.matches('failed'));

    assert.equal(actor.getSnapshot().context.error.status, 500);
    actor.send({type: 'CONFIRM'});
    await waitFor(actor, (snapshot) => snapshot.matches('failed'));
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[1].details, {reason: 'Dejó la empresa'});
});
