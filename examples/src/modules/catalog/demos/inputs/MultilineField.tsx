import TextField from '@mui/material/TextField';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// crece con lo que se escribe a partir de tres renglones
const MultilineField = () => {
    const {t} = useToolkitTranslation('catalog');
    return <TextField label={t('samples.notes')} multiline minRows={3} fullWidth />;
};

export default MultilineField;
