// Cada adjunto con su barra: la zona de FilePond con server. Los archivos esperan en la lista y se suben cuando la
// persona oprime el botón (apiRef.current.processFiles()); nunca solos al soltarlos, regla de la casa. Cada tarjeta
// enseña su avance y, si el servidor lo rechaza, su error.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useRef, useState} from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {SectionCard, useToolkitTranslation} from '@stackcraftmx/calcita';
import {FileDropzone} from '@stackcraftmx/calcita/filepond';

import {attachmentPondServer} from '@/modules/uploads/uploadsApi.js';

// la pantalla deja elegir hasta 5 MB; el servidor solo acepta hasta 1 MB y lo dice en la tarjeta
const POND_MAX_SIZE = '5 MB';
const POND_MAX_FILES = 5;
const POND_TYPES = ['pdf', 'image'];

export const PondServerSection = () => {
    const {t} = useToolkitTranslation('uploads');
    const pondApi = useRef(null);
    const [files, setFiles] = useState([]);
    const [processed, setProcessed] = useState(null);

    // processFiles() falla si algún archivo no subió; el porqué ya se ve en su tarjeta: aquí solo se atrapa
    const uploadEach = () => pondApi.current?.processFiles().catch(() => undefined);

    return (
        <SectionCard title={t('pond.title')}>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('pond.text')}</Typography>
            <FileDropzone
                multiple
                value={files}
                onChange={setFiles}
                accept={POND_TYPES}
                maxSize={POND_MAX_SIZE}
                maxFiles={POND_MAX_FILES}
                server={attachmentPondServer}
                apiRef={pondApi}
                onProcessProgress={setProcessed}
                actions={(
                    <Button variant="contained" disabled={files.length === 0} onClick={uploadEach}>
                        {t('pond.submit')}
                    </Button>
                )}
            >
                {processed && (
                    <Typography variant="body2" color="text.secondary" role="status" sx={{textAlign: 'center'}}>
                        {t('pond.progress', processed)}
                    </Typography>
                )}
            </FileDropzone>
        </SectionCard>
    );
};
