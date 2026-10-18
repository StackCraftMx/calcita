// El panel de descargas (DownloadManager): startDownload manda el archivo al panel y regresa en seguida; la persona sigue
// trabajando mientras baja. El panel es el ÚNICO que avisa: el avance, cuando terminó (el archivo se guarda solo) y, si
// falló, el motivo que mandó el servidor. Se puede cancelar desde el panel.
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import DownloadIcon from '@mui/icons-material/Download';
import {ApiError, startDownload} from '@stackcraftmx/calcita';

// ─── El servidor de mentira (en su proyecto NO va: ahí la descarga la trae apiClient.download) ───
const CHUNKS = 20;
const CHUNK_BYTES = 50_000;
const CHUNK_MILLISECONDS = 200;

interface TransferOptions {
    signal: AbortSignal;
    onDownloadProgress: (progress: {loaded: number, total?: number | null}) => void;
}

// un archivo que llega en 20 pedazos (4 s): avisa su avance y se corta si la persona cancela
const slowFile = (fileName: string) => async ({signal, onDownloadProgress}: TransferOptions) => {
    for (let chunk = 1; chunk <= CHUNKS; chunk += 1) {
        await new Promise((resolve) => setTimeout(resolve, CHUNK_MILLISECONDS));
        signal.throwIfAborted();
        onDownloadProgress({loaded: chunk * CHUNK_BYTES, total: CHUNKS * CHUNK_BYTES});
    }
    return {blob: new Blob(['folio,cliente,total\nP-2375,Luis Herrera,9800.00\n'], {type: 'text/csv'}), fileName};
};

// uno que el servidor no puede armar: el panel enseña su motivo (el detail de RFC 9457)
const failingFile = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    throw new ApiError({status: 503, problem: {title: 'Reporte no disponible', detail: 'El estado de cuenta de octubre todavía no se cierra.'}});
};

const DownloadPanelDemo = () => (
    <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap'}}>
        <Button variant="outlined" startIcon={<DownloadIcon />}
                onClick={() => startDownload({label: 'Pedidos de octubre', format: 'csv', request: slowFile('pedidos-octubre.csv')})}>
            Con avance
        </Button>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => {
            ['enero', 'febrero', 'marzo'].forEach((month) => startDownload({label: `Ventas de ${month}`, format: 'xlsx', request: slowFile(`ventas-${month}.csv`)}));
        }}>
            Tres a la vez
        </Button>
        <Button variant="outlined" color="error" startIcon={<DownloadIcon />}
                onClick={() => startDownload({label: 'Estado de cuenta de octubre', format: 'pdf', request: failingFile})}>
            Una que falla
        </Button>
    </Stack>
);

export default DownloadPanelDemo;
