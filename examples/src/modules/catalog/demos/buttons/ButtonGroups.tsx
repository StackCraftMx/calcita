import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const BUTTON_VARIANTS = ['contained', 'outlined', 'text'] as const;

const ButtonGroups = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={3} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'flex-start'}}>
            <Stack spacing={2}>
                {BUTTON_VARIANTS.map((variant) => (
                    <ButtonGroup key={variant} variant={variant} aria-label={t('buttons.group.ariaLabel')}>
                        <Button>{t('samples.previous')}</Button>
                        <Button>{t('samples.today')}</Button>
                        <Button>{t('samples.next')}</Button>
                    </ButtonGroup>
                ))}
            </Stack>
            <ButtonGroup orientation="vertical" aria-label={t('buttons.group.ariaLabel')}>
                <Button>{t('samples.edit')}</Button>
                <Button>{t('samples.share')}</Button>
                <Button>{t('samples.delete')}</Button>
            </ButtonGroup>
        </Stack>
    );
};

export default ButtonGroups;
