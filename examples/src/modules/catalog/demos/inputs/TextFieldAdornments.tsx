import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const FIELD_WIDTH = 240;

const TextFieldAdornments = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap'}}>
            {/* type="search": el buscador de Apple (cápsula) y la × del navegador para borrar */}
            <TextField type="search" placeholder={t('inputs.adornments.searchPlaceholder')} sx={{width: FIELD_WIDTH}}
                       slotProps={{input: {startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>}}} />
            <TextField label={t('samples.amount')} sx={{width: FIELD_WIDTH}}
                       slotProps={{input: {startAdornment: <InputAdornment position="start">$</InputAdornment>}}} />
            <TextField label={t('samples.weight')} sx={{width: FIELD_WIDTH}}
                       slotProps={{input: {endAdornment: <InputAdornment position="end">kg</InputAdornment>}}} />
        </Stack>
    );
};

export default TextFieldAdornments;
