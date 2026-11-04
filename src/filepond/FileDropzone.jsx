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
// Por trozos, con los nombres de FilePond (así se copia tal cual lo de un sistema que ya subía por trozos):
//   chunkUploads   sube por trozos lo que pase de chunkSize (con createPondServer, o con las direcciones de FilePond)
//   chunkForce     por trozos TODO, también lo chico (hay servidores que solo reciben por trozos)
//   chunkSize      el tamaño de cada trozo, en bytes o con unidades como maxSize ('1 MB'); por omisión el de FilePond, 5 MB
//   chunkRetryDelays  las esperas entre reintentos de un trozo, en milisegundos; null o [] = sin reintentos
// Con createPondServer la barra es honesta: cuenta lo que el servidor ya confirmó y no dice 100 % antes de tiempo
// (ver chunkedUpload.js).
//
// pondProps: cualquier otra opción de FilePond, tal cual (maxParallelUploads, onaddfile, onprocessfiles…). Lo que la zona
// ya maneja gana: name, server, files, los tipos y pesos, los textos y el candado (disabled y busy apagan soltar, elegir,
// pegar y quitar aunque pondProps los prenda). Los eventos que la zona ya usa (onupdatefiles, onprocessfile, onwarning,
// onerror, beforeAddFile) corren después de los suyos; beforeAddFile del proyecto revisa lo que ya pasó validate.
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
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaPondDropzone con defaultProps y
// styleOverrides de sus partes: root, summary, limits, actions, extra.
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
import {useFormatters} from '@/toolkit/useFormatters.js';
import {FILE_REJECTION, parseFileSize, resolveAccept} from '@/upload/fileRules.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaPondDropzone)
const THEME_NAME = 'CalcitaPondDropzone';
// la raíz: el estilo de FilePond de Calcita abajo, el tema del proyecto encima y el sx de la pantalla al final
const PondRoot = piecePart(THEME_NAME, 'Root', Box);
const PondSummary = piecePart(THEME_NAME, 'Summary', Typography);
const PondLimits = piecePart(THEME_NAME, 'Limits', Typography);
const PondActions = piecePart(THEME_NAME, 'Actions', Stack);
const PondExtra = piecePart(THEME_NAME, 'Extra', Box);

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
 * pondProps con sus funciones blindadas contra la trampa del encabezado: cada función que llega se cambia por una fija que
 * llama a la de ESTE render (la lee del ref latest). files se quita: la verdad de la lista es FilePond (ver el OJO).
 *
 * @param {object|null} pondProps
 * @param {{current: Map<string, Function>}} stableFunctions las funciones fijas ya hechas, por nombre
 * @param {{current: {pondProps?: object|null}}} latest
 * @returns {object}
 */
function stablePondPropsOf(pondProps, stableFunctions, latest) {
    const {files: ignoredFiles, ...pondOptions} = pondProps ?? {};
    if (ignoredFiles !== undefined) {
        warnUnknownProps(THEME_NAME, {'pondProps.files': ignoredFiles});
    }
    return Object.fromEntries(Object.entries(pondOptions).map(([option, value]) => {
        if (typeof value !== 'function') {
            return [option, value];
        }
        if (!stableFunctions.current.has(option)) {
            stableFunctions.current.set(option, (...args) => latest.current.pondProps?.[option]?.(...args));
        }
        return [option, stableFunctions.current.get(option)];
    }));
}

/**
 * Las opciones de trozos que la pantalla puso, para FilePond: solo las que vienen (sin ellas, FilePond sigue con las suyas).
 *
 * @param {{chunkUploads?: boolean, chunkForce?: boolean, chunkSize?: number|string, chunkRetryDelays?: number[]|null}} chunks
 * @returns {object}
 */
