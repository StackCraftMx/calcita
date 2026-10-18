// Los códigos de recuperación, que se enseñan UNA sola vez (el servidor solo guarda su huella, no los códigos).
//
// No se puede cerrar sin marcar «Ya los guardé»: es la única salida que tiene la persona el día que pierda su teléfono,
// y un aviso que se cierra con Esc o con un clic afuera se cierra sin leer. Se pueden copiar todos o bajar en un .txt con
// el nombre de la app, la cuenta y la fecha.
//
//   <RecoveryCodesDialog codes={codes} account={session.email} onClose={() => setCodes(null)} />
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import DownloadIcon from '@mui/icons-material/Download';

import {saveBlob} from '@/files.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import CopyButton from '@/ui/actions/CopyButton.jsx';

const CODE_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/**
 * La fecha de hoy como AAAA-MM-DD, para el nombre y el encabezado del archivo.
 *
 * @returns {string}
 */
function todayText() {
    return new Date().toISOString().slice(0, 10);
}

/**
 * @param {object} props
 * @param {string[]|null} props.codes los códigos recién generados; sin códigos el diálogo está cerrado
 * @param {string} [props.account] la cuenta (normalmente el correo), para el archivo
 * @param {() => void} props.onClose solo se llama después de «Ya los guardé»
 */
export default function RecoveryCodesDialog({codes, account = '', onClose}) {
    const {t} = useToolkitTranslation('security');
    const {appName} = useToolkitSettings();
    const [isSaved, setIsSaved] = useState(false);
    const isOpen = Boolean(codes?.length);

    const download = () => {
        const date = todayText();
        const lines = [
            t('recoveryCodes.fileTitle', {appName}),
            t('recoveryCodes.fileAccount', {account}),
            t('recoveryCodes.fileGenerated', {date}),
            '',
            t('recoveryCodes.fileHowTo'),
            t('recoveryCodes.fileKeepSafe'),
            '',
            ...codes,
            '',
        ];
        saveBlob(new Blob([lines.join('\n')], {type: 'text/plain;charset=utf-8'}), t('recoveryCodes.fileName', {date}));
    };

    const close = () => {
        setIsSaved(false);
        onClose();
    };

    return (
        // ni Esc ni un clic afuera lo cierran: solo «Listo», después de marcar que los guardó
        <Dialog open={isOpen} maxWidth="xs" fullWidth disableEscapeKeyDown onClose={() => {}}>
            <DialogTitle>{t('recoveryCodes.title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <Alert severity="warning">{t('recoveryCodes.warning')}</Alert>
                    <Box component="ol" sx={{
                        m: 0, p: 2, pl: 5, borderRadius: 2, bgcolor: 'action.hover', fontFamily: CODE_FONT, fontSize: 15,
                        columns: 2, columnGap: 4,
                    }}>
                        {(codes ?? []).map((code) => <li key={code}>{code}</li>)}
                    </Box>
                    <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                        <CopyButton value={(codes ?? []).join('\n')} label={t('recoveryCodes.copyAll')} />
                        <Button size="small" startIcon={<DownloadIcon />} onClick={download}>{t('recoveryCodes.download')}</Button>
                    </Stack>
                    <FormControlLabel control={<Checkbox checked={isSaved} onChange={(event) => setIsSaved(event.target.checked)} />}
                                      label={t('recoveryCodes.saved')} />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" disabled={!isSaved} onClick={close}>{t('recoveryCodes.done')}</Button>
            </DialogActions>
        </Dialog>
    );
}
