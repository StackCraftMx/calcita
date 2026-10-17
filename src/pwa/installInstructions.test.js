// Pruebas de qué instrucciones de «instalar la app» le tocan a cada equipo (las de walk-ot, pasadas a node:test).
// Sin navegador: npm test. `navigatorOf` es un navigator de mentira: un user agent y los toques de la pantalla.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {INSTALL_VARIANT, detectPlatform, parseIOSMajor, resolveInstallVariant} from '@/pwa/installInstructions.js';

const navigatorOf = (userAgent, maxTouchPoints = 0) => ({userAgent, maxTouchPoints});
const platformOf = (userAgent, maxTouchPoints = 0) => detectPlatform(navigatorOf(userAgent, maxTouchPoints));

test('lee la versión mayor de iOS del iPhone (26, 18) y cae a «Version/» si no trae «OS NN_»', () => {
    assert.equal(parseIOSMajor('Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit'), 26);
    assert.equal(parseIOSMajor('Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X)'), 18);
    assert.equal(parseIOSMajor('Mozilla/5.0 ... Version/17.4 Mobile'), 17);
});

test('sin versión de iOS (Android, vacío) es null', () => {
    assert.equal(parseIOSMajor('Mozilla/5.0 (Linux; Android 14) Chrome'), null);
    assert.equal(parseIOSMajor(''), null);
});

test('el iPhone se reconoce con su versión', () => {
    const platform = platformOf('Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X)', 5);
    assert.equal(platform.isIOS, true);
    assert.equal(platform.isIPhone, true);
    assert.equal(platform.iosMajor, 26);
});

test('el iPad que dice «Macintosh» se reconoce por la pantalla táctil; una Mac de verdad no es iOS', () => {
    const iPad = platformOf('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit', 5);
    assert.equal(iPad.isIPad, true);
    assert.equal(iPad.isIOS, true);
    assert.equal(iPad.iosMajor, null);
    const mac = platformOf('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit', 0);
    assert.equal(mac.isIPad, false);
    assert.equal(mac.isIOS, false);
});

test('Firefox de Android se reconoce (no tiene el diálogo de instalar de Chrome)', () => {
    const platform = platformOf('Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0', 5);
    assert.equal(platform.isAndroid, true);
    assert.equal(platform.isFirefox, true);
});

test('ya instalada no se ofrece nada, aunque sea iOS', () => {
    const variant = resolveInstallVariant({platform: platformOf('iPhone; CPU iPhone OS 26_0 like Mac OS X', 5), canPromptNative: false, isInstalled: true});
    assert.equal(variant, null);
});

test('con el diálogo del navegador disponible va el botón (native)', () => {
    const variant = resolveInstallVariant({platform: platformOf('Linux; Android 14; Chrome/120 Mobile', 5), canPromptNative: true, isInstalled: false});
    assert.equal(variant, INSTALL_VARIANT.native);
});

test('iOS 26 toma el camino moderno, iOS 18 el clásico y el iPad sin versión el moderno', () => {
    const resolve = (userAgent) => resolveInstallVariant({platform: platformOf(userAgent, 5), canPromptNative: false, isInstalled: false});
    assert.equal(resolve('iPhone; CPU iPhone OS 26_0 like Mac OS X'), INSTALL_VARIANT.iosModern);
    assert.equal(resolve('iPhone; CPU iPhone OS 18_5 like Mac OS X'), INSTALL_VARIANT.iosClassic);
    assert.equal(resolve('Macintosh; Intel Mac OS X 10_15_7'), INSTALL_VARIANT.iosModern);
});

test('Firefox de Android va con sus pasos a mano', () => {
    const variant = resolveInstallVariant({platform: platformOf('Android 14; Mobile; rv:120.0 Firefox/120.0', 5), canPromptNative: false, isInstalled: false});
    assert.equal(variant, INSTALL_VARIANT.androidFirefox);
});

test('Android con Chrome antes de que avise y el escritorio sin aviso no enseñan nada', () => {
    const resolve = (userAgent, maxTouchPoints) => resolveInstallVariant({platform: platformOf(userAgent, maxTouchPoints), canPromptNative: false, isInstalled: false});
    assert.equal(resolve('Linux; Android 14; Chrome/120 Mobile', 5), null);
    assert.equal(resolve('Windows NT 10.0; Win64; x64; Chrome/120', 0), null);
});
