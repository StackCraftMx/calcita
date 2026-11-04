// Hecho en Calcita · subir archivos: FileDropzone revisa tipo y peso antes de subir y uploadWithProgress lo manda con
// su avance; FileInput (del tamaño de un campo), AttachmentsInput (varios, como en un correo), ImageInput (una foto con su
// vista previa), TemplateDownloadButton (la plantilla), useFilePicker (para armar uno propio) y la subida por trozos de FilePond.
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import AttachmentsDemo from '@/modules/catalog/demos/upload/AttachmentsDemo.tsx';
import ChunkedMiniDemo from '@/modules/catalog/demos/upload/ChunkedMiniDemo.tsx';
import ChunkedPondDemo from '@/modules/catalog/demos/upload/ChunkedPondDemo.tsx';
import FileInputDemo from '@/modules/catalog/demos/upload/FileInputDemo.tsx';
import FileUploadDemo from '@/modules/catalog/demos/upload/FileUploadDemo.tsx';
import ImageInputDemo from '@/modules/catalog/demos/upload/ImageInputDemo.tsx';
import OwnPickerDemo from '@/modules/catalog/demos/upload/OwnPickerDemo.tsx';
import TemplateDemo from '@/modules/catalog/demos/upload/TemplateDemo.tsx';
import UploadDemo from '@/modules/catalog/demos/upload/UploadDemo.tsx';

