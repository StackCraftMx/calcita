// Cómo va una subida, a partir de la máquina de subida del paquete (uploadMachine): la barra con su porcentaje mientras
// viaja el archivo, la barra sin porcentaje mientras el servidor procesa, y cómo terminó.
//
// La usan las dos secciones del ejemplo que suben con un botón (la del Excel y la de varios adjuntos).
//
// Lo renderiza la app: arrow (regla de la casa).
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

/**
 * @param {object} props
 * @param {object} props.snapshot el estado de la máquina (useMachine)
 * @param {() => void} props.onCancel cancela la subida (CANCEL)
 * @param {(result: object) => string} props.describeResult el texto de cuando terminó bien, ya traducido
 */
export const UploadStatus = ({snapshot, onCancel, describeResult}) => {
    const {t} = useToolkitTranslation('uploads');
    const {progress, result, problem} = snapshot.context;

    if (snapshot.matches('uploading')) {
        const isSending = snapshot.matches({uploading: 'sending'});
        return (
            <Stack spacing={1}>
                <LinearProgress variant={isSending ? 'determinate' : 'indeterminate'} value={progress ?? 0} />
                <Stack direction="row" sx={{alignItems: 'center', justifyContent: 'space-between'}}>
                    <Typography variant="body2" color="text.secondary" role="status">
                        {isSending ? t('status.sending', {percent: progress ?? 0}) : t('status.processing')}
                    </Typography>
                    <Button size="small" color="inherit" onClick={onCancel}>{t('status.cancel')}</Button>
                </Stack>
            </Stack>
        );
    }
    if (snapshot.matches('done')) {
        return <Alert severity="success">{describeResult(result)}</Alert>;
    }
    if (snapshot.matches('failed')) {
        // el mensaje ya viene traducido del servidor (el detail del problema RFC 9457)
        return <Alert severity="error" role="alert">{problem?.message}</Alert>;
    }
    if (snapshot.matches('cancelled')) {
        return <Alert severity="info">{t('status.cancelled')}</Alert>;
    }
    return null;
};
