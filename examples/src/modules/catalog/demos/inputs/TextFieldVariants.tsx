import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// el ancho dice cuánto se escribe: el de un nombre (px)
const FIELD_WIDTH = 240;

const TextFieldVariants = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap'}}>
            <TextField variant="outlined" label={t('variants.outlined')} sx={{width: FIELD_WIDTH}} />
            <TextField variant="filled" label={t('variants.filled')} sx={{width: FIELD_WIDTH}} />
            <TextField variant="standard" label={t('variants.standard')} sx={{width: FIELD_WIDTH}} />
        </Stack>
    );
};

export default TextFieldVariants;
