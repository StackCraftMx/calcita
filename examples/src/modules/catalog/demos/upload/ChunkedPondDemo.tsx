// Por trozos: el archivo sube en pedazos de 1 MB, uno detrás de otro, con el protocolo de trozos de FilePond (un POST da el
// folio, cada trozo va en su PATCH y un HEAD dice hasta dónde llegó para retomar). La barra es honesta: cuenta lo que el
// servidor ya guardó y no dice 100 % hasta que guardó el último trozo. Un trozo que falla por la red o con 5xx se reintenta
// solo; un 4xx es el servidor diciendo que no y se enseña en seguida, con su mensaje (toProblem lee el error de Laravel).
import {useRef, useState} from 'react';
import Button from '@mui/material/Button';
import {FileDropzone, createPondServer} from '@stackcraftmx/calcita/filepond';

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
// 1. El «server» de la casa: a dónde va el folio, a dónde cada trozo y cómo leer el error de su backend
const backupServer = createPondServer({
    url: '/api/backups',
    patchUrl: '/api/backups?patch=',
    // los datos de la pantalla viajan en un header, como texto normal (por trozos van en UTF-8: no se convierten a mano)
    headers: {'X-Upload-Context': JSON.stringify({branch: 'Querétaro'})},
    // un backend que contesta {message, errors}: la tarjeta enseña el title
    toProblem: (body: {message?: string, errors?: Record<string, string[]>}) => {
        const reason = Object.values(body.errors ?? {}).flat()[0] ?? body.message;
        return {title: reason, detail: reason, errors: body.errors};
    },
    sendRequest: fakeServer,
});

const ChunkedPondDemo = () => {
    const pondApi = useRef<{processFiles: () => Promise<unknown>} | null>(null);
    const [file, setFile] = useState<File | null>(null);

    return (
        <FileDropzone
            value={file}
            onChange={(chosen) => setFile(chosen as File | null)}
            server={backupServer}
            // 2. Por trozos, con los nombres de FilePond: todo en pedazos de 1 MB y dos reintentos por trozo
            chunkUploads
            chunkForce
            chunkSize="1 MB"
            chunkRetryDelays={[500, 1000]}
            // 3. Cualquier otra opción de FilePond, tal cual
            pondProps={{maxParallelUploads: 1}}
            apiRef={pondApi}
            actions={(
                // 4. Sube al oprimir el botón; processFiles() falla si no subió y el porqué ya está en la tarjeta
                <Button variant="contained" disabled={!file} onClick={() => pondApi.current?.processFiles().catch(() => undefined)}>
                    Subir el respaldo
                </Button>
            )}
        />
    );
};

export default ChunkedPondDemo;
