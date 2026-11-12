// Pruebas de dónde queda la página al cambiar de pantalla. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
    MAX_REMEMBERED_SCREENS, ROUTE_SCROLL, rememberedPositionsOf, routeScrollOf, withRememberedPosition,
} from '@/appShell/routeScroll.js';

test('otra pantalla va arriba, el regreso va a donde iba y la misma pantalla con otra consulta se queda', () => {
    assert.equal(routeScrollOf({previousPathname: '/orders', pathname: '/orders/17', isHistoryMove: false}), ROUTE_SCROLL.top);
    assert.equal(routeScrollOf({previousPathname: '/orders/17', pathname: '/orders', isHistoryMove: true}), ROUTE_SCROLL.restore);
    // la tabla cambió de página (?page=3): misma dirección, la página no brinca
    assert.equal(routeScrollOf({previousPathname: '/orders', pathname: '/orders', isHistoryMove: false}), ROUTE_SCROLL.stay);
    // «atrás» a la página anterior de la misma tabla: también regresa a donde iba
    assert.equal(routeScrollOf({previousPathname: '/orders', pathname: '/orders', isHistoryMove: true}), ROUTE_SCROLL.restore);
});

test('la posición se guarda redondeada, la más reciente al final y sin pasar del tope', () => {
    const first = withRememberedPosition({}, '/orders', 812.6);
    assert.deepEqual(first, {'/orders': 813});
    // volver a guardar la misma la manda al final
    const again = withRememberedPosition({'/orders': 813, '/customers': 40}, '/orders', 90);
    assert.deepEqual(Object.keys(again), ['/customers', '/orders']);
    // con el tope lleno se olvida la más vieja
    let full = {};
    for (let index = 0; index < MAX_REMEMBERED_SCREENS; index += 1) {
        full = withRememberedPosition(full, `/screen/${index}`, index);
    }
    const overflowed = withRememberedPosition(full, '/new', 5);
    assert.equal(Object.keys(overflowed).length, MAX_REMEMBERED_SCREENS);
    assert.equal(overflowed['/screen/0'], undefined);
    assert.equal(overflowed['/new'], 5);
    // el que llega no se toca
    assert.equal(full['/screen/0'], 0);
});

test('lo guardado en la sesión se lee con cuidado: lo que no sirve se ignora, nunca truena', () => {
    assert.deepEqual(rememberedPositionsOf(null), {});
    assert.deepEqual(rememberedPositionsOf('no es json'), {});
    assert.deepEqual(rememberedPositionsOf('[1, 2]'), {});
    assert.deepEqual(rememberedPositionsOf('{"/orders": 120, "/x": "mucho", "/y": -4}'), {'/orders': 120});
});
