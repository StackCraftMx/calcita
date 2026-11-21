// Lo que el Autocomplete de MUI le pasa a su caja en renderInput: la referencia para abrir la lista debajo de la caja, el
// teclado, los adornos y la etiqueta. Calcita acepta MUI 7 y MUI 9, y cada uno lo entrega con otra forma:
//   - MUI 7: params.InputProps, params.inputProps y params.InputLabelProps;
//   - MUI 9: params.slotProps.input, params.slotProps.htmlInput y params.slotProps.inputLabel (los de MUI 7 ya no vienen).
// OJO: si se lee la forma equivocada no truena, pero la caja se desconecta de su lista. Por eso las piezas de la casa leen
// siempre de aquí y no de params directo.

/**
 * Separa lo que el Autocomplete le da a su caja: lo que va directo al TextField y lo que va en su slotProps, este siempre con
 * la forma de MUI 9 aunque el proyecto use MUI 7.
 *
 * @param {Object} params lo que llega a renderInput
 *
 * @return {{textFieldProps: Object, slotProps: {input: Object, htmlInput: Object, inputLabel: Object}}}
 */
export function splitAutocompleteParams(params) {
    // los tres nombres de MUI 7 se quitan de lo que va directo: si viajaran junto con slotProps, el TextField tendría dos
    // versiones de lo mismo
    const {InputProps, inputProps, InputLabelProps, slotProps, ...textFieldProps} = params;

    if (slotProps) {
        return {textFieldProps, slotProps};
    }

    return {textFieldProps, slotProps: {input: InputProps, htmlInput: inputProps, inputLabel: InputLabelProps}};
}
