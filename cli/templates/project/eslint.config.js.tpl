// Las reglas de ESLint del proyecto (pnpm lint): lo que se caza al escribir y no en la pantalla del cliente. La que más
// ahorra: no-undef, una variable que no existe (un `t` que una función auxiliar se quedó sin recibir truena con «t is not
// defined» hasta que alguien abre esa pantalla). Y las de los hooks de React (en el orden de siempre, con sus dependencias).
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
    {ignores: ['dist/', 'coverage/']},
    js.configs.recommended,
    reactHooks.configs.flat.recommended,
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {...globals.browser},
            parserOptions: {ecmaFeatures: {jsx: true}},
        },
        rules: {
            // un parámetro que no se usa a propósito lleva «unused» en el nombre (unusedEvent)
            'no-unused-vars': ['error', {argsIgnorePattern: '^unused', varsIgnorePattern: '^unused', caughtErrors: 'none'}],
        },
    },
    // la configuración y las pruebas corren en node
    {files: ['*.config.js', 'src/testing/**', '**/*.test.{js,jsx}'], languageOptions: {globals: {...globals.node}}},
];
