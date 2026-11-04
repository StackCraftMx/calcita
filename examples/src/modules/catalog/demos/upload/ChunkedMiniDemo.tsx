// El cargador mini por trozos: cada renglón SUBE su archivo en cuanto se elige, en pedazos de 1 MB, con sus estados de siempre
// (Por cargar, Subiendo 40 %, Procesando, Cargado, No se cargó). createChunkedUpload arma la función upload del renglón con el
// protocolo de trozos de FilePond: el folio con un POST, cada trozo en su PATCH, y retomar con un HEAD. Con el último byte
// enviado la barra llega a 100 % y el renglón dice «Procesando» hasta que el servidor guardó el último trozo. Al renglón llega
// el folio como id.
import {useState} from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {FILE_UPLOAD_STATUS, FileUploadInput, FormSection, createChunkedUpload} from '@stackcraftmx/calcita';

// ─── El servidor de mentira (en su proyecto NO va: es su backend, y sendRequest se quita) ───
// Espera medio segundo después de guardar cada trozo, como algunos servidores de verdad; no acepta más de 20 MB.
const MAX_BYTES = 20_000_000;
const stored = new Map<string, number>();
const wait = (milliseconds: number, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('La subida se canceló', 'AbortError'));
    }, {once: true});
});
const fakeServer = async (url: string, body: FormData | Blob | null, {method, headers, signal, onProgress}: {
    method: string, headers: Record<string, string>, signal: AbortSignal,
    onProgress?: (percent: number, transfer: {loaded: number, total: number}) => void,
}) => {
    const folio = new URL(url, 'https://ejemplo.invalid').searchParams.get('patch') ?? '';
    if (method === 'POST') {
        if (Number(headers['Upload-Length']) > MAX_BYTES) {
            const laravelError = {message: 'Los datos no son válidos.', errors: {file: ['El archivo no puede pasar de 20 MB.']}};
            return new Response(JSON.stringify(laravelError), {status: 422, headers: {'Content-Type': 'application/json'}});
        }
        const newFolio = `folio-${stored.size + 1}`;
        stored.set(newFolio, 0);
        return new Response(newFolio, {status: 200});
    }
    if (method === 'HEAD') {
        return new Response(null, {status: 200, headers: {'Upload-Offset': String(stored.get(folio) ?? 0)}});
    }
    const size = body instanceof Blob ? body.size : 0;
    await wait(200, signal);
    onProgress?.(100, {loaded: size, total: size});
    await wait(500, signal);
    stored.set(folio, Number(headers['Upload-Offset']) + size);
    return new Response(null, {status: 204});
};

// ─── Lo que sí va en su proyecto ───
// 1. La subida por trozos: a dónde va el folio, a dónde cada trozo, el tamaño del trozo y cómo leer el error de su backend
const uploadInPieces = createChunkedUpload({
    url: '/api/backups',
    patchUrl: '/api/backups?patch=',
    chunkSize: '1 MB',
    chunkRetryDelays: [500, 1000],
    // un backend que contesta {message, errors}: los errores por campo ya los lee el renglón; title y detail, para lo demás
    toProblem: (body: {message?: string, errors?: Record<string, string[]>}) => {
        const reason = Object.values(body.errors ?? {}).flat()[0] ?? body.message;
        return {title: reason, detail: reason, errors: body.errors};
    },
    sendRequest: fakeServer,
});

// 2. Los archivos que se piden (en su proyecto salen del API)
const BACKUPS = [
    {key: 'database', label: 'Respaldo de la base'},
    {key: 'monthLog', label: 'Bitácora del mes'},
];

const ChunkedMiniDemo = () => {
    const [fileIds, setFileIds] = useState<Record<string, string>>({});
    const [statuses, setStatuses] = useState<Record<string, string>>({});
    const uploadedCount = BACKUPS.filter(({key}) => statuses[key] === FILE_UPLOAD_STATUS.uploaded).length;

    return (
        <Stack spacing={1.5} sx={{maxWidth: 720}}>
            <Typography variant="body2" color="text.secondary">{uploadedCount} de {BACKUPS.length} cargados</Typography>
            {/* 3. Un renglón por archivo, con la subida por trozos como su upload */}
            <FormSection>
                {BACKUPS.map(({key, label}) => (
                    <FileUploadInput
                        key={key}
                        label={label}
                        value={fileIds[key] ?? ''}
                        onChange={(fileId) => setFileIds((current) => ({...current, [key]: fileId}))}
                        upload={uploadInPieces}
                        maxSize="20 MB"
                        limitsText="Hasta 20 MB, en trozos de 1 MB"
                        onStatusChange={(status) => setStatuses((current) => ({...current, [key]: status}))}
                    />
                ))}
            </FormSection>
            <Typography variant="body2" color="text.secondary">Viaja: «{JSON.stringify(fileIds)}»</Typography>
        </Stack>
    );
};

export default ChunkedMiniDemo;
