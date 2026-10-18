import {useState} from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const AlertExtras = () => {
    const {t} = useToolkitTranslation('catalog');
    const [isClosableAlertOpen, setIsClosableAlertOpen] = useState(true);

    return (
        <Stack spacing={1.5} sx={{alignItems: 'flex-start', '& > .MuiAlert-root': {width: '100%'}}}>
            <Alert severity="warning">
                <AlertTitle>{t('feedback.alerts.extras.sampleTitle')}</AlertTitle>
                {t('feedback.alerts.extras.sampleText')}
            </Alert>
            {/* la acción a la derecha: lo que se puede hacer con el aviso (deshacer) */}
            <Alert severity="info" action={<Button color="inherit" size="small">{t('samples.undo')}</Button>}>
                {t('feedback.alerts.extras.archived')}
            </Alert>
            {isClosableAlertOpen ? (
                <Alert severity="success" onClose={() => setIsClosableAlertOpen(false)}>{t('feedback.alerts.samples.success')}</Alert>
            ) : (
                <Button variant="outlined" onClick={() => setIsClosableAlertOpen(true)}>{t('feedback.alerts.extras.showAgain')}</Button>
            )}
        </Stack>
    );
};

export default AlertExtras;
