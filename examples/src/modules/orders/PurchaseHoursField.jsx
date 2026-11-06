// La hora de compra en el cajón de búsqueda de Pedidos: de qué hora a qué hora del día se hizo el pedido, en la zona de la
// tienda. Es un rango PROPIO del cajón (kind custom con keys): guarda 'HH:mm' en sus dos llaves, cuenta como un filtro y da
// sus dos chips. Cada hora acota a la otra en su reloj; si se teclea al revés, el cajón lo dice aquí (errors, porque el campo
// trae isBackwards) y no deja buscar.
import {useId} from 'react';
import Box from '@mui/material/Box';
import {FieldFrame} from '@stackcraftmx/calcita';
import {TimeInput} from '@stackcraftmx/calcita/date-pickers';

/**
 * @param {object} props lo que el cajón le da a render (values, setValue, keys, errors) y sus textos
 */
export const PurchaseHoursField = ({label, fromLabel, toLabel, values, setValue, keys: [fromKey, toKey], errors}) => {
    const labelId = useId();

    return (
        <FieldFrame labelId={labelId} label={label}>
            <Box role="group" aria-labelledby={labelId} sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 1.5, alignItems: 'start'}}>
                <TimeInput name={fromKey} label={fromLabel} value={values[fromKey]} onChange={(time) => setValue(fromKey, time)}
                           maxTime={values[toKey] || undefined} error={errors[fromKey]} helperText="" />
                <TimeInput name={toKey} label={toLabel} value={values[toKey]} onChange={(time) => setValue(toKey, time)}
                           minTime={values[fromKey] || undefined} error={errors[toKey]} />
            </Box>
        </FieldFrame>
    );
};
