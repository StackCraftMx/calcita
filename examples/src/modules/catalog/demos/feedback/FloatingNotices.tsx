import {useState} from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import {toastError, toastInfo, toastSuccess, toastWarn, useToolkitTranslation} from '@stackcraftmx/calcita';

// cada aviso que flota con su función del framework; se llaman desde cualquier lado, también fuera de un componente
const TOASTS = [
    {severity: 'success', show: toastSuccess},
    {severity: 'info', show: toastInfo},
    {severity: 'warning', show: toastWarn},
    {severity: 'error', show: toastError},
];
// lo que dura el Snackbar a la vista (milisegundos)
const SNACKBAR_HIDE_MILLISECONDS = 5000;

const FloatingNotices = () => {
    const {t} = useToolkitTranslation('catalog');
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

    return (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap'}}>
            {TOASTS.map(({severity, show}) => (
                <Button key={severity} variant="outlined" onClick={() => show(t(`feedback.alerts.samples.${severity}`))}>
                    {t(`feedback.severities.${severity}`)}
                </Button>
            ))}
            <Button variant="outlined" onClick={() => setIsSnackbarOpen(true)}>{t('feedback.toasts.snackbar')}</Button>
            <Snackbar open={isSnackbarOpen} autoHideDuration={SNACKBAR_HIDE_MILLISECONDS} onClose={() => setIsSnackbarOpen(false)}
                      message={t('feedback.alerts.extras.archived')}
                      action={<Button color="inherit" size="small" onClick={() => setIsSnackbarOpen(false)}>{t('samples.undo')}</Button>} />
        </Stack>
    );
};

export default FloatingNotices;
