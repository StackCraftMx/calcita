import {useState} from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// el que solo informa no lleva vidrio; el que se pica es un control (cápsula de vidrio) y el elegido va de su color
const ChipVariants = () => {
    const {t} = useToolkitTranslation('catalog');
    const [isPicked, setIsPicked] = useState(false);
    const togglePicked = () => setIsPicked((picked) => !picked);

    return (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
            <Chip label={t('chips.variants.infoFilled')} />
            <Chip label={t('chips.variants.infoOutlined')} variant="outlined" />
            <Chip label={t('chips.variants.clickable')} variant="outlined" onClick={togglePicked} />
            <Chip label={t('chips.variants.picked')} color="primary" onClick={togglePicked} />
            {/* se prende y se apaga: aria-pressed le dice al lector de pantalla si está elegido */}
            <Chip label={t('chips.variants.toggle')} color={isPicked ? 'primary' : 'default'} variant={isPicked ? 'filled' : 'outlined'}
                  onClick={togglePicked} aria-pressed={isPicked} />
        </Stack>
    );
};

export default ChipVariants;
