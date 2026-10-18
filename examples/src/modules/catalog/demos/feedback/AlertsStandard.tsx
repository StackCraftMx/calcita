import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const SEVERITIES = ['success', 'info', 'warning', 'error'] as const;

// el de omisión: material teñido de su tipo dentro del contenido. Siempre con su ícono, para no decirlo solo con el color
const AlertsStandard = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack spacing={1.5}>
            {SEVERITIES.map((severity) => (
                <Alert key={severity} variant="standard" severity={severity}>{t(`feedback.alerts.samples.${severity}`)}</Alert>
            ))}
        </Stack>
    );
};

export default AlertsStandard;
