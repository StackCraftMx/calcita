// El grupo de casillas: pocas opciones a la vista (los canales de aviso, los días que abre una sucursal), cada una con su
// casilla y, si hace falta, una explicación abajo; al formulario llega la lista de las marcadas. Con pocas opciones es más
// rápido que abrir una lista; con muchas, SelectInput o CatalogInput con `multiple`.
//
// selectAll pone «Elegir todos» arriba, con su casilla a medias si hay algunas marcadas. row las acomoda en renglón (en el
// teléfono bajan solas). Dentro de una FormSection se vuelve renglón, como los demás campos.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaCheckboxGroupInput con defaultProps y
// styleOverrides de sus partes: root, selectAll, option.
//
// Genérico del paquete: function (regla de la casa).
import {useId} from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {selectAllStateOf} from '@/inputs/selectAllState.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaCheckboxGroupInput)
const THEME_NAME = 'CalcitaCheckboxGroupInput';
const CheckboxGroupRoot = piecePart(THEME_NAME, 'Root', FormGroup);
const CheckboxGroupSelectAll = piecePart(THEME_NAME, 'SelectAll', FormControlLabel);
const CheckboxGroupOption = piecePart(THEME_NAME, 'Option', FormControlLabel);

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {import('react').ReactNode} props.label ya traducida
 * @param {Array<string|number>|null|undefined} props.value las marcadas ([] = ninguna)
 * @param {(values: Array<string|number>) => void} props.onChange la lista nueva, en el orden de las opciones
 * @param {() => void} [props.onBlur]
 * @param {Array<{value: string|number, label: string, description?: string, disabled?: boolean}>} props.options
 * @param {boolean} [props.row] en renglón en lugar de una debajo de otra
 * @param {boolean} [props.selectAll] «Elegir todos» arriba
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] ya traducida
 * @param {boolean} [props.disabled]
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function CheckboxGroupInput(props) {
    const {
        name, label, value, onChange, onBlur, options, row = false, selectAll = false, error, helperText = ' ', disabled = false, sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const generatedId = useId();
    const groupId = `${name ?? 'checkbox-group'}-${generatedId}`;
    const labelId = `${groupId}-label`;
    const errorText = translateValidationMessage(t, error);
    const checkedValues = Array.isArray(value) ? value : [];
    const selectAllState = selectAllStateOf(checkedValues, options.filter((option) => !option.disabled).map((option) => option.value));
    // la lista en el orden de las opciones, no en el que se fueron marcando (así viaja siempre igual)
    const inOptionsOrder = (values) => options.map((option) => option.value).filter((optionValue) => values.includes(optionValue));
    const change = (values) => {
        onChange(inOptionsOrder(values));
        onBlur?.();
    };
    const toggle = (optionValue) => change(checkedValues.includes(optionValue)
        ? checkedValues.filter((checkedValue) => checkedValue !== optionValue)
        : [...checkedValues, optionValue]);

    return (
        <FieldFrame inputId={`${groupId}-first`} labelId={labelId} label={label}>
            <div>
                <CheckboxGroupRoot row={row} role="group" aria-labelledby={labelId} ownSx={{columnGap: 2, ...sx}}>
                    {selectAll && (
                        <CheckboxGroupSelectAll
                            disabled={disabled}
                            label={selectAllState.allChosen ? t('form.unselectAll') : t('form.selectAll', {count: options.length})}
                            control={(
                                <Checkbox size="small" checked={selectAllState.allChosen} indeterminate={selectAllState.someChosen}
                                          onChange={() => change(selectAllState.toggled())} />
                            )}
                            ownSx={{'& .MuiFormControlLabel-label': {fontWeight: 600}}}
                        />
                    )}
                    {options.map((option, index) => (
                        <CheckboxGroupOption
                            key={option.value}
                            disabled={disabled || option.disabled}
                            ownSx={{alignItems: option.description ? 'flex-start' : 'center'}}
                            control={(
                                <Checkbox size="small" name={name} id={index === 0 ? `${groupId}-first` : undefined}
                                          checked={checkedValues.includes(option.value)} onChange={() => toggle(option.value)}
                                          sx={option.description ? {mt: -0.5} : undefined} />
                            )}
                            label={option.description ? (
                                <Stack component="span">
                                    <Typography component="span" variant="body2">{option.label}</Typography>
                                    <Typography component="span" variant="caption" color="text.secondary">{option.description}</Typography>
                                </Stack>
                            ) : option.label}
                        />
                    ))}
                </CheckboxGroupRoot>
                <FormHelperText error={Boolean(errorText)}>{errorText ?? helperText}</FormHelperText>
            </div>
        </FieldFrame>
    );
}
