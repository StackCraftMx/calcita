// El cargador MINI: un archivo que se SUBE en cuanto se elige, del tamaño de un renglón. Para una lista de documentos (el
// expediente de un cliente, lo que pide una solicitud): a la izquierda el nombre del documento (la etiqueta del renglón) y a
// la derecha el nombre del archivo, su estado y el botón.
//
//   estado    Por cargar · Subiendo 40 % · Procesando · Cargado · No se cargó
//   botón     Cargar (lleno) → ya cargado, Sustituir (con borde); mientras sube, Cancelar
//   íconos    bajar el que ya subió (si la pantalla da download) y quitarlo
//   abajo     el avance en palabras («1.2 MB de 3 MB · 350 kB/s · faltan 5 segundos»; el porcentaje ya va en el estado) o el
//             motivo del error
//
// Al formulario llega SOLO lo que el servidor da para reconocer el archivo (su id, por omisión result.id): el formulario
// manda ese id junto con lo demás y el backend lo liga a su registro. Mientras sube, el valor es '' (no se puede guardar
// con el id del anterior). Subir es de la pantalla: `upload` recibe el archivo con su señal para cancelar, su avance y una
// llave por archivo elegido (si la red se cae a media subida, el servidor no deja dos copias). Con uploadWithProgress o
// con axios, igual.
//
// Lo que es del negocio (Aprobado, Falta información) no va aquí: la pantalla lo pinta junto, con `actions`, y sabe en
// qué va cada uno con onStatusChange (para «3 de 5 cargados»). Tipo y peso se revisan ANTES de subir (accept, maxSize): no
// se gastan minutos subiendo lo que el servidor va a rechazar; el motivo sale abajo, en rojo.
//
// Dentro de una FormSection se vuelve renglón, como los demás campos. También se puede soltar el archivo encima.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaFileUploadInput con defaultProps y
// styleOverrides de sus partes: root, fileName, status, button, helper.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useId, useRef, useState} from 'react';
import {useMachine} from '@xstate/react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import {startDownload} from '@/downloads/downloadQueue.js';
import {translateValidationMessage} from '@/forms/validationMessages.js';
import {newIdentifier} from '@/identifiers.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {fieldErrorsOf} from '@/problems.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {FILE_REJECTION} from '@/upload/fileRules.js';
import {transferProgressOf} from '@/upload/transferProgress.js';
import {buildUploadActors, uploadMachine} from '@/upload/uploadMachine.js';
import {useFilePicker} from '@/upload/useFilePicker.js';

/** En qué va el archivo de un renglón (onStatusChange). */
export const FILE_UPLOAD_STATUS = Object.freeze({
    pending: 'pending', uploading: 'uploading', processing: 'processing', uploaded: 'uploaded', failed: 'failed',
});

// el color de la etiqueta de cada estado (el color es información)
const STATUS_COLORS = Object.freeze({
    [FILE_UPLOAD_STATUS.pending]: 'default',
    [FILE_UPLOAD_STATUS.uploading]: 'info',
    [FILE_UPLOAD_STATUS.processing]: 'info',
    [FILE_UPLOAD_STATUS.uploaded]: 'success',
    [FILE_UPLOAD_STATUS.failed]: 'error',
});

// entre las partes del avance en palabras
const PROGRESS_SEPARATOR = ' · ';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaFileUploadInput)
const THEME_NAME = 'CalcitaFileUploadInput';
const FileUploadRoot = piecePart(THEME_NAME, 'Root', Stack);
const FileUploadName = piecePart(THEME_NAME, 'FileName', Typography);
const FileUploadStatus = piecePart(THEME_NAME, 'Status', Chip);
const FileUploadButton = piecePart(THEME_NAME, 'Button', Button);
const FileUploadHelper = piecePart(THEME_NAME, 'Helper', FormHelperText);

/**
 * El texto de un error de la subida: el del campo si el servidor mandó un 422 con su lista, si no su detail, y si no hubo
 * respuesta, el genérico.
 *
 * @param {unknown} error
 * @returns {string|null}
 */
