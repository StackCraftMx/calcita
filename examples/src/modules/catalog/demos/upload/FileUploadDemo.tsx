// El cargador mini: cada documento se SUBE en cuanto se elige, en su renglón, con su estado (Por cargar, Subiendo 40 %,
// Procesando, Cargado, No se cargó), «Cargar» que ya cargado dice «Sustituir», bajar y quitar. Abajo, el avance en
// palabras o el motivo del error. A cada renglón llega solo el id que da el servidor; onStatusChange dice en qué va cada
// uno (para «2 de 3 cargados») y `actions` pone lo del negocio junto al estado.
import {useState} from 'react';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {FILE_UPLOAD_STATUS, FileUploadInput, FormSection} from '@stackcraftmx/calcita';

// ─── El servidor de mentira (en su proyecto NO va: es su POST /documents con uploadWithProgress o axios) ───
const BYTES_PER_SECOND = 300_000;
const uploadDocument = async (file: File, {signal, onUploadProgress}: {signal: AbortSignal, onUploadProgress: (transfer: {loaded: number, total: number}) => void}) => {
    const steps = Math.max(6, Math.round(file.size / BYTES_PER_SECOND) * 4);
    for (let step = 1; step <= steps; step += 1) {
        await new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, 250);
            signal.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(new DOMException('La subida se canceló', 'AbortError'));
            }, {once: true});
        });
        onUploadProgress({loaded: Math.round((file.size * step) / steps), total: file.size});
    }
    // lo que solo ve el servidor: un archivo vacío no sirve
    if (file.size === 0) {
        throw Object.assign(new Error('Vacío'), {problem: {detail: 'El archivo está vacío.'}});
    }
    return {id: `document-${file.name}`};
};

// 1. Los documentos que se piden (en su proyecto salen del API, con lo que acepta cada uno)
const DOCUMENTS = [
    {key: 'identification', label: 'Identificación oficial', accept: ['pdf', 'image']},
    {key: 'addressProof', label: 'Comprobante de domicilio', accept: ['pdf']},
    {key: 'taxCertificate', label: 'Constancia de situación fiscal', accept: ['pdf']},
];

const FileUploadDemo = () => {
    const [fileIds, setFileIds] = useState<Record<string, string>>({});
    const [statuses, setStatuses] = useState<Record<string, string>>({});
    const uploadedCount = DOCUMENTS.filter(({key}) => statuses[key] === FILE_UPLOAD_STATUS.uploaded).length;

    return (
        <Stack spacing={1.5} sx={{maxWidth: 720}}>
            {/* 2. Cuántos van: sale de onStatusChange de cada renglón */}
            <LinearProgress variant="determinate" value={(uploadedCount / DOCUMENTS.length) * 100} aria-label="Documentos cargados" />
            <Typography variant="body2" color="text.secondary">{uploadedCount} de {DOCUMENTS.length} cargados</Typography>
            {/* 3. Un renglón por documento: la etiqueta a la izquierda y el cargador mini a la derecha */}
            <FormSection>
                {DOCUMENTS.map(({key, label, accept}) => (
                    <FileUploadInput
                        key={key}
                        label={label}
                        value={fileIds[key] ?? ''}
                        onChange={(fileId) => setFileIds((current) => ({...current, [key]: fileId}))}
                        upload={uploadDocument}
                        accept={accept}
                        maxSize="5 MB"
                        limitsText={accept.includes('image') ? 'PDF o foto, hasta 5 MB' : 'PDF, hasta 5 MB'}
                        onStatusChange={(status) => setStatuses((current) => ({...current, [key]: status}))}
                        // 4. Lo del negocio junto al estado (en su proyecto, lo que diga su revisión)
                        actions={key === 'identification' && fileIds[key] ? <Chip size="small" color="success" label="Aprobado" /> : null}
                    />
                ))}
            </FormSection>
            <Typography variant="body2" color="text.secondary">Viaja: «{JSON.stringify(fileIds)}»</Typography>
        </Stack>
    );
};

export default FileUploadDemo;
