import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const ICON_BUTTON_COLORS = ['default', 'primary', 'error'] as const;
const ICON_BUTTON_SIZES = ['small', 'medium', 'large'] as const;

// sin texto a la vista: el globo y el aria-label dicen qué hace, para quien no reconoce el ícono y para el lector de pantalla
const IconButtons = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack spacing={2}>
            {ICON_BUTTON_COLORS.map((color) => (
                <Stack key={color} direction="row" spacing={1} sx={{alignItems: 'center'}}>
                    <Tooltip title={t('samples.edit')}>
                        <IconButton color={color} aria-label={t('samples.edit')}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title={t('samples.share')}>
                        <IconButton color={color} aria-label={t('samples.share')}><ShareIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title={t('samples.delete')}>
                        <IconButton color={color} aria-label={t('samples.delete')}><DeleteOutlineIcon /></IconButton>
                    </Tooltip>
                </Stack>
            ))}
            <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                {ICON_BUTTON_SIZES.map((size) => (
                    <Tooltip key={size} title={t(`sizes.${size}`)}>
                        <IconButton size={size} aria-label={t('samples.edit')}><EditIcon fontSize="inherit" /></IconButton>
                    </Tooltip>
                ))}
            </Stack>
        </Stack>
    );
};

export default IconButtons;
