// Pruebas de cómo se dice el avance de una subida. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {transferProgressOf} from '@/upload/transferProgress.js';

test('la velocidad y lo que falta salen de lo que ha viajado desde que empezó', () => {
    // 2 MB en 4 segundos: 500 kB/s, y faltan 6 MB → 12 segundos
    const progress = transferProgressOf({loaded: 2_000_000, total: 8_000_000}, 10_000, 14_000);
    assert.equal(progress.percent, 25);
    assert.equal(progress.bytesPerSecond, 500_000);
    assert.equal(progress.remainingSeconds, 12);
});

test('recién empezada no dice velocidad; si la subida ya la trae (axios), se usa esa', () => {
    const justStarted = transferProgressOf({loaded: 10_000, total: 8_000_000}, 10_000, 10_200);
    assert.equal(justStarted.bytesPerSecond, null);
    assert.equal(justStarted.remainingSeconds, null);
    const fromAxios = transferProgressOf({loaded: 4_000_000, total: 8_000_000, rate: 1_000_000, estimated: 4}, 10_000, 10_100);
    assert.equal(fromAxios.bytesPerSecond, 1_000_000);
    assert.equal(fromAxios.remainingSeconds, 4);
    assert.equal(transferProgressOf({loaded: 0, total: 0}, 0, 1000).percent, 0);
});
