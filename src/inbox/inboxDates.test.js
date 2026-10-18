// Pruebas de la fecha corta de la bandeja: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {inboxDateOf} from '@/inbox/inboxDates.js';
import {configureToolkit} from '@/toolkit/toolkitSettings.js';

test('si llegó hoy (en la zona del negocio) enseña la hora; si no, el día', () => {
    configureToolkit({language: 'es', timeZone: 'America/Mexico_City'});
    const now = new Date('2026-10-17T18:00:00Z');
    assert.equal(inboxDateOf('2026-10-17T15:14:00Z', now), '09:14');
    assert.match(inboxDateOf('2026-10-14T15:14:00Z', now), /14 oct/);
    // a las 3 de la mañana UTC del 18 todavía es el 17 en la Ciudad de México: es de hoy
    assert.equal(inboxDateOf('2026-10-18T03:00:00Z', new Date('2026-10-18T04:00:00Z')), '21:00');
});
