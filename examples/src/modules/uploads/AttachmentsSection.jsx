// Varios adjuntos en un solo envío con la zona de FilePond (@stackcraftmx/calcita/filepond): tipos, peso por archivo,
// cuántos y cuánto pesan juntos, y una revisión del contenido al soltarlos (validate). Se suben todos con un botón y la
// misma máquina de subida que el Excel.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import {useMachine} from '@xstate/react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {SectionCard, buildUploadActors, formatFileSize, uploadMachine, useToolkitTranslation} from '@stackcraftmx/calcita';
import {FileDropzone} from '@stackcraftmx/calcita/filepond';

import {UploadStatus} from '@/modules/uploads/UploadStatus.jsx';
import {uploadAttachments} from '@/modules/uploads/uploadsApi.js';

const ATTACHMENTS_MACHINE = uploadMachine.provide({actors: buildUploadActors(uploadAttachments)});
// los límites de los adjuntos: por archivo, cuántos y entre todos
const ATTACHMENT_MAX_SIZE = '2 MB';
const ATTACHMENT_MAX_FILES = 5;
const ATTACHMENTS_MAX_TOTAL_SIZE = '5 MB';
const ATTACHMENT_TYPES = ['pdf', 'image'];

export const AttachmentsSection = () => {
    const {t} = useToolkitTranslation('uploads');
    const [files, setFiles] = useState([]);
    const [snapshot, send] = useMachine(ATTACHMENTS_MACHINE);
    const isUploading = snapshot.matches('uploading');

    const chooseFiles = (nextFiles) => {
        setFiles(nextFiles);
        send({type: 'RESET'});
    };

    // la revisión del contenido: un archivo vacío no entra a la lista (true = entra; texto = por qué no)
    const validateContent = async (file) => (file.size > 0 ? true : t('attachments.emptyFile'));

    return (
        <SectionCard title={t('attachments.title')}>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('attachments.text')}</Typography>
            <FileDropzone
                multiple
                value={files}
                onChange={chooseFiles}
                accept={ATTACHMENT_TYPES}
                maxSize={ATTACHMENT_MAX_SIZE}
                maxFiles={ATTACHMENT_MAX_FILES}
                maxTotalSize={ATTACHMENTS_MAX_TOTAL_SIZE}
                validate={validateContent}
                busy={isUploading}
                actions={(
                    <Button variant="contained" disabled={files.length === 0 || isUploading}
                            onClick={() => send({type: 'UPLOAD', input: {files}})}>
                        {t('attachments.submit')}
                    </Button>
                )}
            >
                <UploadStatus
                    snapshot={snapshot}
                    onCancel={() => send({type: 'CANCEL'})}
                    describeResult={(result) => t('attachments.done', {count: result.count, size: formatFileSize(result.totalBytes)})}
                />
            </FileDropzone>
        </SectionCard>
    );
};
