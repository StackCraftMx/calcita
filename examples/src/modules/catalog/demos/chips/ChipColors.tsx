import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// el color no va solo: siempre con su texto
const CHIP_COLORS = ['default', 'primary', 'secondary', 'success', 'error', 'warning', 'info'] as const;
const CHIP_VARIANTS = ['filled', 'outlined'] as const;

const ChipColors = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack spacing={2}>
            {CHIP_VARIANTS.map((variant) => (
                <Stack key={variant} direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
                    {CHIP_COLORS.map((color) => <Chip key={color} label={t(`colors.${color}`)} color={color} variant={variant} />)}
                </Stack>
            ))}
        </Stack>
    );
};

export default ChipColors;
