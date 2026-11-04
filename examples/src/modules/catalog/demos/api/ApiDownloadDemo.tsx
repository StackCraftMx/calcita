import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import DownloadIcon from '@mui/icons-material/Download';
import {createApiClient, startDownload, useToolkitTranslation} from '@stackcraftmx/calcita';

// ─── El servidor de mentira (en su proyecto NO va): un CSV con su nombre en Content-Disposition ───
const SAMPLE_CSV = 'folio,cliente,total\nP-2375,Luis Herrera,9800.00\nP-2381,Bruno Díaz,689.90\n';
const fakeServerFetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (String(url).endsWith('/orders/export')) {
        return new Response(SAMPLE_CSV, {
            headers: {'content-type': 'text/csv', 'content-disposition': 'attachment; filename="pedidos.csv"'},
        });
    }
    // la plantilla se arma con lo que manda la pantalla en el cuerpo: solo con POST
    if (String(url).endsWith('/documents/template') && init?.method === 'POST') {
        const {company} = JSON.parse(String(init.body));
        const template = `documento,empresa,cargado\nIdentificación oficial,${company},no\nActa constitutiva,${company},no\n`;
        return new Response(template, {
            headers: {'content-type': 'text/csv', 'content-disposition': 'attachment; filename="plantilla-documentos.csv"'},
        });
    }
    return Response.json({title: 'No existe', detail: 'No hay reporte con ese nombre.'}, {status: 404});
};

const api = createApiClient({baseUrl: '/api', fetch: fakeServerFetch});

// La descarga va al panel de descargas (DownloadManager, montado una vez en la app): avance, cancelar y el error del
// servidor ya traducido. api.download trae el archivo y el nombre que mandó el servidor.
const ApiDownloadDemo = () => {
    // startDownload: el nombre que se ve en el panel, su formato y cómo pedir el archivo (con su avance y su cancelar)
    const {t} = useToolkitTranslation('catalog');

    const downloadReport = (path: string) => startDownload({
        label: t('api.download.label'),
        format: 'csv',
        request: ({signal, onDownloadProgress}) => api.download(path, {signal, onDownloadProgress, fallbackFileName: 'reporte.csv'}),
    });

    // un archivo que el servidor arma con datos de la pantalla: POST con su cuerpo; el avance, el nombre y la revisión del
    // Excel son los mismos
    const downloadTemplate = () => startDownload({
        label: t('api.download.postLabel'),
        format: 'csv',
        request: ({signal, onDownloadProgress}) => api.download('/documents/template', {
            method: 'POST', body: {company: 'Ferretería del Norte'}, signal, onDownloadProgress, fallbackFileName: 'plantilla.csv',
        }),
    });

    return (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap'}}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadReport('/orders/export')}>{t('api.download.ok')}</Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadTemplate}>{t('api.download.post')}</Button>
            <Button variant="outlined" color="error" startIcon={<DownloadIcon />} onClick={() => downloadReport('/reports/missing')}>
                {t('api.download.failing')}
            </Button>
        </Stack>
    );
};

export default ApiDownloadDemo;
