import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const SEVERITIES = ['success', 'info', 'warning', 'error'] as const;

// con borde: para un aviso que no debe pesar tanto como el contenido. Siempre con su ícono, para no decirlo solo con el color
const AlertsOutlined = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack spacing={1.5}>
            {SEVERITIES.map((severity) => (
                <Alert key={severity} variant="outlined" severity={severity}>{t(`feedback.alerts.samples.${severity}`)}</Alert>
            ))}
        </Stack>
    );
};

export default AlertsOutlined;
