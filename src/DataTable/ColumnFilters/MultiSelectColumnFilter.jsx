// Filtro de opciones de una columna.
//
// Dos cosas lo separan de un multi-select cualquiera:
//   - las opciones NO salen de las filas visibles: salen de las FACETAS que el servidor calcula sobre el resultado
//     COMPLETO (ofrecer solo lo que aparece en las primeras 25 filas convierte el filtro en adorno);
//   - cada opción trae su conteo, que es lo que deja decidir si vale la pena filtrar.
//
// Desde ocho opciones aparece una caja para buscar entre ellas.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {formatNumber} from '@/formatting.js';

const SEARCHABLE_FROM_OPTIONS = 8;

/**
 * @param {object} props
 * @param {string[]} [props.value]
 * @param {(value: string[]) => void} props.onChange
 * @param {Array<{value: string, total: number}>} [props.options] faceta del servidor
 * @param {(value: string) => import('react').ReactNode} [props.renderOption] cómo se lee el valor (diccionario)
 */
export default function MultiSelectColumnFilter({value = [], onChange, options = [], renderOption}) {
    const {t} = useToolkitTranslation('table');
    const [searchText, setSearchText] = useState('');

    const toggleOption = (optionValue) => onChange(value.includes(optionValue)
        ? value.filter((currentValue) => currentValue !== optionValue)
        : [...value, optionValue]);

    const isSearchable = options.length >= SEARCHABLE_FROM_OPTIONS;
    const visibleOptions = isSearchable && searchText
        ? options.filter((option) => String(option.value).toLowerCase().includes(searchText.toLowerCase()))
        : options;

    return (
        <Stack spacing={1}>
            {isSearchable && (
                <TextField size="small" autoFocus fullWidth placeholder={t('options.searchPlaceholder')} value={searchText}
                           onChange={(event) => setSearchText(event.target.value)} />
            )}
            <Stack sx={{maxHeight: 300, overflowY: 'auto'}}>
                {options.length === 0 && (
                    <Typography variant="caption" color="text.secondary">{t('options.empty')}</Typography>
                )}
                {options.length > 0 && visibleOptions.length === 0 && (
                    <Typography variant="caption" color="text.secondary">{t('options.noMatch', {text: searchText})}</Typography>
                )}
                {visibleOptions.map((option) => (
                    <FormControlLabel
                        key={option.value}
                        control={<Checkbox size="small" checked={value.includes(option.value)} onChange={() => toggleOption(option.value)} />}
                        label={(
                            <Stack direction="row" spacing={0.75} sx={{alignItems: 'center'}}>
                                {renderOption ? renderOption(option.value) : <Typography variant="body2">{option.value}</Typography>}
                                <Typography variant="caption" color="text.secondary">{formatNumber(option.total)}</Typography>
                            </Stack>
                        )}
                    />
                ))}
            </Stack>
        </Stack>
    );
}
