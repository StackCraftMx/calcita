// Lista desplegable suelta, con la etiqueta arriba (mismo look que TextInput): la que pintan FormSelectField (formik) y la
// de react-hook-form, y la que se usa sin formulario.
//
// Cada opción puede traer una explicación (description) que se lee en la lista para escoger; en la caja queda solo el
// nombre de lo elegido. OJO: sin renderValue, MUI copiaba la opción completa a la caja y se leía «MenudeoCompra por pieza…».
//
// Con `multiple` se eligen varias: la lista se queda abierta, cada elegida lleva su palomita y en la caja quedan sus nombres
// separados por coma, en el orden de las opciones. Al formulario llega la lista de valores (Yup.array().min(1) la valida).
// Para catálogos largos, CatalogInput con `multiple` (busca y deja chips).
//
// Genérico del paquete: function (regla de la casa).
import {useId} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|number|Array<string|number>|null|undefined} props.value '' = sin elegir; con multiple, la lista ([] = ninguna)
 * @param {(value: any) => void} props.onChange recibe el valor elegido (con multiple, la lista), no el evento
 * @param {() => void} [props.onBlur]
 * @param {Array<{value: string|number, label: string, description?: string}>} props.options
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] ayuda fija; el error la reemplaza
 * @param {string} [props.placeholder] texto de la opción vacía
 * @param {boolean} [props.disabled]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {boolean} [props.multiple] elegir varias opciones
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function SelectInput({
    name, label, value, onChange, onBlur, options, error, helperText = ' ', placeholder, disabled = false, inputRef, multiple = false, texts,
}) {
    const {t} = useToolkitTranslation('common', texts);
    const generatedId = useId();
    const inputId = `${name ?? 'select'}-${generatedId}`;
    // OJO: la lista desplegable de MUI es un div y no un <input>: el `for` de la etiqueta no la une. Se nombra con su etiqueta
    // por aria-labelledby (labelId); sin esto el lector de pantalla no decía «Ciudad», solo lo elegido
    const labelId = `${inputId}-label`;
    const errorText = translateValidationMessage(t, error);
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
    // OJO: con multiple, el autollenado del navegador puede mandar el valor como texto separado por comas (lo dice MUI)
    const handleChange = (event) => {
        const nextValue = event.target.value;
        onChange(multiple && typeof nextValue === 'string' ? nextValue.split(',') : nextValue);
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
                {options.map((option) => (
                    // la opción en renglón y su nombre con su explicación en un bloque: con la opción en columna, la palomita del
                    // elegido (el tema la pinta al final) se bajaba a otro renglón (lo cachó una captura de Tareas)
                    <MenuItem key={option.value} value={option.value} sx={{whiteSpace: 'normal'}}>
                        <Box component="span" sx={{display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1}}>
                            <Typography component="span" variant="body2">{option.label}</Typography>
                            {option.description && (
                                <Typography component="span" variant="caption" color="text.secondary">{option.description}</Typography>
                            )}
                        </Box>
                    </MenuItem>
                ))}
            </TextField>
        </FieldFrame>
    );
}
