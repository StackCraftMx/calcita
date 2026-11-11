// El grupo de casillas: pocas opciones a la vista (los canales de aviso, los días que abre una sucursal), cada una con su
// casilla y, si hace falta, una explicación abajo; al formulario llega la lista de las marcadas. Con pocas opciones es más
// rápido que abrir una lista; con muchas, SelectInput o CatalogInput con `multiple`.
//
// selectAll pone «Elegir todos» arriba, con su casilla a medias si hay algunas marcadas. row las acomoda en renglón (en el
// teléfono bajan solas). Dentro de una FormSection se vuelve renglón, como los demás campos.
//
// minSelected / maxSelected (o leídos del esquema, array().min().max()): lo que se sale avisa o, con limitMode fix, ya llena
// apaga las casillas que faltan (y «Elegir todos» si se pasaría). El mínimo siempre avisa (fieldLimits.js).
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

import {useValidationText} from '@/forms/useValidationText.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {LIMIT_MODE, isListFull, listLimitProblemOf, wouldOverfillList} from '@/inputs/fieldLimits.js';
import {selectAllStateOf} from '@/inputs/selectAllState.js';
import {useLimitWarning} from '@/inputs/useLimitWarning.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
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
 * @param {boolean} [props.required] obligatorio: el asterisco en la etiqueta (lo revisa el esquema del formulario)
 * @param {number} [props.minSelected] cuántas pide marcadas como mínimo; ninguna no se revisa (eso es required)
 * @param {number} [props.maxSelected] cuántas caben marcadas
 * @param {'warn'|'fix'} [props.limitMode] lo que pasa al pasarse de maxSelected: LIMIT_MODE.warn lo dice en rojo (por omisión,
 *     o el de ToolkitProvider) y LIMIT_MODE.fix apaga las casillas que faltan cuando ya está llena
 * @param {object} [props.sx]
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación
 *     ({required: 'Escriba el RFC', matches: 'El RFC lleva 12 o 13 caracteres'}): gana al de Calcita y al de los textos
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function CheckboxGroupInputContent(props) {
    const {
        name, label, value, onChange, onBlur, options, row = false, selectAll = false, error, helperText = ' ', disabled = false, required = false, sx,
        minSelected, maxSelected, limitMode, messages, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    // el texto del error: el de la pantalla (messages), el del proyecto para este campo o el de Calcita
    const validationTextOf = useValidationText({name, label, messages});
    const generatedId = useId();
    const groupId = `${name ?? 'checkbox-group'}-${generatedId}`;
    const labelId = `${groupId}-label`;
    const checkedValues = Array.isArray(value) ? value : [];
    // el error del formulario o el del tope (también revisa los topes: uno mal escrito truena aquí con su mensaje)
    const limit = useLimitWarning({limitMode, error, validationTextOf, limitProblem: listLimitProblemOf(checkedValues, {minSelected, maxSelected})});
    const errorText = limit.errorText;
    const candidateValues = options.filter((option) => !option.disabled).map((option) => option.value);
    const selectAllState = selectAllStateOf(checkedValues, candidateValues);
    // con fix: ya llena, las que faltan se apagan; y «Elegir todos» se apaga si se pasaría del máximo
    const limitsChoosing = limit.mode === LIMIT_MODE.fix;
    const isFull = limitsChoosing && isListFull(checkedValues, maxSelected);
    const unchosenCount = candidateValues.filter((candidate) => !checkedValues.includes(candidate)).length;
    const isSelectAllBlocked = limitsChoosing && !selectAllState.allChosen && wouldOverfillList(checkedValues, unchosenCount, maxSelected);
    // la lista en el orden de las opciones, no en el que se fueron marcando (así viaja siempre igual)
    const inOptionsOrder = (values) => options.map((option) => option.value).filter((optionValue) => values.includes(optionValue));
    const change = (values) => {
        limit.markLeft();
        onChange(inOptionsOrder(values));
        onBlur?.();
    };
    const toggle = (optionValue) => change(checkedValues.includes(optionValue)
        ? checkedValues.filter((checkedValue) => checkedValue !== optionValue)
        : [...checkedValues, optionValue]);

    return (
        <FieldFrame inputId={`${groupId}-first`} labelId={labelId} label={label} required={required}>
            <div>
                <CheckboxGroupRoot row={row} role="group" aria-labelledby={labelId} ownSx={{columnGap: 2}} sx={sx}>
                    {selectAll && (
                        <CheckboxGroupSelectAll
                            disabled={disabled || isSelectAllBlocked}
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
                            disabled={disabled || option.disabled || (isFull && !checkedValues.includes(option.value))}
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

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const CheckboxGroupInput = withPieceSlots(CheckboxGroupInputContent, THEME_NAME);
export default CheckboxGroupInput;
