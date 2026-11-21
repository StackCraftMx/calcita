// Pruebas de lo que el Autocomplete le pasa a su caja, con la forma de MUI 7 y con la de MUI 9. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {splitAutocompleteParams} from '@/inputs/autocompleteParams.js';

// la referencia que abre la lista debajo de la caja: si se pierde, la caja se desconecta de su lista
const anchorRef = () => {};

test('con MUI 7 (InputProps, inputProps, InputLabelProps) sale con la forma de MUI 9 y sin los nombres viejos', () => {
    const params = {id: 'page', disabled: false, fullWidth: true, size: 'small',
        InputProps: {ref: anchorRef, className: 'MuiAutocomplete-inputRoot'},
        inputProps: {'aria-autocomplete': 'list'},
        InputLabelProps: {htmlFor: 'page'}};

    const {textFieldProps, slotProps} = splitAutocompleteParams(params);

    assert.deepEqual(textFieldProps, {id: 'page', disabled: false, fullWidth: true, size: 'small'});
    assert.equal(slotProps.input.ref, anchorRef);
    assert.deepEqual(slotProps.htmlInput, {'aria-autocomplete': 'list'});
    assert.deepEqual(slotProps.inputLabel, {htmlFor: 'page'});
});

test('con MUI 9 (slotProps) sale tal cual lo manda MUI', () => {
    const fromMui = {input: {ref: anchorRef}, htmlInput: {'aria-autocomplete': 'list'}, inputLabel: {htmlFor: 'page'}};

    const {textFieldProps, slotProps} = splitAutocompleteParams({id: 'page', size: 'small', slotProps: fromMui});

    assert.deepEqual(textFieldProps, {id: 'page', size: 'small'});
    assert.equal(slotProps, fromMui);
});
