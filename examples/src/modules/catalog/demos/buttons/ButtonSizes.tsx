import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const BUTTON_SIZES = ['small', 'medium', 'large'] as const;

const ButtonSizes = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack spacing={2}>
            {BUTTON_SIZES.map((size) => (
                <Stack key={size} direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
                    <Button variant="contained" size={size}>{t(`sizes.${size}`)}</Button>
                    <Button variant="outlined" size={size}>{t('samples.cancel')}</Button>
                </Stack>
            ))}
        </Stack>
    );
};

export default ButtonSizes;
