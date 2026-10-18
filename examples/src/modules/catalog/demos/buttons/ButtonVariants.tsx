import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// relleno para la acción principal, con borde para lo secundario y solo texto para lo de menor peso
const ButtonVariants = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
            <Button variant="contained">{t('variants.contained')}</Button>
            <Button variant="outlined">{t('variants.outlined')}</Button>
            <Button variant="text">{t('variants.text')}</Button>
        </Stack>
    );
};

export default ButtonVariants;
