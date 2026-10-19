// Pruebas del registro: sus salidas propias (addLogSink). Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {addLogSink, createLogger, setLogLevel} from '@/observability/logger.js';

test('una salida propia recibe lo que sale en consola, con su nivel y sus datos; se quita con lo que regresa', (context) => {
    context.mock.method(console, 'warn', () => {});
    context.mock.method(console, 'log', () => {});
    setLogLevel('warn');
    const received = [];
    const remove = addLogSink((entry) => received.push(entry));
    const log = createLogger('api');

    log.warn('sin red', {requestId: 'abc'});
    log.debug('esto no sale: está abajo del nivel');
    remove();
    log.warn('ya sin salida propia');

    assert.equal(received.length, 1);
    assert.deepEqual({...received[0], timestamp: 0}, {level: 'warn', namespace: 'api', message: 'sin red', context: {requestId: 'abc'}, timestamp: 0});
});

test('una salida que truena no tumba la anotación ni a las demás', (context) => {
    const written = context.mock.method(console, 'error', () => {});
    const received = [];
    const removeBroken = addLogSink(() => { throw new Error('reporte caído'); });
    const removeGood = addLogSink((entry) => received.push(entry.message));

    createLogger('pagos').error('falló el layout');
    removeBroken();
    removeGood();

    assert.equal(written.mock.callCount(), 1);
    assert.deepEqual(received, ['falló el layout']);
});
