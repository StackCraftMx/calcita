import {useState} from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const DELIVERY_SPEEDS = ['standard', 'express', 'pickup'];

// una sola elección entre pocas opciones que se ven todas a la vez
const RadioButtons = () => {
    const {t} = useToolkitTranslation('catalog');
    const [deliverySpeed, setDeliverySpeed] = useState('standard');

    return (
        <Stack spacing={1}>
            <RadioGroup row value={deliverySpeed} onChange={(event) => setDeliverySpeed(event.target.value)} aria-label={t('selection.radio.ariaLabel')}>
                {DELIVERY_SPEEDS.map((speed) => (
                    <FormControlLabel key={speed} value={speed} control={<Radio />} label={t(`selection.speeds.${speed}`)} />
                ))}
            </RadioGroup>
            <FormControlLabel disabled control={<Radio checked />} label={t('states.disabled')} />
        </Stack>
    );
};

export default RadioButtons;
