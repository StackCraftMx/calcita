// Hecho en Calcita · subir archivos: FileDropzone revisa tipo y peso antes de subir y uploadWithProgress lo manda con
// su avance.
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import UploadDemo from '@/modules/catalog/demos/upload/UploadDemo.tsx';

const loadDemo = () => import('@/modules/catalog/demos/upload/UploadDemo.tsx?demo-source');
const loadApi = () => import('@/modules/catalog/demos/upload/UploadToApi.ts?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (uploads.<sección>.extend.<id>)
const ZONE_EXTENSIONS = [
    {id: 'accept', option: 'accept', example: "accept={['excel', 'csv']}  ·  accept={['pdf', '.dat']}"},
    {id: 'maxSize', option: 'maxSize', example: 'maxSize="5 MB"'},
    {id: 'texts', option: 'hint · buttonLabel', example: 'hint="Arrastre aquí el inventario" buttonLabel="Elegir el Excel"'},
    {id: 'busy', option: 'busy', example: 'busy={isUploading}'},
    {id: 'busyModal', option: 'busyModal', example: "busyModal={{title: 'Subiendo el inventario', text: 'No cierre la página.'}}"},
    {id: 'onReject', option: 'onReject', example: 'onReject={(file, reason) => logRejection(file.name, reason)}'},
    {id: 'slots', option: 'actions · children', example: 'actions={<Button>Descargar la plantilla</Button>}'},
    {id: 'zoneSx', option: 'sx', example: 'sx={{minHeight: 220}}'},
    {id: 'several', option: "FileDropzone de '/filepond' (multiple · maxFiles · maxTotalSize)", example: '<FileDropzone multiple maxFiles={10} maxTotalSize="50 MB" … />'},
];
const API_EXTENSIONS = [
    {id: 'upload', option: 'uploadWithProgress(url, formData, {onProgress})', example: "uploadWithProgress('/api/inventory/imports', formData, {onProgress: setPercent})"},
    {id: 'signal', option: 'signal', example: '{onProgress, signal: controller.signal}'},
    {id: 'headers', option: 'headers · withCredentials', example: '{headers: {Authorization: `Bearer ${token}`}, withCredentials: true}'},
    {id: 'problem', option: 'ApiError', example: 'throw new ApiError({status: response.status, problem: body})'},
    {id: 'pondServer', option: 'createPondServer({url, headers})', example: "server={createPondServer({url: '/api/attachments'})}"},
];

export const FileUploadsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `uploads.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('uploads.title')} description={t('uploads.description')} />
            <DemoSection title={t('uploads.demo.title')} description={t('uploads.demo.description')}
                         extensions={rowsOf('demo', ZONE_EXTENSIONS)} Demo={UploadDemo} loadSource={loadDemo} />
            <CodeSection title={t('uploads.api.title')} description={t('uploads.api.description')}
                         extensions={rowsOf('api', API_EXTENSIONS)} loadSource={loadApi} />
        </Stack>
    );
};
