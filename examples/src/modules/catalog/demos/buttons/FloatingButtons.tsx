import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const FAB_SIZES = ['small', 'medium', 'large'] as const;

// la acción más importante de la pantalla, flotando encima del contenido
const FloatingButtons = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
            <Fab color="primary" aria-label={t('samples.add')}><AddIcon /></Fab>
            <Fab aria-label={t('samples.edit')}><EditIcon /></Fab>
            <Fab variant="extended" color="primary"><AddIcon sx={{mr: 1}} />{t('samples.newOrder')}</Fab>
            {FAB_SIZES.map((size) => (
                <Fab key={size} size={size} color="secondary" aria-label={t('samples.add')}><AddIcon /></Fab>
            ))}
        </Stack>
    );
};

export default FloatingButtons;
