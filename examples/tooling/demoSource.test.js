// Pruebas de cómo sale el código de los ejemplos del catálogo: el JS sin tipos, con sus comentarios y el formato de la
// casa. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {demoSourcesOf} from './demoSource.js';

const SAMPLE_DEMO = `import {useState} from 'react';
import type {ChangeEvent} from 'react';
import TextField from '@mui/material/TextField';

// el nombre se guarda mientras se escribe
const NameField = () => {
    const [name, setName] = useState<string>('');
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value);

    return <TextField label="Nombre" value={name} onChange={handleChange} />;
};

export default NameField;
`;

test('el JS sale sin tipos y sin los imports que solo eran de tipos, con sus comentarios', async () => {
    const {js} = await demoSourcesOf(SAMPLE_DEMO, 'NameField.tsx');
    assert.doesNotMatch(js, /<string>|: ChangeEvent|import type/);
    assert.match(js, /const \[name, setName\] = useState\(''\);/);
    assert.match(js, /const handleChange = \(event\) => setName\(event\.target\.value\);/);
    assert.match(js, /\/\/ el nombre se guarda mientras se escribe/);
});

test('el TS se queda con sus tipos y los dos llevan el formato de la casa (4 espacios, comillas sencillas)', async () => {
    const {ts, js} = await demoSourcesOf(SAMPLE_DEMO, 'NameField.tsx');
    assert.match(ts, /useState<string>\(''\)/);
    for (const code of [ts, js]) {
        assert.match(code, /\n {4}const \[name, setName\]/);
        assert.match(code, /import TextField from '@mui\/material\/TextField';/);
    }
});

test('un renglón en blanco entre las partes del ejemplo se queda en el JS', async () => {
    const {js} = await demoSourcesOf(SAMPLE_DEMO, 'NameField.tsx');
    assert.match(js, /setName\(event\.target\.value\);\n\n {4}return/);
});

test('un renglón que solo traía tipos no deja un hueco: los imports siguen juntos', async () => {
    const {js} = await demoSourcesOf(SAMPLE_DEMO, 'NameField.tsx');
    assert.match(js, /^import \{useState\} from 'react';\nimport TextField from '@mui\/material\/TextField';\n/);
});
