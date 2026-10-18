import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {toastError, useToolkitTranslation} from '@stackcraftmx/calcita';

// Un mensaje que llegó del servidor con HTML adentro (lo escribió alguien en un campo y el servidor lo regresó tal cual).
// Si se pintara como HTML, el onerror correría el código de quien lo escribió: eso es un XSS.
const MALICIOUS_MESSAGE = 'Pedido guardado <img src="x" onerror="alert(\'te robé la sesión\')">';

// React pinta el texto como TEXTO: los < y > se ven, no se ejecutan. Lo mismo hacen los avisos del framework (toast parte
// los renglones en nodos, sin dangerouslySetInnerHTML). La regla: nunca dangerouslySetInnerHTML con algo que no escribió
// el equipo.
const EscapedServerMessage = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack spacing={2} sx={{alignItems: 'flex-start'}}>
            <Alert severity="info" sx={{width: '100%'}}>{MALICIOUS_MESSAGE}</Alert>
            <Button variant="outlined" onClick={() => toastError(MALICIOUS_MESSAGE)}>{t('security.escaped.showToast')}</Button>
        </Stack>
    );
};

export default EscapedServerMessage;
