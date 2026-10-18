import {useState} from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const SORT_FIELDS = ['date', 'amount', 'customer'];
const FIELD_WIDTH = 240;

// con vidrio, la lista flota de vidrio y marca la opción actual con su palomita
const SelectField = () => {
    const {t} = useToolkitTranslation('catalog');
    const [sortField, setSortField] = useState('date');
    return (
        <TextField select label={t('inputs.select.sortBy')} value={sortField} onChange={(event) => setSortField(event.target.value)}
                   sx={{width: FIELD_WIDTH}}>
            {SORT_FIELDS.map((field) => <MenuItem key={field} value={field}>{t(`inputs.select.fields.${field}`)}</MenuItem>)}
        </TextField>
    );
};

export default SelectField;
