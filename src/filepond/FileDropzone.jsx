// La zona para soltar archivos con FilePond por dentro (react-filepond): el MISMO uso que la de MUI (FileDropzone de la
// puerta principal) más varios archivos, animaciones, el error dentro de cada archivo y, si se quiere, la subida de cada
// archivo con su propia barra de avance (server). Cambiar de una a otra es cambiar el import.
//
// Solo ELIGE archivos (controlado: value / onChange). Enviarlos es de la pantalla: arma su FormData y los sube
// (uploadWithProgress + uploadMachine). Huecos: actions (botones abajo) y children (lo que va debajo).
//
// Configuración, además de la de la zona de MUI (accept, maxSize, hint, buttonLabel, disabled, busy, busyModal, onReject):
//   multiple       varios archivos: value / onChange hablan en ARREGLOS de File
//   maxFiles       tope de archivos (solo con multiple)
//   maxTotalSize   tope de lo que pesan todos juntos (solo con multiple), con unidades como maxSize
//   validate       revisión del CONTENIDO al entrar: async (file) => true | 'mensaje de rechazo' (un .xml bien formado
//                  puede no ser una factura); lo que no pasa no entra a la lista
//   server         subir cada archivo por su cuenta con su barra (createPondServer, o un process propio)
//   instantUpload  con server, sube al soltar (por omisión NO: regla de la casa, sube cuando la persona oprime el botón,
//                  que llama apiRef.current.processFiles())
//   apiRef         la API de FilePond para ese botón (processFiles, getFiles, removeFiles…). OJO: processFiles() regresa
//                  una promesa que FALLA si algún archivo no subió; el porqué ya se ve en su tarjeta, pero hay que
//                  atraparla (.catch) o queda un error suelto en la consola
//   onProcessProgress({done, total})  el «subidos 2 de 5» del modo server
//   autoReject     (por omisión sí) lo que no es de un tipo permitido enseña su error un momento y se quita solo
//
// OJO, trampa pagada (react-filepond#198): react-filepond no siempre refresca sus funciones después de montar, y puede
// quedarse para siempre con la del primer render: quitar el archivo no apagaba el botón porque se comparaba contra un
// value viejo. Blindaje: las funciones que recibe FilePond no cambian nunca (useCallback sin dependencias) y todo lo que
// necesitan de afuera lo leen de UN ref que cada render vuelve a apuntar (latest).
//
// OJO: FilePond va NO controlado. Pasarle los archivos como prop revive archivos recién quitados; la verdad es FilePond y
// value es su espejo. Lo único que se manda de afuera hacia adentro es LIMPIAR (value vacío vacía la zona).
//
// Los colores salen del tema (claro y oscuro) con selectores que le ganan a la hoja de FilePond sin importar el orden.
//
// Genérico del paquete: function (regla de la casa).
import {useCallback, useEffect, useId, useMemo, useRef} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {FileStatus} from 'filepond';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import {FilePond, registerPlugin} from 'react-filepond';
// la hoja de FilePond la carga el empaquetador del proyecto junto con la zona (en los tipos se quita: ver
// scripts/stripStyleImportsFromTypes.js)
import 'filepond/dist/filepond.min.css';

import ModalWaiting from '@/feedback/ModalWaiting.jsx';
import {toastError} from '@/feedback/toast.jsx';
import {accentTextStylesOf} from '@/theme/glassSurface.js';
import {formatFileSize} from '@/formatting.js';
import {FILE_REJECTION, parseFileSize, resolveAccept} from '@/upload/fileRules.js';

registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

// cuánto se ve el error de un archivo de tipo no permitido antes de quitarse solo: lo suficiente para leer por qué
const AUTO_REJECT_DELAY_MILLISECONDS = 1800;
// el aviso de FilePond cuando se sueltan más archivos de los permitidos
const MAX_FILES_WARNING = 'max files';

/**
 * El tipo de un archivo para el complemento de tipos: el paquete habla de EXTENSIONES (.xlsx) y FilePond, por omisión,
 * del tipo MIME. Imagen, audio y video van por su tipo (para que 'image/*' funcione); lo demás, por su extensión.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
function detectFileType(file) {
    const mimeType = (file.type ?? '').toLowerCase();
    if (/^(image|audio|video)\//.test(mimeType)) {
        return Promise.resolve(mimeType);
    }
    const dotPosition = file.name.lastIndexOf('.');
    return Promise.resolve(dotPosition >= 0 ? file.name.slice(dotPosition).toLowerCase() : mimeType);
}

/**
 * ¿Los mismos archivos en el mismo orden?
 *
 * @param {File[]} firstFiles
 * @param {File[]} secondFiles
 * @returns {boolean}
 */
