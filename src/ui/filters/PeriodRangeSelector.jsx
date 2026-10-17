// Un rango de periodos: «desde» y «hasta», cada uno una lista para elegir (de tal quincena a tal quincena, de tal mes a
// tal mes). Se usa en lugar de un calendario porque los periodos no son días: solo se ofrecen los que existen, y los que no
// se pueden elegir salen apagados con su razón.
//
// «Hasta» solo ofrece lo que hace un rango válido con «desde»: nada de antes y nada que salte un periodo apagado
// (periodRanges.js). Al cambiar «desde», si el «hasta» que había ya no vale, se iguala a «desde».
//
// No sabe de quincenas ni de productos: recibe las opciones ya ordenadas y con sus textos traducidos.
//
// Genérico del paquete: function (regla de la casa).
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';

import {rangeEndAfterStartChange, rangeEndOptionsOf} from '@/periodRanges.js';

// ancho de cada lista: cabe «septiembre 2026 · Q2» sin cortarse
const SELECT_MINIMUM_WIDTH = 210;

/**
 * Una lista del rango.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {Array<{value: string, label: string, disabled: boolean, hint?: string}>} props.options
 */
function PeriodSelect({id, label, value, options, onChange}) {
    return (
        <FormControl size="small" sx={{minWidth: SELECT_MINIMUM_WIDTH, flex: '0 0 auto'}}>
            <InputLabel id={`${id}-label`}>{label}</InputLabel>
            <Select labelId={`${id}-label`} label={label} value={value ?? ''} onChange={(event) => onChange(event.target.value)}
                    sx={{bgcolor: 'background.paper'}}
                    renderValue={(selectedValue) => options.find((option) => option.value === selectedValue)?.label ?? ''}>
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                        {/* la razón de una opción apagada va debajo de su nombre: «sin validar» se lee sin tooltip */}
                        <ListItemText primary={option.label} secondary={option.disabled ? option.hint : undefined} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

/**
 * @param {object} props
 * @param {string} props.id prefijo de los id de las dos listas (accesibilidad)
 * @param {Array<{value: string, label: string, disabled: boolean, hint?: string}>} props.options en orden; ya
 *     traducidas
 * @param {string|null} props.from
 * @param {string|null} props.to
 * @param {string} props.fromLabel ya traducido
 * @param {string} props.toLabel ya traducido
 * @param {(range: {from: string, to: string}) => void} props.onChange
 */
export default function PeriodRangeSelector({id, options, from, to, fromLabel, toLabel, onChange}) {
    const endOptions = rangeEndOptionsOf(options, from);

    return (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{alignItems: 'center', flexWrap: 'wrap'}}>
            <PeriodSelect id={`${id}-from`} label={fromLabel} value={from} options={options}
                          onChange={(nextFrom) => onChange({from: nextFrom, to: rangeEndAfterStartChange(options, nextFrom, to)})} />
            <PeriodSelect id={`${id}-to`} label={toLabel} value={to} options={endOptions}
                          onChange={(nextTo) => onChange({from, to: nextTo})} />
        </Stack>
    );
}
