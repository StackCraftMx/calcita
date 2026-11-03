// Lista desplegable suelta, con la etiqueta arriba (mismo look que TextInput): la que pintan FormSelectField (formik) y la
// de react-hook-form, y la que se usa sin formulario.
//
// Cada opción puede traer una explicación (description) que se lee en la lista para escoger; en la caja queda solo el
// nombre de lo elegido. OJO: sin renderValue, MUI copiaba la opción completa a la caja y se leía «MenudeoCompra por pieza…».
//
// Con `multiple` se eligen varias: la lista se queda abierta, cada elegida lleva su palomita y en la caja quedan sus nombres
// separados por coma, en el orden de las opciones. Al formulario llega la lista de valores (Yup.array().min(1) la valida).
// Para catálogos largos, CatalogInput con `multiple` (busca y deja chips). Con varias, además: selectAll («Elegir todos»
// arriba, con su casilla a medias si hay algunos) y checkboxes (una casilla en cada opción en lugar de la palomita).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaSelectInput con defaultProps y
// styleOverrides de sus partes: option, optionText.
//
// Genérico del paquete: function (regla de la casa).
import {useId} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {useValidationText} from '@/forms/useValidationText.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {selectAllStateOf} from '@/inputs/selectAllState.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaSelectInput)
const THEME_NAME = 'CalcitaSelectInput';
const SelectOption = piecePart(THEME_NAME, 'Option', MenuItem);
const SelectOptionText = piecePart(THEME_NAME, 'OptionText', Box);
// la opción de «Elegir todos»: no es de la lista y nunca llega al formulario
const SELECT_ALL_VALUE = '__calcita_select_all__';
// con casillas, la palomita que el tema le pone al elegido sobra
const WITHOUT_CHECKMARK = Object.freeze({'&.Mui-selected::after': {content: 'none'}});

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|number|Array<string|number>|null|undefined} props.value '' = sin elegir; con multiple, la lista ([] = ninguna)
 * @param {(value: any) => void} props.onChange recibe el valor elegido (con multiple, la lista), no el evento
 * @param {() => void} [props.onBlur]
 * @param {Array<{value: string|number, label: string, description?: string, disabled?: boolean}>} props.options
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] ayuda fija; el error la reemplaza
 * @param {string} [props.placeholder] texto de la opción vacía
 * @param {boolean} [props.disabled]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {boolean} [props.multiple] elegir varias opciones
 * @param {boolean} [props.selectAll] con multiple: «Elegir todos» arriba de la lista
 * @param {boolean} [props.checkboxes] con multiple: una casilla en cada opción
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación
 *     ({required: 'Escriba el RFC', matches: 'El RFC lleva 12 o 13 caracteres'}): gana al de Calcita y al de los textos
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function SelectInputContent(props) {
    // lo que el proyecto puso en su tema (components.CalcitaSelectInput.defaultProps) y encima lo que llega aquí
    const {
    name, label, value, onChange, onBlur, options, error, helperText = ' ', placeholder, disabled = false, inputRef, multiple = false,
    selectAll = false, checkboxes = false, messages, texts,
    ...unknownProps
} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    // el texto del error: el de la pantalla (messages), el del proyecto para este campo o el de Calcita
    const validationTextOf = useValidationText({name, label, messages});
    const generatedId = useId();
    const inputId = `${name ?? 'select'}-${generatedId}`;
    // OJO: la lista desplegable de MUI es un div y no un <input>: el `for` de la etiqueta no la une. Se nombra con su etiqueta
    // por aria-labelledby (labelId); sin esto el lector de pantalla no decía «Ciudad», solo lo elegido
    const labelId = `${inputId}-label`;
    const errorText = validationTextOf(error);
    const placeholderText = (
        <Typography component="span"
                    // OJO: el placeholder de un select activo se lee (text.secondary); text.disabled solo con el campo inactivo
                    color={disabled ? 'text.disabled' : 'text.secondary'}>{placeholder ?? t('form.selectPlaceholder')}</Typography>
    );
    const renderSelectedValue = (selectedValue) => {
        if (multiple) {
            const selectedLabels = options.filter((option) => selectedValue.includes(option.value)).map((option) => option.label);
            return selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholderText;
        }
        return options.find((option) => option.value === selectedValue)?.label ?? placeholderText;
    };
    const currentValue = multiple ? (Array.isArray(value) ? value : []) : (value ?? '');
    // «Elegir todos» solo existe con varias. OJO, trampa pagada: se calculaba también con una sola, y un valor que es número
    // (un recordatorio de 60 minutos) tumbaba la pantalla: new Set(60) no es una lista
    const selectAllState = multiple
        ? selectAllStateOf(currentValue, options.filter((option) => !option.disabled).map((option) => option.value))
        : null;
    // OJO: con multiple, el autollenado del navegador puede mandar el valor como texto separado por comas (lo dice MUI)
    const handleChange = (event) => {
        const nextValue = event.target.value;
        const values = multiple && typeof nextValue === 'string' ? nextValue.split(',') : nextValue;
        // «Elegir todos» llega como una opción más: se cambia por todos (o por ninguno, si ya estaban todos)
        if (multiple && values.includes(SELECT_ALL_VALUE)) {
            onChange(selectAllState.toggled());
            return;
        }
        onChange(values);
    };

    return (
        <FieldFrame inputId={inputId} labelId={labelId} label={label}>
            <TextField
                name={name}
                id={inputId}
                inputRef={inputRef}
                select
                size="small"
                fullWidth
                disabled={disabled}
                value={currentValue}
                onChange={handleChange}
                onBlur={onBlur}
                error={Boolean(errorText)}
                helperText={errorText ?? helperText}
                slotProps={{select: {multiple, displayEmpty: true, renderValue: renderSelectedValue, labelId}}}>
                {/* la opción vacía solo con una: con varias, se quitan picándolas otra vez */}
                {!multiple && <MenuItem value="" disabled>{placeholderText}</MenuItem>}
                {multiple && selectAll && (
                    <SelectOption value={SELECT_ALL_VALUE} ownSx={{fontWeight: 600, ...WITHOUT_CHECKMARK}}>
                        <Checkbox size="small" tabIndex={-1} disableRipple sx={{p: 0, mr: 1}}
                                  checked={selectAllState.allChosen} indeterminate={selectAllState.someChosen} />
                        {selectAllState.allChosen ? t('form.unselectAll') : t('form.selectAll', {count: options.length})}
                    </SelectOption>
                )}
                {options.map((option) => (
                    // la opción en renglón y su nombre con su explicación en un bloque: con la opción en columna, la palomita del
                    // elegido (el tema la pinta al final) se bajaba a otro renglón (lo cachó una captura de Tareas)
                    <SelectOption key={option.value} value={option.value} disabled={option.disabled}
                                  ownSx={{whiteSpace: 'normal', ...(multiple && checkboxes && WITHOUT_CHECKMARK)}}>
                        {multiple && checkboxes && (
                            <Checkbox size="small" tabIndex={-1} disableRipple sx={{p: 0, mr: 1}} checked={currentValue.includes(option.value)} />
                        )}
                        <SelectOptionText component="span" ownSx={{display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1}}>
                            <Typography component="span" variant="body2">{option.label}</Typography>
                            {option.description && (
                                <Typography component="span" variant="caption" color="text.secondary">{option.description}</Typography>
                            )}
                        </SelectOptionText>
                    </SelectOption>
                ))}
            </TextField>
        </FieldFrame>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const SelectInput = withPieceSlots(SelectInputContent, THEME_NAME);
export default SelectInput;