function sameFiles(firstFiles, secondFiles) {
    return firstFiles.length === secondFiles.length && firstFiles.every((file, position) => file === secondFiles[position]);
}

/**
 * value (File | File[] | null) como arreglo.
 *
 * @param {File|File[]|null} value
 * @param {boolean} multiple
 * @returns {File[]}
 */
function filesOf(value, multiple) {
    if (multiple) {
        return Array.isArray(value) ? value : (value ? [value] : []);
    }
    return value ? [value] : [];
}

/**
 * Los textos que FilePond pinta dentro de cada tarjeta (vienen en inglés), desde los textos del paquete.
 *
 * El de «no se pudo subir» enseña el mensaje del servidor cuando lo hay (createPondServer manda el título del problema
 * RFC 9457): «No se pudo subir» a secas no le dice a la persona qué corregir.
 *
 * @param {(key: string) => string} t traductor de common
 * @returns {object} props de FilePond
 */
function pondLabelsOf(t) {
    return {
        labelFileLoading: t('upload.pond.loading'),
        labelFileLoadError: t('upload.pond.loadError'),
        labelFileWaitingForSize: t('upload.pond.waitingForSize'),
        labelFileSizeNotAvailable: t('upload.pond.sizeNotAvailable'),
        labelInvalidField: t('upload.pond.invalidField'),
        labelFileProcessing: t('upload.pond.processing'),
        labelFileProcessingComplete: t('upload.pond.processingComplete'),
        labelFileProcessingAborted: t('upload.pond.processingAborted'),
        labelFileProcessingError: (error) => error?.body || t('upload.pond.processingError'),
        labelFileProcessingRevertError: t('upload.pond.revertError'),
        labelFileRemoveError: t('upload.pond.removeError'),
        labelTapToCancel: t('upload.pond.tapToCancel'),
        labelTapToRetry: t('upload.pond.tapToRetry'),
        labelTapToUndo: t('upload.pond.tapToUndo'),
        labelButtonRemoveItem: t('upload.pond.remove'),
        labelButtonAbortItemLoad: t('upload.pond.abortLoad'),
        labelButtonRetryItemLoad: t('upload.pond.retryLoad'),
        labelButtonAbortItemProcessing: t('upload.pond.abortProcessing'),
        labelButtonUndoItemProcessing: t('upload.pond.undoProcessing'),
        labelButtonRetryItemProcessing: t('upload.pond.retryProcessing'),
        labelButtonProcessItem: t('upload.pond.processItem'),
    };
}

/**
 * Los colores de FilePond desde el tema. El «& » los anida dentro de la caja: pesan más que los de la hoja de FilePond
 * aunque esa hoja cargue después.
 *
 * @param {object} theme tema de MUI (con o sin variables CSS)
 * @returns {object}
 */
function pondThemeSxOf(theme) {
    const {palette} = theme.vars ?? theme;
    return {
        '& .filepond--root': {fontFamily: theme.typography.fontFamily, mb: 0},
        '& .filepond--panel-root': {bgcolor: palette.background.paper, border: `2px dashed ${palette.divider}`, borderRadius: 2},
        '& .filepond--drop-label': {color: palette.text.primary},
        // la liga «Elegir archivos»: del color del tema pero legible (accentTextStylesOf); el naranja tal cual se perdía en oscuro
        '& .filepond--label-action': {...accentTextStylesOf(theme), textDecorationColor: 'currentColor'},
        '& .filepond--item-panel': {bgcolor: palette.primary.main},
        '& .filepond--file, & .filepond--file-action-button': {color: palette.primary.contrastText},
    };
}

/**
 * @param {object} props
 * @param {File|File[]|null} [props.value]
 * @param {(value: File|File[]|null) => void} props.onChange
 * @param {string|string[]} [props.accept]
 * @param {number|string} [props.maxSize] por archivo
 * @param {boolean} [props.multiple]
 * @param {number} [props.maxFiles]
 * @param {number|string} [props.maxTotalSize]
 * @param {string} [props.name] nombre del campo; por omisión uno propio por zona (dos zonas no se pisan)
 * @param {string} [props.hint]
 * @param {string} [props.buttonLabel]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.busy]
 * @param {boolean|{title?: string, text?: string}} [props.busyModal]
 * @param {boolean} [props.autoReject]
 * @param {((file: File) => Promise<true|string>)|null} [props.validate]
 * @param {object|null} [props.server] createPondServer(...) o {process} propio
 * @param {boolean} [props.instantUpload]
 * @param {{current: object|null}|null} [props.apiRef]
 * @param {(progress: {done: number, total: number}) => void} [props.onProcessProgress]
 * @param {(file: File|null, reason: string, message?: string) => void} [props.onReject] reason de FILE_REJECTION
 * @param {import('react').ReactNode} [props.actions]
 * @param {import('react').ReactNode} [props.children]
 * @param {object} [props.sx]
 */
