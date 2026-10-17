// Interruptor de modo claro / oscuro (ColorSchemeToggle): a qué modo lleva un clic y qué tooltip dice. Sin navegador:
// npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {nextColorModeOf, resolvedColorModeOf} from '@/ui/navigation/colorMode.js';

import en from '@/locales/en.js';
import es from '@/locales/es.js';

const COMMON_TEXTS_BY_LANGUAGE = {es: es.common, en: en.common};

test('en claro el interruptor lleva a oscuro y en oscuro lleva a claro', () => {
    // Escenario: preferencia explícita guardada.
    assert.equal(nextColorModeOf('light', 'dark'), 'dark');
    assert.equal(nextColorModeOf('dark', 'light'), 'light');
});

test('con modo system alterna contra lo que SE VE, no contra la palabra system', () => {
    // Escenario: sin preferencia guardada y el sistema operativo en oscuro; el primer clic debe llevar a claro.
    assert.equal(resolvedColorModeOf('system', 'dark'), 'dark');
    assert.equal(nextColorModeOf('system', 'dark'), 'light');
    assert.equal(nextColorModeOf('system', 'light'), 'dark');
});

test('antes de montar (modo todavía desconocido) se pinta claro', () => {
    // Escenario: MUI regresa undefined en el primer render; el Toaster no debe quedarse sin tema.
    assert.equal(resolvedColorModeOf(undefined, undefined), 'light');
    assert.equal(resolvedColorModeOf('system', undefined), 'light');
});

test('el tooltip del interruptor existe en español y en inglés para los dos destinos', () => {
    // Escenario: una llave que falta se vería como «colorScheme.switchTo.dark» frente al cliente.
    for (const [language, catalog] of Object.entries(COMMON_TEXTS_BY_LANGUAGE)) {
        for (const nextMode of ['light', 'dark']) {
            const tooltip = catalog.colorScheme?.switchTo?.[nextMode];
            assert.ok(typeof tooltip === 'string' && tooltip.length > 0, `${language}: falta common.colorScheme.switchTo.${nextMode}`);
        }
        assert.ok(catalog.colorScheme?.label, `${language}: falta common.colorScheme.label`);
    }
});
