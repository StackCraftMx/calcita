import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const BUTTON_VARIANTS = ['contained', 'outlined', 'text'] as const;
// el color es información: rojo para lo que borra, verde para lo que confirma
const BUTTON_COLORS = ['primary', 'secondary', 'success', 'error', 'warning', 'info'] as const;

const ButtonColors = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack spacing={2}>
            {BUTTON_VARIANTS.map((variant) => (
                <Stack key={variant} direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
                    {BUTTON_COLORS.map((color) => (
                        <Button key={color} variant={variant} color={color}>{t(`colors.${color}`)}</Button>
                    ))}
                </Stack>
            ))}
        </Stack>
    );
};

export default ButtonColors;
