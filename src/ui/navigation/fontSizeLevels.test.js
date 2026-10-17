// Pruebas de los tamaños de letra. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {isFontSizeLevel, rootFontSizeOf} from '@/ui/navigation/fontSizeLevels.js';

test('cada nivel crece la letra de la raíz; uno que no existe se queda en la normal', () => {
    assert.equal(rootFontSizeOf('normal'), '16px');
    assert.equal(rootFontSizeOf('xLarge'), '20.8px');
    assert.equal(rootFontSizeOf('gigante'), '16px');
});

test('lo guardado en el navegador solo vale si es un nivel que existe', () => {
    assert.equal(isFontSizeLevel('large'), true);
    assert.equal(isFontSizeLevel('LARGE'), false);
    assert.equal(isFontSizeLevel(null), false);
});
