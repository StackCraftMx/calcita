// «Hay una versión nueva»: cuándo se prende el aviso. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {isAnotherBuild, isNewBuildPublished, reportPublishedBuild, subscribeToNewBuild} from '@/observability/publishedBuild.js';
import {configureToolkit} from '@/toolkit/toolkitSettings.js';

test('solo es otra compilación cuando se conocen las dos y son distintas', () => {
    // Escenario: la pestaña abrió con la compilación A
    assert.equal(isAnotherBuild('build-a', 'build-a'), false);
    assert.equal(isAnotherBuild('build-a', 'build-b'), true);
    // en desarrollo la pestaña no tiene compilación: nunca hay aviso
    assert.equal(isAnotherBuild(null, 'build-b'), false);
    assert.equal(isAnotherBuild('', 'build-b'), false);
    // una respuesta sin el dato (un proxy quitó el header, o el servidor no tiene compilación) no dice nada
    assert.equal(isAnotherBuild('build-a', undefined), false);
    assert.equal(isAnotherBuild('build-a', ''), false);
});

test('el aviso se prende con la primera respuesta que anuncia otra compilación y ya no se apaga', () => {
    // Escenario: una pestaña abierta con la compilación A (el buildId de ToolkitProvider) sigue pidiendo datos; a media
    // tarde se publica la B
    configureToolkit({buildId: 'build-a'});
    let timesNotified = 0;
    const stopListening = subscribeToNewBuild(() => {
        timesNotified += 1;
    });

    // mientras el servidor siga anunciando la A (o no anuncie nada), no pasa nada
    reportPublishedBuild('build-a');
    reportPublishedBuild(undefined);
    assert.equal(isNewBuildPublished(), false);
    assert.equal(timesNotified, 0);

    // llega la primera respuesta con la B: el aviso se prende y se avisa UNA vez
    reportPublishedBuild('build-b');
    assert.equal(isNewBuildPublished(), true);
    assert.equal(timesNotified, 1);

    // las siguientes no vuelven a avisar, y aunque alguna anunciara la A (otra réplica todavía sin actualizar) el aviso se
    // queda: la pestaña ya sabe que existe una compilación más nueva
    reportPublishedBuild('build-b');
    reportPublishedBuild('build-a');
    assert.equal(isNewBuildPublished(), true);
    assert.equal(timesNotified, 1);

    stopListening();
    configureToolkit({buildId: ''});
});
