import {useState} from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// ciudades de ejemplo (datos de mentira)
const SAMPLE_CITIES = ['Ciudad de México', 'Guadalajara', 'Mérida', 'Monterrey', 'Puebla', 'Querétaro'];
const FIELD_WIDTH = 240;

const AutocompleteFields = () => {
    const {t} = useToolkitTranslation('catalog');
    const [city, setCity] = useState<string | null>(SAMPLE_CITIES[1]);
    const [cities, setCities] = useState<string[]>([SAMPLE_CITIES[0], SAMPLE_CITIES[3]]);

    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'flex-start'}}>
            <Autocomplete options={SAMPLE_CITIES} value={city} onChange={(event, value) => setCity(value)} sx={{width: FIELD_WIDTH}}
                          renderInput={(params) => <TextField {...params} label={t('samples.city')} />} />
            <Autocomplete multiple options={SAMPLE_CITIES} value={cities} onChange={(event, value) => setCities(value)}
                          sx={{width: FIELD_WIDTH * 1.5}} renderInput={(params) => <TextField {...params} label={t('samples.cities')} />} />
        </Stack>
    );
};

export default AutocompleteFields;