function uploadErrorTextOf(error) {
    const problem = /** @type {{problem?: object, message?: string}} */ (error)?.problem;
    const firstFieldMessage = Object.values(fieldErrorsOf(problem ?? null)).flat()[0];
    return firstFieldMessage ?? problem?.detail ?? null;
}

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {import('react').ReactNode} [props.label] ya traducida: el nombre del documento; sin ella, el renglón va solo
 * @param {string|null} [props.value] lo que el servidor dio para reconocer el archivo subido ('' o null = ninguno)
 * @param {(value: string) => void} props.onChange recibe el id al terminar de subir, '' al quitarlo o mientras sube otro
 * @param {() => void} [props.onBlur] se llama al elegir o quitar (para que el formulario lo marque como tocado)
 * @param {(file: File, options: {signal: AbortSignal, idempotencyKey: string, onUploadProgress: (transfer: {loaded: number, total: number, rate?: number, estimated?: number}) => void}) => Promise<any>} props.upload
 *     sube el archivo (con uploadWithProgress, axios o el cliente del proyecto) y regresa lo que conteste el servidor
 * @param {(result: any) => string} [props.idOf] de la respuesta, lo que se guarda en el formulario; por omisión result.id
 * @param {{name: string, size?: number}|null} [props.uploadedFile] el que ya estaba subido, para enseñar su nombre al editar
 * @param {(value: string, transferOptions: object) => Promise<{blob: Blob, fileName: string}>} [props.download] baja el
 *     que ya subió (pasa por el panel de descargas); sin él no sale el ícono
 * @param {string|string[]} [props.accept] 'pdf' | ['pdf', 'image'] | '.xlsx,.xls' | 'image/*'
 * @param {number|string} [props.maxSize] bytes o '10 MB'
 * @param {string} [props.limitsText] ya traducido: qué acepta, en palabras («PDF o foto, hasta 5 MB»); sale al pasar sobre
 *     el botón. Por omisión solo el peso máximo
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] ya traducida
 * @param {boolean} [props.disabled]
 * @param {import('react').ReactNode} [props.actions] lo del negocio junto al estado (Aprobado, Falta información)
 * @param {(result: any) => void} [props.onUploaded] terminó de subir (p. ej. para enseñar el folio de la respuesta)
 * @param {(error: unknown) => void} [props.onUploadFailed] no se pudo subir (el motivo ya sale abajo)
 * @param {() => void} [props.onCancel] la persona canceló a media subida
 * @param {() => void} [props.onRemove] la persona quitó el archivo
 * @param {(status: string) => void} [props.onStatusChange] uno de FILE_UPLOAD_STATUS, cada vez que cambia
 * @param {object} [props.sx] ajustes del renglón
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function FileUploadInput(props) {
    const {
        name, label, value = '', onChange, onBlur, upload, idOf = (result) => result?.id, uploadedFile = null, download, accept, maxSize,
        limitsText, error, helperText = ' ', disabled = false, actions, onUploaded, onUploadFailed, onCancel, onRemove, onStatusChange,
        sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const {formatFileSize} = useFormatters();
    const generatedId = useId();
    const inputId = `${name ?? 'file-upload'}-${generatedId}`;
    const labelId = `${inputId}-label`;
    const buttonTextId = `${inputId}-button`;
    const [chosenFile, setChosenFile] = useState(null);
    const [rejectedText, setRejectedText] = useState(null);
    const startedAtRef = useRef(0);
    const [uploadSnapshot, sendToUpload] = useMachine(uploadMachine.provide({
        actors: buildUploadActors(({file, idempotencyKey}, onProgress, signal) => upload(file, {
            signal,
            idempotencyKey,
            onUploadProgress: (transfer) => {
                const total = transfer.total ?? file.size;
                onProgress(total ? Math.round((transfer.loaded * 100) / total) : 0, {...transfer, total});
            },
        })),
    }));
    const {progress, transfer, result, problem} = uploadSnapshot.context;
    const isSending = uploadSnapshot.matches({uploading: 'sending'});
    const isProcessing = uploadSnapshot.matches({uploading: 'processing'});
    const isUploading = isSending || isProcessing;
    const isFailed = uploadSnapshot.matches('failed') || Boolean(rejectedText);
    const isUploaded = Boolean(value) && !isUploading && !isFailed;
    let status = FILE_UPLOAD_STATUS.pending;
    if (isSending) {
        status = FILE_UPLOAD_STATUS.uploading;
    } else if (isProcessing) {
        status = FILE_UPLOAD_STATUS.processing;
    } else if (isFailed) {
        status = FILE_UPLOAD_STATUS.failed;
    } else if (isUploaded) {
        status = FILE_UPLOAD_STATUS.uploaded;
    }

    // al terminar, el formulario se queda con el id; quien usa el campo puede enseñar lo demás de la respuesta
    useEffect(() => {
        if (!result) {
            return;
        }
        onChange(idOf(result) ?? '');
        onUploaded?.(result);
        // OJO: solo cuando llega una respuesta nueva; onChange, idOf y onUploaded cambian en cada render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result]);
    useEffect(() => {
        if (problem) {
            onUploadFailed?.(problem);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [problem]);
    useEffect(() => {
        onStatusChange?.(status);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);
    // si el formulario se limpia (después de guardar), el renglón también regresa a «por cargar»
    useEffect(() => {
        if (!value && uploadSnapshot.matches('done')) {
            setChosenFile(null);
            sendToUpload({type: 'RESET'});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const startUpload = (file) => {
        onBlur?.();
        setRejectedText(null);
        setChosenFile(file);
        // mientras sube, el formulario no tiene archivo: no se puede guardar con el id del anterior
        onChange('');
        startedAtRef.current = Date.now();
        sendToUpload({type: 'UPLOAD', input: {file, idempotencyKey: newIdentifier()}});
    };
    const picker = useFilePicker({
        accept, maxSize, disabled: disabled || isUploading, onAccept: startUpload, texts,
        onReject: (file, reason) => {
            onBlur?.();
            setRejectedText(reason === FILE_REJECTION.size
                ? t('upload.tooLarge', {name: file.name, max: formatFileSize(picker.maxBytes)})
                : t('upload.invalidType', {name: file.name, accept: picker.resolvedAccept}));
        },
    });
    const remove = () => {
        setChosenFile(null);
        setRejectedText(null);
        onChange('');
        onBlur?.();
        sendToUpload({type: 'RESET'});
        onRemove?.();
    };
    const cancel = () => {
        sendToUpload({type: 'CANCEL'});
        onCancel?.();
    };

    const shownFile = chosenFile ?? (value ? uploadedFile : null);
    const statusLabel = status === FILE_UPLOAD_STATUS.uploading
        ? t('upload.status.uploading', {percent: progress ?? 0})
        : t(`upload.status.${status}`);
    const validationText = translateValidationMessage(t, error);
    const errorText = rejectedText
        ?? (uploadSnapshot.matches('failed') ? uploadErrorTextOf(problem) ?? t('upload.failed') : null)
        ?? (isUploading ? null : validationText);
    let progressText = null;
    if (isProcessing) {
        progressText = t('upload.processing');
    } else if (isSending) {
        // «1.2 MB de 3 MB · 350 kB/s · faltan 5 segundos»: la velocidad y lo que falta, cuando ya se pueden decir (el
        // porcentaje ya va en la etiqueta del estado)
        const now = transfer ? transferProgressOf(transfer, startedAtRef.current) : null;
        progressText = now ? [
            t('upload.amount', {loaded: formatFileSize(now.loaded), total: formatFileSize(now.total)}),
            now.bytesPerSecond ? t('upload.speed', {size: formatFileSize(now.bytesPerSecond)}) : null,
            now.remainingSeconds != null ? t('upload.remaining', {count: now.remainingSeconds}) : null,
        ].filter(Boolean).join(PROGRESS_SEPARATOR) : t('upload.starting');
    } else if (uploadSnapshot.matches('cancelled')) {
        progressText = t('upload.cancelled');
    }
    const buttonHint = limitsText ?? (picker.maxBytes ? t('upload.maxSizeHint', {max: formatFileSize(picker.maxBytes)}) : '');
    const downloadUploaded = () => startDownload({
        label: shownFile?.name ?? t('upload.download'),
        request: (transferOptions) => download(value, transferOptions),
    });

    const row = (
        <div>
            <FileUploadRoot
                direction="row"
                aria-busy={isUploading}
                {...picker.dropHandlers}
                ownSx={{
                    // en el teléfono el nombre baja a su renglón; en escritorio se corta con «…» y el botón no se mueve
                    alignItems: 'center', justifyContent: 'flex-end', flexWrap: {xs: 'wrap', sm: 'nowrap'}, gap: 1, minWidth: 0, minHeight: 40,
                    px: 0.5, mx: -0.5, borderRadius: 1,
                    outline: picker.isDragging ? 2 : 0, outlineStyle: 'dashed', outlineColor: 'primary.main',
                    bgcolor: picker.isDragging ? 'action.hover' : 'transparent',
                }}
                sx={sx}
            >
                <input {...picker.inputProps} id={inputId} name={name} aria-labelledby={label ? labelId : undefined} />
                {shownFile && (
                    // el nombre cortado si es largo y completo al pasar el cursor; en el teléfono baja a su renglón
                    <Tooltip title={shownFile.size != null ? `${shownFile.name} · ${formatFileSize(shownFile.size)}` : shownFile.name}>
                        <FileUploadName variant="caption" color="text.secondary" noWrap
                                        ownSx={{minWidth: 0, flexShrink: 1, flexBasis: {xs: '100%', sm: 'auto'}, textAlign: {xs: 'right', sm: 'left'}}}>
                            {shownFile.name}
                        </FileUploadName>
                    </Tooltip>
                )}
                {actions}
                <FileUploadStatus
                    size="small"
                    color={STATUS_COLORS[status]}
                    variant={status === FILE_UPLOAD_STATUS.pending ? 'filled' : 'outlined'}
                    label={statusLabel}
                    icon={(isUploading && (
                        <CircularProgress size={12} color="inherit" variant={isProcessing ? 'indeterminate' : 'determinate'} value={progress ?? 0} />
                    )) || (isUploaded && <CheckCircleRoundedIcon />) || undefined}
                    ownSx={{flexShrink: 0}}
                />
                {isUploading ? (
                    <FileUploadButton size="small" color="inherit" onClick={cancel} ownSx={{flexShrink: 0}}>{t('upload.cancel')}</FileUploadButton>
                ) : (
                    // describeChild: lo que acepta se lee como descripción; el nombre sigue siendo «Cargar» y el documento
                    <Tooltip title={buttonHint} describeChild>
                        <FileUploadButton
                            size="small"
                            variant={isUploaded ? 'outlined' : 'contained'}
                            startIcon={<FileUploadOutlinedIcon />}
                            disabled={disabled}
                            onClick={picker.open}
                            aria-labelledby={label ? `${buttonTextId} ${labelId}` : undefined}
                            ownSx={{flexShrink: 0}}
                        >
                            <span id={buttonTextId}>{isUploaded ? t('upload.replace') : t('upload.upload')}</span>
                        </FileUploadButton>
                    </Tooltip>
                )}
                {isUploaded && download && (
                    <Tooltip title={t('upload.download')}>
                        <IconButton size="small" aria-label={t('upload.download')} onClick={downloadUploaded}>
                            <FileDownloadOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                {isUploaded && !disabled && (
                    <Tooltip title={t('upload.remove', {name: shownFile?.name ?? ''})}>
                        <IconButton size="small" aria-label={t('upload.remove', {name: shownFile?.name ?? ''})} onClick={remove}>
                            <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </FileUploadRoot>
            {/* abajo: el error manda; si no, el avance; si no, la ayuda de la pantalla */}
            <FileUploadHelper error={Boolean(errorText)} role={errorText ? 'alert' : (progressText ? 'status' : undefined)}
                              ownSx={{textAlign: 'right', mx: 0}}>
                {errorText ?? progressText ?? helperText}
            </FileUploadHelper>
        </div>
    );

    // sin etiqueta, el renglón va solo (la pantalla pone el título del documento a su manera)
    if (!label) {
        return row;
    }
    return <FieldFrame inputId={inputId} labelId={labelId} label={label}>{row}</FieldFrame>;
}
