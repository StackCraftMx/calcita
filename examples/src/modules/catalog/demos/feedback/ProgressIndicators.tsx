import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// valores de ejemplo (por ciento). Apple prefiere el que dice cuánto falta sobre el que solo gira
const SAMPLE_PROGRESS = 60;
const SAMPLE_BUFFER = 80;
const SAMPLE_CIRCLE_PROGRESS = 75;
const BAR_WIDTH = 320;

const ProgressIndicators = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack spacing={3} sx={{maxWidth: BAR_WIDTH}}>
            <Box>
                <LinearProgress variant="determinate" value={SAMPLE_PROGRESS} aria-label={t('feedback.progress.uploading')} />
                <Typography variant="caption" color="text.secondary">{t('feedback.progress.uploadedOf', {percent: SAMPLE_PROGRESS})}</Typography>
            </Box>
            <LinearProgress aria-label={t('feedback.progress.loading')} />
            <LinearProgress variant="buffer" value={SAMPLE_PROGRESS} valueBuffer={SAMPLE_BUFFER} aria-label={t('feedback.progress.playing')} />
            <Stack direction="row" spacing={3} sx={{alignItems: 'center'}}>
                {/* el círculo con su número adentro */}
                <Box sx={{position: 'relative', display: 'inline-flex'}}>
                    <CircularProgress variant="determinate" value={SAMPLE_CIRCLE_PROGRESS} aria-label={t('feedback.progress.uploading')} />
                    <Box sx={{inset: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Typography variant="caption" color="text.secondary">{`${SAMPLE_CIRCLE_PROGRESS}%`}</Typography>
                    </Box>
                </Box>
                <CircularProgress aria-label={t('feedback.progress.loading')} />
                <CircularProgress size={20} aria-label={t('feedback.progress.loading')} />
            </Stack>
        </Stack>
    );
};

export default ProgressIndicators;
