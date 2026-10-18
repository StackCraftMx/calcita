import assert from 'node:assert/strict';
import test from 'node:test';

import {BUILD_WATCH_ACTION, buildWatchActionOf, publishedBuildIdOf} from '@/observability/buildWatch.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

test('la misma versión, o sin datos que comparar: nada', () => {
    assert.equal(buildWatchActionOf({runningBuildId: 'v1', publishedBuildId: 'v1', hiddenMilliseconds: FIFTEEN_MINUTES * 4}), BUILD_WATCH_ACTION.none);
    // en desarrollo no hay versión de la pestaña; si el archivo no la trae, tampoco
    assert.equal(buildWatchActionOf({runningBuildId: '', publishedBuildId: 'v2'}), BUILD_WATCH_ACTION.none);
    assert.equal(buildWatchActionOf({runningBuildId: 'v1', publishedBuildId: null}), BUILD_WATCH_ACTION.none);
});

test('otra versión: recarga sola si estuvo fuera un buen rato; si no, el aviso', () => {
    const watch = {runningBuildId: 'v1', publishedBuildId: 'v2', reloadAfterHiddenMilliseconds: FIFTEEN_MINUTES};

    assert.equal(buildWatchActionOf({...watch, hiddenMilliseconds: FIFTEEN_MINUTES}), BUILD_WATCH_ACTION.reload);
    assert.equal(buildWatchActionOf({...watch, hiddenMilliseconds: 2 * 60 * 1000}), BUILD_WATCH_ACTION.notice);
    // la está usando (revisión de cada tanto, sin haber salido)
    assert.equal(buildWatchActionOf({...watch, hiddenMilliseconds: 0}), BUILD_WATCH_ACTION.notice);
    // sin recarga sola (null): siempre el aviso
    assert.equal(buildWatchActionOf({...watch, reloadAfterHiddenMilliseconds: null, hiddenMilliseconds: FIFTEEN_MINUTES * 10}), BUILD_WATCH_ACTION.notice);
});

test('la versión del archivo: solo un texto con algo', () => {
    assert.equal(publishedBuildIdOf({buildId: '2026-10-18T10:00:00Z'}), '2026-10-18T10:00:00Z');
    assert.equal(publishedBuildIdOf({buildId: ''}), null);
    assert.equal(publishedBuildIdOf({version: 3}), null);
    assert.equal(publishedBuildIdOf(null), null);
    assert.equal(publishedBuildIdOf('<!doctype html>'), null);
});
