import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const BOX_WIDTH = 220;

const DividerKinds = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={4} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
            <Box sx={{width: BOX_WIDTH}}>
                <Typography variant="body2">{t('surfaces.dividers.above')}</Typography>
                <Divider sx={{my: 1}} />
                <Typography variant="body2">{t('surfaces.dividers.below')}</Typography>
            </Box>
            <Box sx={{width: BOX_WIDTH}}>
                <Divider>{t('surfaces.dividers.or')}</Divider>
            </Box>
            <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                <Typography variant="body2">{t('samples.edit')}</Typography>
                <Typography variant="body2">{t('samples.share')}</Typography>
                <Typography variant="body2">{t('samples.delete')}</Typography>
            </Stack>
        </Stack>
    );
};

export default DividerKinds;
