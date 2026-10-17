// Pruebas de juntar ajustes de componentes. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {mergeComponents} from '@/theme/mergeComponents.js';

test('el segundo ajuste se suma al primero en el mismo componente, sin borrarlo', () => {
    const merged = mergeComponents(
        {MuiAppBar: {defaultProps: {elevation: 0}, styleOverrides: {root: () => ({color: 'white', borderBottom: '1px solid'})}}},
        {MuiAppBar: {styleOverrides: {root: {color: 'black', backdropFilter: 'blur(20px)'}}}},
    );

    assert.deepEqual(merged.MuiAppBar.defaultProps, {elevation: 0});
    assert.deepEqual(merged.MuiAppBar.styleOverrides.root({}), {color: 'black', borderBottom: '1px solid', backdropFilter: 'blur(20px)'});
});

test('un componente que solo está en uno de los dos se queda tal cual', () => {
    const chip = {styleOverrides: {root: {height: 24}}};
    const merged = mergeComponents({MuiChip: chip}, {MuiDrawer: {defaultProps: {anchor: 'left'}}});

    assert.equal(merged.MuiChip, chip);
    assert.deepEqual(merged.MuiDrawer, {defaultProps: {anchor: 'left'}});
});

test('lo anidado se suma por dentro: el modo oscuro del primero conserva lo que el segundo no toca', () => {
    const dark = '*:where(.dark) &';
    const merged = mergeComponents(
        {MuiAppBar: {styleOverrides: {root: {color: 'white', [dark]: {backgroundColor: 'black', color: 'silver'}}}}},
        {MuiAppBar: {styleOverrides: {root: {[dark]: {backgroundColor: 'gray'}}}}},
    );

    assert.deepEqual(merged.MuiAppBar.styleOverrides.root({})[dark], {backgroundColor: 'gray', color: 'silver'});
});

test('lo del segundo queda al final aunque la llave ya existiera: en CSS gana lo último', () => {
    // la trampa: el modo oscuro de la barra quedaba antes del sólido de «reducir transparencia» y la barra salía naranja
    const dark = '*:where(.dark) &';
    const reducedTransparency = '@media (prefers-reduced-transparency: reduce)';
    const merged = mergeComponents(
        {MuiAppBar: {styleOverrides: {root: {backgroundColor: 'orange', [dark]: {backgroundColor: 'black'}}}}},
        {MuiAppBar: {styleOverrides: {root: {[reducedTransparency]: {backgroundColor: 'orange'}, [dark]: {[reducedTransparency]: {backgroundColor: 'black'}}}}}},
    );

    assert.deepEqual(Object.keys(merged.MuiAppBar.styleOverrides.root({})), ['backgroundColor', reducedTransparency, dark]);
});
