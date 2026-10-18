import assert from 'node:assert/strict';
import {test} from 'node:test';

import {calcitaPackageJson} from './packageVersions.js';
import {defaultAnswersOf} from './projectAnswers.js';
import {appThemeFileOf, packageJsonOf} from './projectFiles.js';

test('el package.json pide solo lo elegido, con las versiones del paquete', async () => {
    const calcitaPackage = await calcitaPackageJson();
    const withFormik = JSON.parse(packageJsonOf({packageName: 'mi-tienda', answers: defaultAnswersOf('mi-tienda'), calcitaPackage}));
    assert.equal(withFormik.dependencies['@stackcraftmx/calcita'], `^${calcitaPackage.version}`);
    assert.equal(withFormik.dependencies['@mui/material'], calcitaPackage.devDependencies['@mui/material']);
    assert.equal(withFormik.dependencies['react-hook-form'], undefined);
    assert.equal(withFormik.dependencies.i18next, undefined);

    const answers = {...defaultAnswersOf('mi-tienda'), forms: 'react-hook-form', texts: 'i18next'};
    const withHookForm = JSON.parse(packageJsonOf({packageName: 'mi-tienda', answers, calcitaPackage}));
    assert.ok(withHookForm.dependencies['react-hook-form']);
    assert.ok(withHookForm.dependencies['@hookform/resolvers']);
    assert.ok(withHookForm.dependencies.i18next);
});

test('el tema importa solo lo que usa', () => {
    const glass = appThemeFileOf(defaultAnswersOf('tienda'));
    assert.match(glass, /import \{createToolkitTheme, stackcraftDarkPalette, stackcraftLightPalette\}/);
    assert.match(glass, /glass: true/);

    const muiLightMinimal = appThemeFileOf({...defaultAnswersOf('tienda'), colors: 'mui', colorModes: 'lightOnly', style: 'minimal'});
    assert.match(muiLightMinimal, /import \{THEME_LOOK, createToolkitTheme\}/);
    assert.match(muiLightMinimal, /const colorSchemes = \{light: true\};/);
    assert.match(muiLightMinimal, /look: THEME_LOOK.minimal/);

    const custom = appThemeFileOf({...defaultAnswersOf('tienda'), colors: 'custom', primaryColor: '#2563eb', style: 'plain'});
    assert.match(custom, /const PRIMARY_COLOR = '#2563EB';/);
    assert.doesNotMatch(custom, /glass|look/);
});
