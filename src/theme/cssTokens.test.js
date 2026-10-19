// Pruebas de las variables CSS de Calcita (cssTokens.js). Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {CSS_TOKENS, cssTokenDeclarationsOf, cssTokenOf} from '@/theme/cssTokens.js';
import {GLASS_BLUR, MENU_RADIUS, PANEL_RADIUS} from '@/theme/glassSurface.js';
import {createToolkitTheme} from '@/theme/createToolkitTheme.js';

test('cada valor es su variable con el de siempre de respaldo: sin la variable se ve igual', () => {
    assert.equal(cssTokenOf('panelRadius'), 'var(--calcita-panel-radius, 20px)');
    assert.equal(cssTokenOf('panelRadius', '16px'), 'var(--calcita-panel-radius, 16px)');
    assert.equal(PANEL_RADIUS, 'var(--calcita-panel-radius, 20px)');
    assert.equal(MENU_RADIUS, 'var(--calcita-menu-radius, 12px)');
    assert.equal(GLASS_BLUR, 'blur(var(--calcita-glass-blur, 20px)) saturate(var(--calcita-glass-saturate, 180%))');
});

test('los valores del proyecto: un número lleva su unidad, un texto va tal cual y lo desconocido se ignora', () => {
    assert.deepEqual(cssTokenDeclarationsOf({panelRadius: 6, glassSaturate: 120, menuRadius: '0.5rem', otro: 3, fieldRadius: ''}), {
        '--calcita-panel-radius': '6px',
        '--calcita-glass-saturate': '120%',
        '--calcita-menu-radius': '0.5rem',
    });
    assert.deepEqual(cssTokenDeclarationsOf(), {});
    assert.equal(Object.keys(CSS_TOKENS).length, 5);
});

test('createToolkitTheme({cssTokens}) los declara en :root con el CssBaseline; sin la opción, nada', () => {
    const theme = createToolkitTheme({glass: true, cssTokens: {panelRadius: 6, glassBlur: 12}});
    const baseline = theme.components.MuiCssBaseline.styleOverrides;
    const root = (typeof baseline === 'function' ? baseline(theme) : baseline)[':root'];
    assert.equal(root['--calcita-panel-radius'], '6px');
    assert.equal(root['--calcita-glass-blur'], '12px');

    const plain = createToolkitTheme({glass: true}).components.MuiCssBaseline?.styleOverrides;
    const plainRoot = plain && (typeof plain === 'function' ? plain(createToolkitTheme({glass: true})) : plain)[':root'];
    assert.equal(plainRoot?.['--calcita-panel-radius'], undefined);
});
