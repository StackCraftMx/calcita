// Campo suelto que elige UNA clave de un catálogo ([{code, label}]): actividad económica, giro, país, banco… Se busca por la
// clave o por el texto, sin acentos ni mayúsculas, y al formulario llega solo la clave.
//
// Por qué no un <select>: con catálogos de cientos de opciones no se puede usar; y con texto libre la gente inventa claves.
// Se enseñan a lo más MAX_VISIBLE_OPTIONS coincidencias: con miles, la lista completa congela la pantalla.
//
// Genérico del paquete: function (regla de la casa).
import {useId} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';

const MAX_VISIBLE_OPTIONS = 100;

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
 * @param {string|null|undefined} props.value la clave elegida ('' = ninguna)
 * @param {(code: string) => void} props.onChange recibe la clave ('' al borrar)
 * @param {() => void} [props.onBlur]
 * @param {Array<{code: string, label: string}>} props.options
 * @param {(option: {code: string, label: string}) => string} [props.formatLabel] por omisión «Nombre (clave)»
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText]
 * @param {boolean} [props.loading] el catálogo todavía no llega
 * @param {string} [props.placeholder] la pista con el campo vacío, ya traducida (p. ej. «Busque un estado»): sin ella, en un
 *     formulario agrupado el campo vacío solo enseña su botón y no se entiende qué es
 * @param {boolean} [props.disabled]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 */
export default function CatalogInput({
    name, label, value, onChange, onBlur, options = [], formatLabel, error, helperText = ' ', loading = false, disabled = false, inputRef, placeholder,
}) {
    const {t} = useToolkitTranslation('common');
    const generatedId = useId();
    const inputId = `${name ?? 'catalog'}-${generatedId}`;
    const errorText = translateValidationMessage(t, error);
    const selectedOption = options.find((option) => option.code === value) ?? null;
    const optionLabelOf = (option) => (formatLabel ? formatLabel(option) : `${option.label} (${option.code})`);

    return (
        <FieldFrame inputId={inputId} label={label}>
            <Autocomplete
                id={inputId}
                fullWidth
                size="small"
                options={options}
                value={selectedOption}
                loading={loading}
                disabled={disabled}
                noOptionsText={t('form.noOptions')}
                loadingText={t('form.loadingOptions')}
                getOptionLabel={optionLabelOf}
                isOptionEqualToValue={(option, currentOption) => option.code === currentOption.code}
                filterOptions={(allOptions, {inputValue}) => {
                    const wantedText = plainTextOf(inputValue);
                    const matchingOptions = wantedText
                        ? allOptions.filter((option) => plainTextOf(optionLabelOf(option)).includes(wantedText))
                        : allOptions;
                    return matchingOptions.slice(0, MAX_VISIBLE_OPTIONS);
                }}
                onChange={(event, option) => onChange(option?.code ?? '')}
                onBlur={onBlur}
                renderInput={(inputProps) => (
                    <TextField {...inputProps} name={name} inputRef={inputRef} placeholder={placeholder} error={Boolean(errorText)} helperText={errorText ?? helperText} />
                )}
            />
        </FieldFrame>
    );
}
