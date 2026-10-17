// Lista desplegable suelta, con la etiqueta arriba (mismo look que TextInput): la que pintan FormSelectField (formik) y la
// de react-hook-form, y la que se usa sin formulario.
//
// Cada opción puede traer una explicación (description) que se lee en la lista para escoger; en la caja queda solo el
// nombre de lo elegido. OJO: sin renderValue, MUI copiaba la opción completa a la caja y se leía «MenudeoCompra por pieza…».
//
// Genérico del paquete: function (regla de la casa).
import {useId} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|number|null|undefined} props.value '' = sin elegir
 * @param {(value: string|number) => void} props.onChange recibe el valor elegido, no el evento
 * @param {() => void} [props.onBlur]
 * @param {Array<{value: string|number, label: string, description?: string}>} props.options
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] ayuda fija; el error la reemplaza
 * @param {string} [props.placeholder] texto de la opción vacía
 * @param {boolean} [props.disabled]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 */
export default function SelectInput({
    name, label, value, onChange, onBlur, options, error, helperText = ' ', placeholder, disabled = false, inputRef,
}) {
    const {t} = useToolkitTranslation('common');
    const generatedId = useId();
    const inputId = `${name ?? 'select'}-${generatedId}`;
    const errorText = translateValidationMessage(t, error);
    const placeholderText = (
        <Typography component="span"
                    // OJO: el placeholder de un select activo se lee (text.secondary); text.disabled solo con el campo inactivo
                    color={disabled ? 'text.disabled' : 'text.secondary'}>{placeholder ?? t('form.selectPlaceholder')}</Typography>
    );
    const renderSelectedValue = (selectedValue) => options.find((option) => option.value === selectedValue)?.label ?? placeholderText;

    return (
        <FieldFrame inputId={inputId} label={label}>
            <TextField
                name={name}
                id={inputId}
                inputRef={inputRef}
                select
                size="small"
                fullWidth
                disabled={disabled}
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value)}
                onBlur={onBlur}
                error={Boolean(errorText)}
                helperText={errorText ?? helperText}
                slotProps={{select: {displayEmpty: true, renderValue: renderSelectedValue}}}>
                <MenuItem value="" disabled>{placeholderText}</MenuItem>
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value} sx={{whiteSpace: 'normal', flexDirection: 'column', alignItems: 'flex-start'}}>
                        <Typography component="span" variant="body2">{option.label}</Typography>
                        {option.description && (
                            <Typography component="span" variant="caption" color="text.secondary">{option.description}</Typography>
                        )}
                    </MenuItem>
                ))}
            </TextField>
        </FieldFrame>
    );
}
