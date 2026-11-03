// Pruebas de las reglas del formulario por pasos (wizardSteps.js).
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {WIZARD_STEP_SELECTION, isStepCompleted, openingStepOf, stepSelectionActionOf} from '@/inputs/wizardSteps.js';

const STEPS = [{key: 'company'}, {key: 'documents'}, {key: 'guarantor'}];

test('abre en el paso que dice el servidor; sin llave, en el primero; con una que no existe, en el primero y lo dice', () => {
    assert.deepEqual(openingStepOf(STEPS, 'documents'), {index: 1, isUnknownKey: false});
    assert.deepEqual(openingStepOf(STEPS, undefined), {index: 0, isUnknownKey: false});
    assert.deepEqual(openingStepOf(STEPS, 'bank'), {index: 0, isUnknownKey: true});
});

test('pulsar otro paso: con none no hace nada, con free salta, con checked revisa antes; el mismo paso no hace nada', () => {
    assert.equal(stepSelectionActionOf(WIZARD_STEP_SELECTION.none, 0, 2), 'ignore');
    assert.equal(stepSelectionActionOf(WIZARD_STEP_SELECTION.free, 0, 2), 'jump');
    assert.equal(stepSelectionActionOf(WIZARD_STEP_SELECTION.free, 2, 0), 'jump');
    assert.equal(stepSelectionActionOf(WIZARD_STEP_SELECTION.checked, 2, 0), 'checkFirst');
    assert.equal(stepSelectionActionOf(WIZARD_STEP_SELECTION.checked, 1, 1), 'ignore');
});

test('la palomita: en fila, los de antes salvo los omitidos; si se pulsan, solo lo que diga la pantalla', () => {
    const skippedKeys = new Set(['company']);
    const place = {activeIndex: 2, skippedKeys, isSelectable: false};
    assert.equal(isStepCompleted(STEPS[0], {...place, index: 0}), false);
    assert.equal(isStepCompleted(STEPS[1], {...place, index: 1}), true);
    assert.equal(isStepCompleted(STEPS[1], {...place, index: 1, isSelectable: true}), false);
    assert.equal(isStepCompleted({key: 'guarantor', completed: true}, {...place, index: 2, isSelectable: true}), true);
});