function chunkOptionsOf({chunkUploads, chunkForce, chunkSize, chunkRetryDelays}) {
    return {
        ...(chunkUploads !== undefined && {chunkUploads}),
        ...(chunkForce !== undefined && {chunkForce}),
        ...(chunkSize !== undefined && {chunkSize: parseFileSize(chunkSize)}),
        // FilePond truena con null: sin reintentos es una lista vacía
        ...(chunkRetryDelays !== undefined && {chunkRetryDelays: chunkRetryDelays ?? []}),
    };
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
 * @param {boolean} [props.chunkUploads] sube por trozos lo que pase de chunkSize
 * @param {boolean} [props.chunkForce] por trozos todo, también lo chico
 * @param {number|string} [props.chunkSize] en bytes o con unidades ('1 MB'); por omisión 5 MB
 * @param {number[]|null} [props.chunkRetryDelays] esperas entre reintentos de un trozo (ms); null o [] = sin reintentos
 * @param {Partial<import('filepond').FilePondOptions>|null} [props.pondProps] cualquier otra opción de FilePond, tal cual
 * @param {import('react').ReactNode} [props.actions]
 * @param {import('react').ReactNode} [props.children]
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function FileDropzoneContent(props) {
    // lo que el proyecto puso en su tema (components.CalcitaPondDropzone.defaultProps) y encima lo que llega aquí
    const {
    value = null, onChange, accept, maxSize, multiple = false, maxFiles, maxTotalSize, name, hint, buttonLabel, disabled = false,
    busy = false, busyModal = false, autoReject = true, validate = null, server = null, instantUpload = false, apiRef = null,
    onProcessProgress, onReject, chunkUploads, chunkForce, chunkSize, chunkRetryDelays, pondProps = null, actions, children, sx, texts,
    ...unknownProps
} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const {formatFileSize} = useFormatters();
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
    latest.current = {files, multiple, onChange, onReject, autoReject, validate, onProcessProgress, maxFiles, typeErrorLabel, totalErrorLabel, t, pondProps};
    const stableFunctions = useRef(new Map());
    const pondOptions = stablePondPropsOf(pondProps, stableFunctions, latest);
    // el candado gana: apagado o subiendo no se suelta, elige, pega ni quita aunque pondProps lo prenda
    const pondAllows = (option) => !isLocked && (pondProps?.[option] ?? true);

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

    const handleError = useCallback((error, item, status) => {
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
        latest.current.pondProps?.onerror?.(error, item, status);
    }, [syncFromPond]);

    // la revisión del contenido, ANTES de que el archivo entre a la lista
    const handleBeforeAdd = useCallback(async (item) => {
        const {validate: judge, onReject: reject, typeErrorLabel: fallbackMessage, pondProps: projectOptions} = latest.current;
        // la revisión del proyecto en pondProps va después de validate: lo que validate rechazó ya no le llega
        const projectAccepts = async () => (projectOptions?.beforeAddFile ? (await projectOptions.beforeAddFile(item)) !== false : true);
        if (!judge) {
            return projectAccepts();
        }
        let verdict;
        try {
            verdict = await judge(item.file);
        } catch {
            verdict = false;
        }
        if (verdict === true) {
            return projectAccepts();
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
    const handleProcessed = useCallback((error, processedItem) => {
        const {onProcessProgress: report, pondProps: projectOptions} = latest.current;
        if (report) {
            const pondItems = pondRef.current?.getFiles?.() ?? [];
            report({done: pondItems.filter((item) => item.status === FileStatus.PROCESSING_COMPLETE).length, total: pondItems.length});
        }
        projectOptions?.onprocessfile?.(error, processedItem);
    }, []);

    // lo que pasa de maxFiles ni siquiera entra (FilePond corta lo soltado y solo avisa): el aviso lo damos nosotros
    const handleWarning = useCallback((warning, file, status) => {
        const {maxFiles: maxFileCount, onReject: reject, t: translate, pondProps: projectOptions} = latest.current;
        if (maxFileCount && String(warning?.body ?? '').toLowerCase().includes(MAX_FILES_WARNING)) {
            if (reject) {
                reject(null, FILE_REJECTION.count);
            } else {
                toastError(translate('upload.tooManyFiles', {count: maxFileCount}));
            }
        }
        projectOptions?.onwarning?.(warning, file, status);
    }, []);

    // el cambio de la lista: el espejo de value y, después, el evento del proyecto
    const handleUpdateFiles = useCallback((items) => {
        syncFromPond();
        latest.current.pondProps?.onupdatefiles?.(items);
    }, [syncFromPond]);

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
        <PondRoot ownSx={(theme) => pondThemeSxOf(theme)} sx={sx}>
            <FilePond
                {...pondOptions}
                {...chunkOptionsOf({chunkUploads, chunkForce, chunkSize, chunkRetryDelays})}
                ref={pondRef}
                name={pondName}
                server={server}
                instantUpload={instantUpload}
                beforeAddFile={handleBeforeAdd}
                onprocessfile={handleProcessed}
                onupdatefiles={handleUpdateFiles}
                allowMultiple={multiple}
                maxFiles={multiple ? (maxFiles ?? null) : 1}
                disabled={isLocked}
                allowDrop={pondAllows('allowDrop')}
                allowBrowse={pondAllows('allowBrowse')}
                allowPaste={pondAllows('allowPaste')}
                allowRemove={pondAllows('allowRemove')}
                allowReplace={pondAllows('allowReplace')}
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
                <PondSummary variant="body2" ownSx={{textAlign: 'center', mt: 1, fontWeight: 500}}>
                    {maxTotalBytes
                        ? t('upload.summaryOf', {count: files.length, total: formatFileSize(totalBytes), max: formatFileSize(maxTotalBytes)})
                        : t('upload.summary', {count: files.length, total: formatFileSize(totalBytes)})}
                </PondSummary>
            )}
            {limitHints.length > 0 && (
                <PondLimits variant="caption" color="text.secondary" ownSx={{display: 'block', textAlign: 'center', mt: 0.5}}>
                    {limitHints.join(' · ')}
                </PondLimits>
            )}
            {actions && (
                <PondActions direction={{xs: 'column', sm: 'row'}} spacing={2} ownSx={{justifyContent: 'center', alignItems: {xs: 'stretch', sm: 'center'}, mt: 2}}>
                    {actions}
                </PondActions>
            )}
            {children && <PondExtra ownSx={{mt: 3}}>{children}</PondExtra>}
            {busyModal && <ModalWaiting open={busy} title={busyModal.title} text={busyModal.text} />}
        </PondRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const FileDropzone = withPieceSlots(FileDropzoneContent, THEME_NAME);
export default FileDropzone;