const loadDemo = () => import('@/modules/catalog/demos/upload/UploadDemo.tsx?demo-source');
const loadApi = () => import('@/modules/catalog/demos/upload/UploadToApi.ts?demo-source');
const loadFileInput = () => import('@/modules/catalog/demos/upload/FileInputDemo.tsx?demo-source');
const loadFileUpload = () => import('@/modules/catalog/demos/upload/FileUploadDemo.tsx?demo-source');
const loadAttachments = () => import('@/modules/catalog/demos/upload/AttachmentsDemo.tsx?demo-source');
const loadImage = () => import('@/modules/catalog/demos/upload/ImageInputDemo.tsx?demo-source');
const loadTemplate = () => import('@/modules/catalog/demos/upload/TemplateDemo.tsx?demo-source');
const loadOwnPicker = () => import('@/modules/catalog/demos/upload/OwnPickerDemo.tsx?demo-source');
const loadChunked = () => import('@/modules/catalog/demos/upload/ChunkedPondDemo.tsx?demo-source');
const loadChunkedMini = () => import('@/modules/catalog/demos/upload/ChunkedMiniDemo.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (uploads.<sección>.extend.<id>)
const ZONE_EXTENSIONS = [
    {id: 'accept', option: 'accept', example: "accept={['excel', 'csv']}  ·  accept={['pdf', '.dat']}"},
    {id: 'maxSize', option: 'maxSize', example: 'maxSize="5 MB"'},
    {id: 'texts', option: 'hint · buttonLabel', example: 'hint="Arrastre aquí el inventario" buttonLabel="Elegir el Excel"'},
    {id: 'busy', option: 'busy', example: 'busy={isUploading}'},
    {id: 'busyModal', option: 'busyModal', example: "busyModal={{title: 'Subiendo el inventario', text: 'No cierre la página.'}}"},
    {id: 'onReject', option: 'onReject', example: 'onReject={(file, reason) => logRejection(file.name, reason)}'},
    {id: 'slots', option: 'actions · children', example: 'actions={<Button>Importar</Button>}'},
    {id: 'template', option: 'template', example: "template={{href: '/plantillas/inventario.xlsx'}}  ·  template={{request: api.inventoryTemplate}}"},
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
// lo que comparten el compacto, «Adjuntar» y la imagen
const SHARED_PICKER_EXTENSIONS = [
    {id: 'rules', option: 'accept · maxSize', example: "accept={['pdf', 'image']} maxSize=\"2 MB\""},
    {id: 'onReject', option: 'onReject', example: 'onReject={(file, reason) => logRejection(file.name, reason)}'},
    {id: 'busy', option: 'busy · disabled', example: 'busy={isUploading}'},
    {id: 'helper', option: 'helperText · error', example: 'helperText="PDF de hasta 2 MB" error={errors.contract}'},
    {id: 'forms', option: 'FormFileField · FormAttachmentsField · FormImageField', example: "import {FormFileField} from '@stackcraftmx/calcita/forms';  // o /react-hook-form"},
    {id: 'theme', option: 'theme.components.Calcita…', example: "components: {CalcitaFileInput: {styleOverrides: {button: {borderRadius: 4}}}}"},
];
const FILE_INPUT_EXTENSIONS = [
    {id: 'saved', option: 'value={name, size}', example: "value={{name: 'contrato.pdf', size: 245000}}"},
    {id: 'template', option: 'template', example: "template={{href: '/plantillas/contactos.csv'}}"},
    {id: 'slots', option: 'actions · buttonLabel · emptyText', example: 'buttonLabel="Elegir el contrato" emptyText="Sin contrato"'},
    ...SHARED_PICKER_EXTENSIONS,
];
const FILE_UPLOAD_EXTENSIONS = [
    {id: 'upload', option: 'upload · idOf', example: "upload={(file, {signal, onUploadProgress, idempotencyKey}) => documentsApi.upload(file, …)} idOf={(response) => response.info.file.id}"},
    {id: 'saved', option: 'uploadedFile', example: "value={claim.ine_file_id} uploadedFile={{name: 'ine.pdf', size: 245000}}"},
    {id: 'download', option: 'download', example: 'download={(fileId, transferOptions) => documentsApi.download(fileId, transferOptions)}'},
    {id: 'actions', option: 'actions', example: '<Chip size="small" color="warning" label="Falta información" />'},
    {id: 'events', option: 'onStatusChange · onUploaded · onUploadFailed · onCancel · onRemove', example: 'onStatusChange={(status) => setStatus(key, status)}'},
    {id: 'limits', option: 'accept · maxSize · limitsText', example: "accept={['pdf', 'image']} maxSize=\"5 MB\" limitsText=\"PDF o foto, hasta 5 MB\""},
    {id: 'forms', option: 'FormFileUploadField', example: "import {FormFileUploadField} from '@stackcraftmx/calcita/forms';  // o /react-hook-form"},
    {id: 'theme', option: 'theme.components.CalcitaFileUploadInput', example: "components: {CalcitaFileUploadInput: {styleOverrides: {status: {fontWeight: 600}}}}"},
];
const ATTACHMENTS_EXTENSIONS = [
    {id: 'limits', option: 'maxFiles · maxTotalSize', example: 'maxFiles={5} maxTotalSize="5 MB"'},
    {id: 'saved', option: 'value con {id, name, size}', example: "value={[{id: 'att-1', name: 'contrato.pdf', size: 245000}, newFile]}"},
    {id: 'onRemove', option: 'onRemove', example: 'onRemove={(file) => file instanceof File || markForDeletion(file.id)}'},
    {id: 'ownButton', option: 'showButton · pickerRef', example: 'showButton={false} pickerRef={picker}  …  <IconButton onClick={() => picker.current?.open()}>'},
    {id: 'template', option: 'template · actions', example: "template={{request: api.attachmentsTemplate}}"},
    ...SHARED_PICKER_EXTENSIONS,
];
const IMAGE_EXTENSIONS = [
    {id: 'shape', option: 'shape · size', example: 'shape={IMAGE_SHAPE.rounded} size={112}'},
    {id: 'saved', option: 'value (texto)', example: 'value={user.photo_url}  // la dirección de la guardada'},
    {id: 'placeholder', option: 'placeholder · alt', example: 'placeholder={<Typography>{initialsOf(user.name)}</Typography>}'},
    {id: 'labels', option: 'chooseLabel · removeLabel', example: 'chooseLabel="Subir el logo" removeLabel="Quitar el logo"'},
    ...SHARED_PICKER_EXTENSIONS,
];
const TEMPLATE_EXTENSIONS = [
    {id: 'href', option: 'href · fileName', example: "href=\"/plantillas/inventario.xlsx\" fileName=\"inventario.xlsx\""},
    {id: 'request', option: 'request · format', example: "request={(transferOptions) => api.paymentsTemplate(transferOptions)} format=\"xlsx\""},
    {id: 'onDownload', option: 'onDownload', example: "onDownload={() => track('plantilla')}"},
    {id: 'look', option: 'label · variant · startIcon · sx', example: 'label="Formato del inventario" variant="outlined"'},
];
const OWN_PICKER_EXTENSIONS = [
    {id: 'hook', option: 'useFilePicker({accept, maxSize, multiple, maxFiles, maxTotalSize, keptFiles, onAccept, onReject})', example: 'const picker = useFilePicker({accept: \'image\', onAccept: setTicket});'},
    {id: 'parts', option: 'inputProps · open · dropHandlers · isDragging', example: '<input {...picker.inputProps} />  <Card onClick={picker.open} {...picker.dropHandlers}>'},
    {id: 'screen', option: 'screenFiles · fileAppearanceOf', example: "screenFiles(files, {resolvedAccept: resolveAccept('pdf'), maxFiles: 3})"},
];
const CHUNKED_EXTENSIONS = [
    {id: 'chunks', option: 'chunkUploads · chunkForce', example: 'chunkUploads chunkForce  // todo por trozos, también lo chico'},
    {id: 'size', option: 'chunkSize', example: 'chunkSize="1 MB"  ·  chunkSize={1_000_000}'},
    {id: 'retries', option: 'chunkRetryDelays', example: 'chunkRetryDelays={[500, 1000, 3000]}  ·  chunkRetryDelays={null}'},
    {id: 'patchUrl', option: 'createPondServer({url, patchUrl})', example: "createPondServer({url: '/upload', patchUrl: '/upload?patch='})"},
    {id: 'headers', option: 'createPondServer({headers})', example: "headers: {Authorization: `Bearer ${token}`, 'X-Upload-Context': JSON.stringify(datos)}"},
    {id: 'toProblem', option: 'createPondServer({toProblem})', example: 'toProblem: (body) => ({title: body.message})'},
    {id: 'sendRequest', option: 'createPondServer({sendRequest})', example: 'sendRequest: (url, body, {method, headers, signal}) => fetch(url, {method, headers, body, signal})'},
    {id: 'pondProps', option: 'pondProps', example: 'pondProps={{maxParallelUploads: 1, onprocessfiles: avisarAlTerminar}}'},
];
const CHUNKED_MINI_EXTENSIONS = [
    {id: 'create', option: 'createChunkedUpload({url, patchUrl, chunkSize, chunkRetryDelays})', example: "upload={createChunkedUpload({url: '/upload', chunkSize: '1 MB'})}"},
    {id: 'toProblem', option: 'toProblem · headers · sendRequest', example: "createChunkedUpload({url: '/upload', toProblem: (body) => ({detail: body.message, errors: body.errors})})"},
    {id: 'onlyLarge', option: 'upload={(file, options) => …}', example: 'upload={(file, options) => (file.size > LIMITE ? porTrozos : subidaNormal)(file, options)}'},
    {id: 'forms', option: 'FormFileUploadField', example: "<FormFileUploadField name=\"backup_id\" label=\"Respaldo\" upload={porTrozos} />  // formik o react-hook-form"},
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
            <DemoSection title={t('uploads.fileInput.title')} description={t('uploads.fileInput.description')}
                         extensions={rowsOf('fileInput', FILE_INPUT_EXTENSIONS)} Demo={FileInputDemo} loadSource={loadFileInput} />
            <DemoSection title={t('uploads.fileUpload.title')} description={t('uploads.fileUpload.description')}
                         extensions={rowsOf('fileUpload', FILE_UPLOAD_EXTENSIONS)} Demo={FileUploadDemo} loadSource={loadFileUpload} />
            <DemoSection title={t('uploads.attachments.title')} description={t('uploads.attachments.description')}
                         extensions={rowsOf('attachments', ATTACHMENTS_EXTENSIONS)} Demo={AttachmentsDemo} loadSource={loadAttachments} />
            <DemoSection title={t('uploads.image.title')} description={t('uploads.image.description')}
                         extensions={rowsOf('image', IMAGE_EXTENSIONS)} Demo={ImageInputDemo} loadSource={loadImage} />
            <DemoSection title={t('uploads.template.title')} description={t('uploads.template.description')}
                         extensions={rowsOf('template', TEMPLATE_EXTENSIONS)} Demo={TemplateDemo} loadSource={loadTemplate} />
            <DemoSection title={t('uploads.ownPicker.title')} description={t('uploads.ownPicker.description')}
                         extensions={rowsOf('ownPicker', OWN_PICKER_EXTENSIONS)} Demo={OwnPickerDemo} loadSource={loadOwnPicker} />
            <DemoSection title={t('uploads.chunked.title')} description={t('uploads.chunked.description')}
                         extensions={rowsOf('chunked', CHUNKED_EXTENSIONS)} Demo={ChunkedPondDemo} loadSource={loadChunked} />
            <DemoSection title={t('uploads.chunkedMini.title')} description={t('uploads.chunkedMini.description')}
                         extensions={rowsOf('chunkedMini', CHUNKED_MINI_EXTENSIONS)} Demo={ChunkedMiniDemo} loadSource={loadChunkedMini} />
        </Stack>
    );
};