export default function FileDropzone({
    value = null, onChange, accept, maxSize, multiple = false, maxFiles, maxTotalSize, name, hint, buttonLabel, disabled = false,
    busy = false, busyModal = false, autoReject = true, validate = null, server = null, instantUpload = false, apiRef = null,
    onProcessProgress, onReject, actions, children, sx,
}) {
    const {t} = useToolkitTranslation('common');
    const generatedId = useId();
    const pondName = name ?? `file-dropzone-${generatedId}`;
    // el candado: apagado o subiendo. Va también en cada allow* de FilePond, no solo en lo visual
    const isLocked = disabled || busy;

    const resolvedAccept = useMemo(() => resolveAccept(accept), [accept]);
    const acceptedTypes = useMemo(() => (resolvedAccept ? resolvedAccept.split(',') : null), [resolvedAccept]);
    const maxBytes = parseFileSize(maxSize);
    const maxTotalBytes = multiple ? parseFileSize(maxTotalSize) : null;
    const typeErrorLabel = t('upload.invalidTitle');
    const totalErrorLabel = t('upload.totalTooLargeShort');
    const files = useMemo(() => filesOf(value, multiple), [value, multiple]);

    const pondRef = useRef(null);
    // lo que las funciones fijas necesitan de afuera, siempre al día (ver la trampa del encabezado)
    const latest = useRef({});
    latest.current = {files, multiple, onChange, onReject, autoReject, validate, onProcessProgress, maxFiles, typeErrorLabel, totalErrorLabel, t};

    useEffect(() => {
        if (apiRef) {
            apiRef.current = pondRef.current;
        }
    });

    // value desde FilePond. Los archivos con error se quedan en pantalla (en rojo) pero no cuentan: con un archivo malo
    // el botón de enviar no se prende. Y un removeFiles() hecho desde aquí no debe avisar un cambio fantasma
    const syncFromPond = useCallback(() => {
        const {files: currentFiles, multiple: isMultiple, onChange: emitChange} = latest.current;
        const pondItems = pondRef.current?.getFiles?.() ?? [];
        const nextFiles = pondItems.filter((item) => item.status !== FileStatus.LOAD_ERROR).map((item) => item.file);
        if (isMultiple) {
            if (!sameFiles(nextFiles, currentFiles)) {
                emitChange(nextFiles);
            }
            return;
        }
        const nextFile = nextFiles[0] ?? null;
        if (nextFile !== (currentFiles[0] ?? null)) {
            emitChange(nextFile);
        }
    }, []);

    const handleError = useCallback((error, item) => {
        // el archivo acaba de quedar con error: se saca de value
        syncFromPond();
        const {onReject: reject, autoReject: shouldAutoReject, typeErrorLabel: typeLabel, totalErrorLabel: totalLabel} = latest.current;
        // el motivo se reconoce por el texto, que es nuestro: comparación estable
        let reason = FILE_REJECTION.size;
        if (error?.main === typeLabel) {
            reason = FILE_REJECTION.type;
        } else if (error?.main === totalLabel) {
            reason = FILE_REJECTION.total;
        }
        // el de tipo no permitido se va solo después de que se lea su error; el de peso se queda para saber cuál pesa de más
        if (reason === FILE_REJECTION.type && shouldAutoReject && item?.id) {
            setTimeout(() => {
                if (pondRef.current?.getFile?.(item.id)) {
                    pondRef.current.removeFile(item.id);
                }
            }, AUTO_REJECT_DELAY_MILLISECONDS);
        }
        if (reject && item?.file) {
            reject(item.file, reason);
        }
    }, [syncFromPond]);

    // la revisión del contenido, ANTES de que el archivo entre a la lista
    const handleBeforeAdd = useCallback(async (item) => {
        const {validate: judge, onReject: reject, typeErrorLabel: fallbackMessage} = latest.current;
        if (!judge) {
            return true;
        }
        let verdict;
        try {
            verdict = await judge(item.file);
        } catch {
            verdict = false;
        }
        if (verdict === true) {
            return true;
        }
        const message = typeof verdict === 'string' ? verdict : fallbackMessage;
        if (reject) {
            reject(item.file, FILE_REJECTION.content, message);
        } else {
            toastError(`${item.file?.name}: ${message}`);
        }
        return false;
    }, []);

    // el «subidos X de N» del modo server: cada archivo que termina su subida avisa la cuenta
    const handleProcessed = useCallback(() => {
        const report = latest.current.onProcessProgress;
        if (!report) {
            return;
        }
        const pondItems = pondRef.current?.getFiles?.() ?? [];
        report({done: pondItems.filter((item) => item.status === FileStatus.PROCESSING_COMPLETE).length, total: pondItems.length});
    }, []);

    // lo que pasa de maxFiles ni siquiera entra (FilePond corta lo soltado y solo avisa): el aviso lo damos nosotros
    const handleWarning = useCallback((warning) => {
        const {maxFiles: maxFileCount, onReject: reject, t: translate} = latest.current;
        if (maxFileCount && String(warning?.body ?? '').toLowerCase().includes(MAX_FILES_WARNING)) {
            if (reject) {
                reject(null, FILE_REJECTION.count);
            } else {
                toastError(translate('upload.tooManyFiles', {count: maxFileCount}));
            }
        }
    }, []);

    // limpiar desde afuera: value vacío (p. ej. después de subir bien) vacía la zona
    useEffect(() => {
        const pondItems = pondRef.current?.getFiles?.() ?? [];
        if (files.length === 0 && pondItems.length > 0) {
            pondRef.current.removeFiles();
        }
    }, [files]);

    const limitHints = [
        maxBytes && t('upload.maxSizeHint', {max: formatFileSize(maxBytes)}),
        maxTotalBytes && t('upload.maxTotalSizeHint', {max: formatFileSize(maxTotalBytes)}),
        multiple && maxFiles && t('upload.maxFilesHint', {count: maxFiles}),
    ].filter(Boolean);
    // con varios archivos se dice cuántos van y cuánto pesan juntos: nadie suma tarjeta por tarjeta
    const totalBytes = multiple ? files.reduce((sum, file) => sum + (file?.size ?? 0), 0) : 0;
    const hintText = hint ?? (multiple ? t('upload.hintMultiple') : t('upload.hint'));
    const chooseText = buttonLabel ?? (multiple ? t('upload.chooseMultiple') : t('upload.choose'));

    return (
        <Box sx={[(theme) => pondThemeSxOf(theme), ...(Array.isArray(sx) ? sx : [sx])]}>
            <FilePond
                ref={pondRef}
                name={pondName}
                server={server}
                instantUpload={instantUpload}
                beforeAddFile={handleBeforeAdd}
                onprocessfile={handleProcessed}
                onupdatefiles={syncFromPond}
                allowMultiple={multiple}
                maxFiles={multiple ? (maxFiles ?? null) : 1}
                disabled={isLocked}
                allowDrop={!isLocked}
                allowBrowse={!isLocked}
                allowPaste={!isLocked}
                allowRemove={!isLocked}
                allowReplace={!isLocked}
                credits={false}
                acceptedFileTypes={acceptedTypes}
                fileValidateTypeDetectType={detectFileType}
                fileValidateTypeLabelExpectedTypes={resolvedAccept ?? ''}
                maxFileSize={maxBytes ? String(maxBytes) : null}
                maxTotalFileSize={maxTotalBytes ? String(maxTotalBytes) : null}
                labelIdle={`${hintText} — <span class="filepond--label-action">${chooseText}</span>`}
                labelFileTypeNotAllowed={typeErrorLabel}
                labelMaxFileSizeExceeded={t('upload.tooLargeShort')}
                labelMaxFileSize={maxBytes ? t('upload.maxSizeHint', {max: formatFileSize(maxBytes)}) : ''}
                labelMaxTotalFileSizeExceeded={totalErrorLabel}
                labelMaxTotalFileSize={maxTotalBytes ? t('upload.maxTotalSizeHint', {max: formatFileSize(maxTotalBytes)}) : ''}
                onwarning={handleWarning}
                onerror={handleError}
                {...pondLabelsOf(t)}
            />
            {multiple && files.length > 0 && (
                <Typography variant="body2" sx={{textAlign: 'center', mt: 1, fontWeight: 500}}>
                    {maxTotalBytes
                        ? t('upload.summaryOf', {count: files.length, total: formatFileSize(totalBytes), max: formatFileSize(maxTotalBytes)})
                        : t('upload.summary', {count: files.length, total: formatFileSize(totalBytes)})}
                </Typography>
            )}
            {limitHints.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{display: 'block', textAlign: 'center', mt: 0.5}}>
                    {limitHints.join(' · ')}
                </Typography>
            )}
            {actions && (
                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} sx={{justifyContent: 'center', alignItems: {xs: 'stretch', sm: 'center'}, mt: 2}}>
                    {actions}
                </Stack>
            )}
            {children && <Box sx={{mt: 3}}>{children}</Box>}
            {busyModal && <ModalWaiting open={busy} title={busyModal.title} text={busyModal.text} />}
        </Box>
    );
}
