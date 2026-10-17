// Pruebas de la máquina de la tabla de servidor. Sin navegador: npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createActor, waitFor} from 'xstate';

// OJO: import relativo a propósito, única excepción a la regla del alias @/: node --test no pasa por Vite
import {buildTableActors, tableMachine} from './tableMachine.js';

const PARAMS = {filters: {}, sortOrders: [], page: 0, pageSize: 25};

test('una respuesta rezagada no pisa la de la consulta vigente', async () => {
    // la primera consulta (página 0) tarda más que la segunda (página 1): sus filas no deben verse
    const resolvers = [];
    const fetchPage = (params) => new Promise((resolve) => resolvers.push(() => resolve({rows: [`página ${params.page}`], total: 2})));
    const actor = createActor(tableMachine.provide({actors: buildTableActors(fetchPage)})).start();

    actor.send({type: 'FETCH', params: {...PARAMS, page: 0}});
    actor.send({type: 'FETCH', params: {...PARAMS, page: 1}});
    resolvers[1]();
    await waitFor(actor, (snapshot) => snapshot.matches('ready'));
    resolvers[0]();
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.deepEqual(actor.getSnapshot().context.rows, ['página 1']);
    actor.stop();
});

test('las facetas se conservan cuando la página siguiente no las trae', async () => {
    let call = 0;
    const fetchPage = async () => {
        call += 1;
        return call === 1 ? {rows: [1], total: 30, facets: {status: [{value: 'processed', total: 30}]}} : {rows: [2], total: 30};
    };
    const actor = createActor(tableMachine.provide({actors: buildTableActors(fetchPage)})).start();

    actor.send({type: 'FETCH', params: PARAMS});
    await waitFor(actor, (snapshot) => snapshot.matches('ready') && snapshot.context.rows[0] === 1);
    actor.send({type: 'FETCH', params: {...PARAMS, page: 1}});
    await waitFor(actor, (snapshot) => snapshot.matches('ready') && snapshot.context.rows[0] === 2);

    assert.equal(actor.getSnapshot().context.facets.status[0].total, 30);
    actor.stop();
});

test('un error del servidor deja la tabla en error con el error tal cual', async () => {
    const serverError = Object.assign(new Error('No pudimos consultar'), {status: 500});
    const actor = createActor(tableMachine.provide({actors: buildTableActors(async () => { throw serverError; })})).start();

    actor.send({type: 'FETCH', params: PARAMS});
    await waitFor(actor, (snapshot) => snapshot.matches('error'));

    assert.equal(actor.getSnapshot().context.error, serverError);
    actor.stop();
});
