// Pruebas de cómo se escriben números, fechas y tamaños de archivo: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {formatDate, formatFileSize, formattersOf} from '@/formatting.js';
import {HOUR_CYCLE, configureToolkit} from '@/toolkit/toolkitSettings.js';

test('un archivo de menos de un kilobyte dice bytes, con su plural', () => {
    // el panel de descargas decía «74 byte»: la forma corta de Intl no pone plural
    configureToolkit({language: 'es'});
    assert.equal(formatFileSize(74), '74 bytes');
    assert.equal(formatFileSize(1), '1 byte');
    configureToolkit({language: 'en'});
    assert.equal(formatFileSize(74), '74 bytes');
    assert.equal(formatFileSize(1), '1 byte');
});

test('de un kilobyte en adelante va abreviado y en base 1000, como el navegador', () => {
    configureToolkit({language: 'es'});
    assert.equal(formatFileSize(1_500), '1.5 kB');
    assert.equal(formatFileSize(2_400_000), '2.4 MB');
});

test('sin dato enseña la raya', () => {
    assert.equal(formatFileSize(null), '—');
    assert.equal(formatFileSize('no es número'), '—');
});

test('cada configuración escribe con la suya: dos proveedores (o dos islas) ya no se pisan el idioma ni la zona', () => {
    // la de un proveedor en inglés con la zona de Los Ángeles y otro en español con la de México, al mismo tiempo
    const english = formattersOf(() => ({language: 'en', timeZone: 'America/Los_Angeles', currency: 'USD'}));
    const spanish = formattersOf(() => ({language: 'es', timeZone: 'America/Mexico_City', currency: 'MXN'}));

    assert.equal(english.formatDate('2027-01-05T03:00:00Z'), 'Jan 4, 2027');
    assert.equal(spanish.formatDate('2027-01-05T03:00:00Z'), '4 ene 2027');
    assert.equal(english.formatCurrency(1234.5), '$1,234.50');
    assert.equal(english.formatFileSize(74), '74 bytes');
});

test('los sueltos siguen la configuración vigente (la del proveedor de la raíz)', () => {
    configureToolkit({language: 'en'});
    assert.equal(formatDate('2027-01-05'), 'Jan 5, 2027');
    configureToolkit({language: 'es'});
    assert.equal(formatDate('2027-01-05'), '5 ene 2027');
});

test('la hora es de 24 horas por omisión y de 12 con a.m. y p.m. si el proveedor lo pide', () => {
    // Intl separa la hora de «p.m.» con un espacio angosto que no se ve: se compara con espacios normales
    const plain = (text) => text.replace(/\s/g, ' ');
    const twentyFour = formattersOf(() => ({language: 'es', timeZone: 'America/Mexico_City', currency: 'MXN'}));
    const twelve = formattersOf(() => ({language: 'es', timeZone: 'America/Mexico_City', currency: 'MXN', hourCycle: HOUR_CYCLE.twelveHours}));
    const english = formattersOf(() => ({language: 'en', timeZone: 'America/Mexico_City', currency: 'MXN', hourCycle: HOUR_CYCLE.twelveHours}));

    assert.equal(plain(twentyFour.formatDateTime('2026-10-19T21:10:00Z')), '19 oct 2026, 15:10');
    assert.equal(plain(twentyFour.formatTime('2026-10-19T13:05:00Z')), '07:05');
    assert.equal(plain(twelve.formatDateTime('2026-10-19T21:10:00Z')), '19 oct 2026, 3:10 p.m.');
    // la medianoche es 12, no 0
    assert.equal(plain(twelve.formatTime('2026-10-19T06:05:00Z')), '12:05 a.m.');
    assert.equal(plain(english.formatDateTime('2026-10-19T21:10:00Z')), 'Oct 19, 2026, 3:10 PM');
});
