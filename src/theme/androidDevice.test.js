// Pruebas de cómo se reconoce un equipo con Android: pnpm test. Las identificaciones llevan la forma de las que mandan
// esos navegadores (sistema, modelo y versión entre paréntesis).
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {isAndroidDevice} from '@/theme/androidDevice.js';

const USER_AGENTS = Object.freeze({
    samsungInternet: 'Mozilla/5.0 (Linux; Android 14; SM-A155M) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36',
    firefoxAndroid: 'Mozilla/5.0 (Android 14; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
    iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
    macChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
});

test('Chrome en Android lo dice directo en userAgentData', () => {
    assert.equal(isAndroidDevice({userAgentData: {platform: 'Android'}, userAgent: 'Mozilla/5.0 (Linux; K)'}), true);
});

test('los navegadores sin userAgentData se reconocen por la palabra Android', () => {
    assert.equal(isAndroidDevice({userAgent: USER_AGENTS.samsungInternet}), true);
    assert.equal(isAndroidDevice({userAgent: USER_AGENTS.firefoxAndroid}), true);
});

test('el iPhone, la Mac y Windows no son Android', () => {
    assert.equal(isAndroidDevice({userAgent: USER_AGENTS.iphoneSafari}), false);
    assert.equal(isAndroidDevice({userAgentData: {platform: 'macOS'}, userAgent: USER_AGENTS.macChrome}), false);
    assert.equal(isAndroidDevice({userAgentData: {platform: 'Windows'}}), false);
});

test('pintando en el servidor (sin navigator) no es Android; con la identificación del encabezado, sí se sabe', () => {
    assert.equal(isAndroidDevice(null), false);
    assert.equal(isAndroidDevice({userAgent: null}), false);
    assert.equal(isAndroidDevice({userAgent: USER_AGENTS.samsungInternet}), true);
});
