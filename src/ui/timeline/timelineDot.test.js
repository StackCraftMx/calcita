import assert from 'node:assert/strict';
import test from 'node:test';

import {TIMELINE_EMPHASIS, timelineDotOf} from './timelineDot.js';

test('un grupo resaltado o normal pinta el punto lleno con el tono del evento', () => {
    assert.deepEqual(timelineDotOf({emphasis: TIMELINE_EMPHASIS.highlighted, tone: 'error'}), {variant: 'filled', color: 'error'});
    assert.deepEqual(timelineDotOf({emphasis: TIMELINE_EMPHASIS.normal, tone: 'success'}), {variant: 'filled', color: 'success'});
});

test('un grupo apagado pinta contorno gris aunque el evento traiga tono', () => {
    assert.deepEqual(timelineDotOf({emphasis: TIMELINE_EMPHASIS.muted, tone: 'error'}), {variant: 'outlined', color: 'grey'});
});

test('un tono que TimelineDot no conoce, o ninguno, sale en gris', () => {
    assert.deepEqual(timelineDotOf({emphasis: TIMELINE_EMPHASIS.normal, tone: 'danger'}), {variant: 'filled', color: 'grey'});
    assert.deepEqual(timelineDotOf(), {variant: 'filled', color: 'grey'});
});
