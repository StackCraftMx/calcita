// Campo suelto que elige una clave de un catálogo ([{code, label}]): actividad económica, giro, país, banco… Se busca por la
// clave o por el texto, sin acentos ni mayúsculas, y al formulario llega solo la clave. Con `multiple` elige varias: cada una
// queda como chip con su ×, la lista no se cierra al elegir y al formulario llega la lista de claves en el orden elegido.
// Con varias, además (cada una se pide):
//   selectAll    «Elegir todos» arriba de la lista, con su casilla a medias si hay algunos; con algo escrito en el buscador,
//                «Elegir los N que coinciden» (todos los que coinciden, no solo los que se ven)
//   checkboxes   una casilla en cada opción (se ve de un vistazo qué está elegido)
//   limitTags    cuántos chips se ven con el campo sin foco; los demás, «+3 más»
//
// Por qué no un <select>: con catálogos de cientos de opciones no se puede usar; y con texto libre la gente inventa claves.
// Se enseñan a lo más MAX_VISIBLE_OPTIONS coincidencias: con miles, la lista completa congela la pantalla.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaCatalogInput con defaultProps, styleOverrides de
// sus partes (field) y slots/slotProps para cambiarlas.
//
// Con `multiple`, también minSelected / maxSelected (o leídos del esquema, array().min().max()): lo que se sale avisa o, con
// limitMode fix, una lista ya llena apaga las opciones que faltan (y «Elegir todos» si se pasaría). fieldLimits.js.
//
// Genérico del paquete: function (regla de la casa).
import {useId, useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';

import {useValidationText} from '@/forms/useValidationText.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {LIMIT_MODE, isListFull, listLimitProblemOf, wouldOverfillList} from '@/inputs/fieldLimits.js';
import {selectAllStateOf} from '@/inputs/selectAllState.js';
import {useLimitWarning} from '@/inputs/useLimitWarning.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaCatalogInput)
const THEME_NAME = 'CalcitaCatalogInput';
const CatalogInputField = piecePart(THEME_NAME, 'Field', Autocomplete);

const MAX_VISIBLE_OPTIONS = 100;
// la opción de «Elegir todos»: no es del catálogo y nunca llega al formulario
const SELECT_ALL_CODE = '__calcita_select_all__';

/**
 * Un texto sin acentos ni mayúsculas, para que «credito» encuentre «Crédito».
 *
 * @param {unknown} text
 * @returns {string}
 */
function plainTextOf(text) {
    return String(text ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|string[]|null|undefined} props.value la clave elegida ('' = ninguna); con multiple, la lista ([] = ninguna)
 * @param {(code: any) => void} props.onChange recibe la clave ('' al borrar); con multiple, la lista de claves
 * @param {() => void} [props.onBlur]
 * @param {Array<{code: string, label: string}>} props.options
 * @param {(option: {code: string, label: string}) => string} [props.formatLabel] por omisión «Nombre (clave)»
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText]
 * @param {boolean} [props.loading] el catálogo todavía no llega
 * @param {string} [props.placeholder] la pista con el campo vacío, ya traducida (p. ej. «Busque un estado»): sin ella, en un
 *     formulario agrupado el campo vacío solo enseña su botón y no se entiende qué es
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.required] obligatorio: el asterisco en la etiqueta y aria-required en el campo (sin required: con varias opciones elegidas el texto queda vacío y el navegador no dejaría enviar)
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {boolean} [props.multiple] elegir varias claves
 * @param {boolean} [props.selectAll] con multiple: «Elegir todos» (o los que coinciden con lo buscado) arriba de la lista
 * @param {boolean} [props.checkboxes] con multiple: una casilla en cada opción
 * @param {number} [props.limitTags] con multiple: cuántos chips se ven sin foco; los demás como «+3 más»
 * @param {number} [props.minSelected] con multiple: cuántas claves pide como mínimo; ninguna no se revisa (eso es required)
 * @param {number} [props.maxSelected] con multiple: cuántas claves caben
 * @param {'warn'|'fix'} [props.limitMode] lo que pasa al pasarse de maxSelected: LIMIT_MODE.warn lo dice en rojo (por omisión,
 *     o el de ToolkitProvider) y LIMIT_MODE.fix apaga las opciones que faltan cuando ya está llena
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación
 *     ({required: 'Escriba el RFC', matches: 'El RFC lleva 12 o 13 caracteres'}): gana al de Calcita y al de los textos
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function CatalogInputContent(props) {
    const {
        name, label, value, onChange, onBlur, options = [], formatLabel, error, helperText = ' ', loading = false, disabled = false, required = false, inputRef, placeholder,
        multiple = false, selectAll = false, checkboxes = false, limitTags, minSelected, maxSelected, limitMode, messages, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    // el texto del error: el de la pantalla (messages), el del proyecto para este campo o el de Calcita
    const validationTextOf = useValidationText({name, label, messages});
    const generatedId = useId();
    const inputId = `${name ?? 'catalog'}-${generatedId}`;
    const selectedCodes = multiple && Array.isArray(value) ? value : [];
    // el error del formulario o el del tope (también revisa los topes: uno mal escrito truena aquí con su mensaje)
    const limit = useLimitWarning({
        limitMode, error, validationTextOf, limitProblem: multiple ? listLimitProblemOf(selectedCodes, {minSelected, maxSelected}) : null,
    });
    const errorText = limit.errorText;
    // con varias, en el orden en que se eligieron (el de la lista de claves)
    const selectedOption = multiple
        ? (Array.isArray(value) ? value : []).map((code) => options.find((option) => option.code === code)).filter(Boolean)
        : options.find((option) => option.code === value) ?? null;
    const optionLabelOf = (option) => (formatLabel ? formatLabel(option) : `${option.label} (${option.code})`);
    // lo escrito en el buscador: «Elegir todos» abarca lo que coincide con eso
    const [searchText, setSearchText] = useState('');
    const matchesSearch = (option, text) => {
        const wantedText = plainTextOf(text);
        return !wantedText || plainTextOf(optionLabelOf(option)).includes(wantedText);
    };
    const matchingCodes = options.filter((option) => matchesSearch(option, searchText)).map((option) => option.code);
    const selectAllState = selectAllStateOf(selectedCodes, matchingCodes);
    const selectAllLabel = (() => {
        if (searchText.trim()) {
            return selectAllState.allChosen ? t('form.unselectMatching', {count: matchingCodes.length}) : t('form.selectMatching', {count: matchingCodes.length});
        }
        return selectAllState.allChosen ? t('form.unselectAll') : t('form.selectAll', {count: matchingCodes.length});
    })();
    const showsSelectAll = multiple && selectAll;
    // con fix: la lista llena apaga las que faltan, y «Elegir todos» se apaga si se pasaría del máximo
    const limitsChoosing = multiple && limit.mode === LIMIT_MODE.fix;
    const isFull = limitsChoosing && isListFull(selectedCodes, maxSelected);
    const unchosenMatchingCount = matchingCodes.filter((code) => !selectedCodes.includes(code)).length;
    const isSelectAllBlocked = limitsChoosing && !selectAllState.allChosen && wouldOverfillList(selectedCodes, unchosenMatchingCount, maxSelected);
    const isOptionBlocked = (option) => (option.code === SELECT_ALL_CODE ? isSelectAllBlocked : isFull && !selectedCodes.includes(option.code));

    return (
        <FieldFrame inputId={inputId} label={label} required={required}>
            <CatalogInputField
                id={inputId}
                multiple={multiple}
                disableCloseOnSelect={multiple}
                fullWidth
                size="small"
                options={options}
                value={selectedOption}
                loading={loading}
                disabled={disabled}
                noOptionsText={t('form.noOptions')}
                loadingText={t('form.loadingOptions')}
                getOptionLabel={(option) => (option.code === SELECT_ALL_CODE ? selectAllLabel : optionLabelOf(option))}
                isOptionEqualToValue={(option, currentOption) => option.code === currentOption.code}
                getOptionDisabled={limitsChoosing ? isOptionBlocked : undefined}
                filterOptions={(allOptions, {inputValue}) => {
                    const matchingOptions = allOptions.filter((option) => matchesSearch(option, inputValue)).slice(0, MAX_VISIBLE_OPTIONS);
                    // «Elegir todos» va arriba solo si hay de dónde elegir
                    return showsSelectAll && matchingOptions.length > 0 ? [{code: SELECT_ALL_CODE, label: selectAllLabel}, ...matchingOptions] : matchingOptions;
                }}
                // con «Elegir todos», lo buscado se queda al elegir (MUI lo borraba): así se eligen varios de la misma búsqueda.
                // Al salir del campo sí se borra. Sin «Elegir todos», el campo se porta como siempre
                inputValue={showsSelectAll ? searchText : undefined}
                onInputChange={(event, text, reason) => {
                    // MUI 7 avisa con qué borra el texto: al elegir o quitar una opción ('selectOption', 'removeOption', 'reset');
                    // al salir del campo es 'blur' y ese sí se borra
                    const isResetByChoosing = ['selectOption', 'removeOption', 'reset'].includes(reason) && event?.type !== 'blur';
                    if (!(showsSelectAll && isResetByChoosing)) {
                        setSearchText(text);
                    }
                }}
                onChange={(event, option, reason, details) => {
                    limit.markLeft();
                    if (!multiple) {
                        onChange(option?.code ?? '');
                        return;
                    }
                    if (details?.option?.code === SELECT_ALL_CODE) {
                        onChange(selectAllState.toggled());
                        return;
                    }
                    onChange(option.filter((chosenOption) => chosenOption.code !== SELECT_ALL_CODE).map((chosenOption) => chosenOption.code));
                }}
                limitTags={multiple ? limitTags : undefined}
                getLimitTagsText={(hiddenCount) => t('form.moreSelected', {count: hiddenCount})}
                renderOption={multiple && (checkboxes || selectAll) ? (optionProps, option, {selected}) => {
                    // OJO: key va aparte; dentro de las props React avisa en la consola
                    const {key, ...liProps} = optionProps;
                    const isSelectAll = option.code === SELECT_ALL_CODE;
                    const showsBox = checkboxes || isSelectAll;
                    return (
                        <li key={key} {...liProps} {...(isSelectAll && {'aria-selected': selectAllState.allChosen})}
                            style={isSelectAll ? {fontWeight: 600} : undefined}>
                            {showsBox && (
                                <Checkbox size="small" tabIndex={-1} disableRipple sx={{p: 0, mr: 1}}
                                          checked={isSelectAll ? selectAllState.allChosen : selected}
                                          indeterminate={isSelectAll && selectAllState.someChosen} />
                            )}
                            {isSelectAll ? selectAllLabel : optionLabelOf(option)}
                        </li>
                    );
                } : undefined}
                onBlur={(event) => {
                    limit.markLeft();
                    onBlur?.(event);
                }}
                renderInput={(inputProps) => (
                    <TextField {...inputProps} inputProps={{...inputProps.inputProps, 'aria-required': required || undefined}} name={name} inputRef={inputRef} placeholder={placeholder} error={Boolean(errorText)} helperText={errorText ?? helperText} />
                )}
            />
        </FieldFrame>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const CatalogInput = withPieceSlots(CatalogInputContent, THEME_NAME);
export default CatalogInput;
