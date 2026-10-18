import assert from 'node:assert/strict';
import {test} from 'node:test';

import {calcitaPackageJson, versionsOf} from './packageVersions.js';

test('las versiones salen del package.json del paquete, exactas', async () => {
    const calcitaPackage = await calcitaPackageJson();
    const versions = versionsOf(['react', '@mui/material', 'i18next'], calcitaPackage);
    assert.equal(versions.react, calcitaPackage.devDependencies.react);
    assert.match(versions['@mui/material'], /^\d+\.\d+\.\d+$/);
    assert.match(versions.i18next, /^\d+\.\d+\.\d+$/);
});

test('una librería sin versión truena (no se adivina)', () => {
    assert.throws(() => versionsOf(['left-pad'], {devDependencies: {}}), /left-pad/);
});
