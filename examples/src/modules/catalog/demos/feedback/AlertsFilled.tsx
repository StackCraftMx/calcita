import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const SEVERITIES = ['success', 'info', 'warning', 'error'] as const;

// relleno: el que más pesa; letra blanca sobre el color oscurecido hasta que se lea. Siempre con su ícono, para no decirlo solo con el color
const AlertsFilled = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack spacing={1.5}>
            {SEVERITIES.map((severity) => (
                <Alert key={severity} variant="filled" severity={severity}>{t(`feedback.alerts.samples.${severity}`)}</Alert>
            ))}
        </Stack>
    );
};

export default AlertsFilled;
