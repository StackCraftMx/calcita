// Un respaldo grande, por trozos: la zona de FilePond con el «server» de la casa sube el archivo en trozos de 1 MB, uno detrás
// de otro, con la barra honesta (no dice 100 % hasta que el servidor guardó el último trozo). Debajo, lo mismo en renglones
// con el cargador mini (sube en cuanto se elige, con sus estados; «Procesando» mientras el servidor guarda el último trozo).
// Abajo, lo que va recibiendo el servidor de mentira: el folio, cada trozo, la caída del tercero y su reintento.
//
// Sube cuando la persona oprime el botón (apiRef.current.processFiles()), nunca sola al soltar: regla de la casa.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useRef, useState} from 'react';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import {FileUploadInput, FormSection, SectionCard, formatFileSize, useToolkitTranslation} from '@stackcraftmx/calcita';
import {FileDropzone} from '@stackcraftmx/calcita/filepond';

import {BACKUP_MAX_BYTES, BACKUP_SERVER_EVENT, backupPondServer, subscribeToBackupServer, uploadBackupInPieces} from '@/modules/uploads/uploadsApi.js';

// el trozo que pide el servidor y las esperas antes de reintentar uno que falló
const BACKUP_CHUNK_SIZE = '1 MB';
const BACKUP_RETRY_DELAYS = [500, 1000];
// cuántos renglones del registro se quedan a la vista
const LOG_LIMIT = 12;
// los renglones del cargador mini (sus etiquetas, en uploadsTexts: chunked.rows.<llave>)
const BACKUP_ROWS = ['database', 'monthLog'];

/**
 * El renglón del registro de un aviso del servidor.
 *
 * @param {object} event
 * @param {(key: string, values?: object) => string} t
 * @returns {string}
 */
const logLineOf = (event, t) => {
    switch (event.type) {
        case BACKUP_SERVER_EVENT.folio:
            return t('chunked.folio', {folio: event.folio, size: formatFileSize(event.totalBytes)});
        case BACKUP_SERVER_EVENT.piece:
            return t('chunked.piece', {from: formatFileSize(event.offset), stored: formatFileSize(event.storedBytes), total: formatFileSize(event.totalBytes)});
        case BACKUP_SERVER_EVENT.failed:
            return t('chunked.failed', {from: formatFileSize(event.offset)});
        case BACKUP_SERVER_EVENT.stored:
            return t('chunked.stored', {fileName: event.fileName, size: formatFileSize(event.totalBytes)});
        default:
            return t('chunked.rejected', {message: event.message});
    }
};

export const ChunkedBackupSection = () => {
    const {t} = useToolkitTranslation('uploads');
    const pondApi = useRef(null);
    const [file, setFile] = useState(null);
    const [rowFileIds, setRowFileIds] = useState({});
    const [serverLog, setServerLog] = useState([]);
    // el número de cada aviso: la llave de su renglón (la lista se corta y las posiciones se repiten)
    const eventCounter = useRef(0);

    // lo que avisa el servidor de mentira, lo más nuevo arriba
    useEffect(() => subscribeToBackupServer((event) => {
        eventCounter.current += 1;
        const numbered = {...event, id: eventCounter.current};
        setServerLog((previous) => [numbered, ...previous].slice(0, LOG_LIMIT));
    }), []);

    // processFiles() falla si el archivo no subió; el porqué ya se ve en su tarjeta: aquí solo se atrapa
    const uploadBackup = () => pondApi.current?.processFiles().catch(() => undefined);

    return (
        <SectionCard title={t('chunked.title')}>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                {t('chunked.text', {max: formatFileSize(BACKUP_MAX_BYTES)})}
            </Typography>
            <FileDropzone
                value={file}
                onChange={setFile}
                server={backupPondServer}
                chunkUploads
                chunkForce
                chunkSize={BACKUP_CHUNK_SIZE}
                chunkRetryDelays={BACKUP_RETRY_DELAYS}
                apiRef={pondApi}
                actions={(
                    <Button variant="contained" disabled={!file} onClick={uploadBackup}>
                        {t('chunked.submit')}
                    </Button>
                )}
            >
                <Typography variant="subtitle2" component="h3">{t('chunked.rowsTitle')}</Typography>
                <FormSection>
                    {BACKUP_ROWS.map((rowKey) => (
                        <FileUploadInput
                            key={rowKey}
                            label={t(`chunked.rows.${rowKey}`)}
                            value={rowFileIds[rowKey] ?? ''}
                            onChange={(fileId) => setRowFileIds((current) => ({...current, [rowKey]: fileId}))}
                            upload={uploadBackupInPieces}
                            limitsText={t('chunked.rowsLimits')}
                        />
                    ))}
                </FormSection>
                <Typography variant="subtitle2" component="h3" sx={{mt: 2}}>{t('chunked.logTitle')}</Typography>
                {serverLog.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">{t('chunked.logEmpty')}</Typography>
                ) : (
                    <List dense role="log" aria-label={t('chunked.logTitle')}>
                        {serverLog.map((event) => (
                            <ListItem key={event.id} disableGutters>
                                <ListItemText primary={logLineOf(event, t)} />
                            </ListItem>
                        ))}
                    </List>
                )}
            </FileDropzone>
        </SectionCard>
    );
};
