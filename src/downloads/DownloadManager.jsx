// Panel de descargas al estilo de Google Drive: se pega abajo a la derecha SOLO mientras hay descargas, con una barra que
// resume («Descargando 2 archivos…», «3 descargas listas») y la lista con el ícono del tipo de archivo y un anillo de
// avance que termina en ✓. Con MUI y XState, sin Redux.
//
// Qué hace para no hacer ruido:
//   - no hay botón fijo: sin descargas no se pinta nada;
//   - se pliega a la barra con la flecha y se vuelve a abrir cuando entra otra descarga;
//   - cuando todo terminó bien se va solo a los AUTO_DISMISS_MILLISECONDS; si algo falló o se canceló se queda hasta que
//     la persona lo cierra, para que vea el motivo;
//   - la X solo aparece cuando ya nada descarga (cerrar a media descarga dejaría el archivo sin aviso de que terminó).
//
// Se monta UNA sola vez en la raíz de la aplicación. Lee la lista de downloadsActor; las descargas las arranca startDownload desde cada
// pantalla. Los avisos (sonner) salen abajo a la izquierda, así que el panel va a la derecha.
// Con el vidrio del tema (createToolkitTheme({glass: true})) el panel es de vidrio: flota sobre la pantalla.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaDownloadManager con defaultProps y
// styleOverrides de sus partes: doneIcon, failedIcon, canceledIcon, cancelButton, progress, cancelIcon, item, itemText,
// itemStatus, itemActions, panel, header, title, list.
//
// Genérico del paquete: function (regla de la casa).
import {Fragment, useEffect, useRef, useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useSelector} from '@xstate/react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {cancelDownload, clearFinishedDownloads, countActiveDownloads, downloadsActor} from '@/downloads/downloadQueue.js';
import {UNKNOWN_FILE_TYPE, useFileTypes} from '@/downloads/fileTypes.js';
import {DOWNLOAD_STATUS} from '@/downloads/downloadsMachine.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';
import ComponentTexts from '@/toolkit/ComponentTexts.jsx';
import {piecePart} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaDownloadManager)
const THEME_NAME = 'CalcitaDownloadManager';
const DownloadsDoneIcon = piecePart(THEME_NAME, 'DoneIcon', CheckCircleIcon);
const DownloadsFailedIcon = piecePart(THEME_NAME, 'FailedIcon', ErrorOutlineIcon);
const DownloadsCanceledIcon = piecePart(THEME_NAME, 'CanceledIcon', BlockOutlinedIcon);
const DownloadsCancelButton = piecePart(THEME_NAME, 'CancelButton', IconButton);
const DownloadsProgress = piecePart(THEME_NAME, 'Progress', CircularProgress);
const DownloadsCancelIcon = piecePart(THEME_NAME, 'CancelIcon', CloseIcon);
const DownloadsItem = piecePart(THEME_NAME, 'Item', ListItem);
const DownloadsItemText = piecePart(THEME_NAME, 'ItemText', Box);
const DownloadsItemStatus = piecePart(THEME_NAME, 'ItemStatus', Typography);
const DownloadsItemActions = piecePart(THEME_NAME, 'ItemActions', Box);
const DownloadsPanel = piecePart(THEME_NAME, 'Panel', Paper);
const DownloadsHeader = piecePart(THEME_NAME, 'Header', Stack);
const DownloadsTitle = piecePart(THEME_NAME, 'Title', Typography);
const DownloadsList = piecePart(THEME_NAME, 'List', List);

// cuánto se queda el panel después de que TODAS las descargas terminaron bien
const AUTO_DISMISS_MILLISECONDS = 5000;

// separación del borde derecho y ancho del panel (en el teléfono ocupa el ancho menos los márgenes)
const SCREEN_EDGE_SPACING = 3;
const PANEL_WIDTH_PIXELS = 360;
const LIST_MAX_HEIGHT = '40vh';
const PROGRESS_RING_PIXELS = 22;

/**
 * Tipo de archivo de una descarga: el que dijo quien la arrancó o, al terminar, la extensión del nombre. Los tipos son los de
 * la casa y los del proyecto (ToolkitProvider fileTypes).
 *
 * @param {object} download renglón de la lista (downloadsMachine)
 * @param {Record<string, {Icon: import('react').ElementType, color?: string}>} fileTypes
 * @returns {{Icon: import('react').ElementType, color: string}}
 */
function fileTypeAppearanceOf(download, fileTypes) {
    const extension = download.fileName?.split('.').pop()?.toLowerCase();
    const fileType = fileTypes[download.format ?? extension];
    return fileType ? {Icon: fileType.Icon ?? UNKNOWN_FILE_TYPE.Icon, color: fileType.color ?? UNKNOWN_FILE_TYPE.color} : UNKNOWN_FILE_TYPE;
}

/**
 * Segunda línea del renglón: cuánto lleva, cuánto pesó o por qué no se pudo.
 *
 * @param {object} download
 * @param {Function} t traductor de common
 * @param {(bytes: number) => string} formatFileSize el de useFormatters (el idioma del proveedor más cercano)
 * @returns {string}
 */
function detailTextOf(download, t, formatFileSize) {
    if (download.status === DOWNLOAD_STATUS.completed) {
        return formatFileSize(download.loadedBytes);
    }
    if (download.status === DOWNLOAD_STATUS.failed) {
        return download.errorMessage ?? t('downloads.failed');
    }
    if (download.status === DOWNLOAD_STATUS.canceled) {
        return t('downloads.canceled');
    }
    if (download.loadedBytes === 0) {
        return t('downloads.preparing');
    }
    // un archivo que se arma al vuelo (el log) no dice su tamaño: se enseña lo que ya bajó
    return download.totalBytes
        ? t('downloads.progressOf', {loaded: formatFileSize(download.loadedBytes), total: formatFileSize(download.totalBytes)})
        : t('downloads.progressLoaded', {loaded: formatFileSize(download.loadedBytes)});
}

/**
 * Resumen de la barra, como en Drive: lo que está pasando ahora o cómo terminó.
 *
 * @param {Array<object>} downloads
 * @param {Function} t traductor de common
 * @returns {string}
 */
function summaryTextOf(downloads, t) {
    const activeCount = countActiveDownloads(downloads);
    if (activeCount > 0) {
        return t('downloads.summaryDownloading', {count: activeCount});
    }
    const failedCount = downloads.filter((download) => download.status === DOWNLOAD_STATUS.failed).length;
    if (failedCount > 0) {
        return t('downloads.summaryFailed', {count: failedCount});
    }
    const completedCount = downloads.filter((download) => download.status === DOWNLOAD_STATUS.completed).length;
    return t('downloads.summaryCompleted', {count: completedCount});
}

/**
 * Lo que va a la derecha del renglón: el anillo de avance con su botón para cancelar, o cómo terminó.
 *
 * @param {{download: object, displayName: string}} props
 */
function DownloadStatusIndicator({download, displayName}) {
    const {t} = useToolkitTranslation('common');

    if (download.status === DOWNLOAD_STATUS.completed) {
        return <DownloadsDoneIcon ownSx={{color: 'success.main'}} aria-label={t('downloads.completedOf', {name: displayName})} />;
    }
    if (download.status === DOWNLOAD_STATUS.failed) {
        return <DownloadsFailedIcon ownSx={{color: 'error.main'}} aria-label={t('downloads.failedOf', {name: displayName})} />;
    }
    if (download.status === DOWNLOAD_STATUS.canceled) {
        return <DownloadsCanceledIcon ownSx={{color: 'text.disabled'}} aria-label={t('downloads.canceledOf', {name: displayName})} />;
    }

    const hasKnownSize = Boolean(download.totalBytes);
    // el anillo y, encima, la X para cancelar: como en Drive, un solo lugar para ver y detener
    return (
        <Tooltip title={t('downloads.cancel')}>
            <DownloadsCancelButton size="small" aria-label={t('downloads.cancelOf', {name: displayName})} onClick={() => cancelDownload(download.id)}
                        ownSx={{position: 'relative', width: PROGRESS_RING_PIXELS + 10, height: PROGRESS_RING_PIXELS + 10}}>
                <DownloadsProgress
                    size={PROGRESS_RING_PIXELS}
                    thickness={4}
                    variant={hasKnownSize ? 'determinate' : 'indeterminate'}
                    value={hasKnownSize ? Math.min(100, (download.loadedBytes * 100) / download.totalBytes) : undefined}
                    ownSx={{position: 'absolute'}}
                />
                <DownloadsCancelIcon ownSx={{fontSize: 12}} />
            </DownloadsCancelButton>
        </Tooltip>
    );
}

/**
 * Un renglón: ícono del tipo de archivo, nombre, detalle y estatus.
 *
 * @param {{download: object}} props
 */
function DownloadRow({download}) {
    const {t} = useToolkitTranslation('common');
    const {formatFileSize} = useFormatters();
    const {Icon, color} = fileTypeAppearanceOf(download, useFileTypes());
    const displayName = download.fileName ?? download.label;
    const isFailed = download.status === DOWNLOAD_STATUS.failed;

    return (
        // minWidth 0: sin él un nombre largo empuja el renglón y la lista enseña una barra horizontal
        <DownloadsItem disableGutters ownSx={{gap: 1.5, px: 2, py: 1, minWidth: 0}}>
            <Icon fontSize="small" sx={{color, flexShrink: 0}} />
            <DownloadsItemText ownSx={{minWidth: 0, flex: 1}}>
                <Tooltip title={displayName}>
                    <Typography variant="body2" noWrap>{displayName}</Typography>
                </Tooltip>
                <DownloadsItemStatus variant="caption" component="p" noWrap={!isFailed}
                            ownSx={{color: isFailed ? 'error.main' : 'text.secondary'}}>
                    {detailTextOf(download, t, formatFileSize)}
                </DownloadsItemStatus>
            </DownloadsItemText>
            <DownloadsItemActions ownSx={{flexShrink: 0, display: 'flex', alignItems: 'center'}}>
                <DownloadStatusIndicator download={download} displayName={displayName} />
            </DownloadsItemActions>
        </DownloadsItem>
    );
}

/**
 * @param {object} [props]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function DownloadManager({texts} = {}) {
    const {t} = useToolkitTranslation('common', texts);
    const downloads = useSelector(downloadsActor, (snapshot) => snapshot.context.downloads);
    const [isExpanded, setIsExpanded] = useState(true);
    const previousCountRef = useRef(downloads.length);

    const activeCount = countActiveDownloads(downloads);
    const allSucceeded = downloads.length > 0 && downloads.every((download) => download.status === DOWNLOAD_STATUS.completed);

    // una descarga nueva vuelve a desplegar el panel aunque se haya plegado
    useEffect(() => {
        if (downloads.length > previousCountRef.current) {
            setIsExpanded(true);
        }
        previousCountRef.current = downloads.length;
    }, [downloads.length]);

    // todo terminó bien: el panel se va solo (con un error o una cancelada se queda para que se lea)
    useEffect(() => {
        if (!allSucceeded) {
            return undefined;
        }
        const dismissTimer = setTimeout(clearFinishedDownloads, AUTO_DISMISS_MILLISECONDS);
        return () => clearTimeout(dismissTimer);
    }, [allSucceeded, downloads.length]);

    return (
        <ComponentTexts namespace="common" texts={texts}>
            <Slide direction="up" in={downloads.length > 0} mountOnEnter unmountOnExit>
                <DownloadsPanel
                    elevation={8}
                    role="region"
                    aria-label={t('downloads.title')}
                    ownSx={[{
                        position: 'fixed',
                        right: (theme) => theme.spacing(SCREEN_EDGE_SPACING),
                        bottom: 0,
                        width: (theme) => `min(${PANEL_WIDTH_PIXELS}px, calc(100vw - ${theme.spacing(SCREEN_EDGE_SPACING * 2)}))`,
                        // pegado al borde de abajo como en Drive: solo se redondean las esquinas de arriba
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                        overflow: 'hidden',
                        zIndex: (theme) => theme.zIndex.snackbar,
                    }, (theme) => (isGlassTheme(theme) ? glassStylesOf(theme) : {})]}
                >
                    <DownloadsHeader direction="row" ownSx={{alignItems: 'center', gap: 0.5, pl: 2, pr: 1, py: 1, bgcolor: 'action.hover'}}>
                        <DownloadsTitle variant="subtitle2" component="h2" noWrap ownSx={{flex: 1}} aria-live="polite">
                            {summaryTextOf(downloads, t)}
                        </DownloadsTitle>
                        <Tooltip title={isExpanded ? t('downloads.collapse') : t('downloads.expand')}>
                            <IconButton size="small" aria-expanded={isExpanded}
                                        aria-label={isExpanded ? t('downloads.collapse') : t('downloads.expand')}
                                        onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}>
                                {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                        {/* cerrar a media descarga dejaría el archivo sin aviso de que terminó: la X sale cuando ya nada baja */}
                        {activeCount === 0 && (
                            <Tooltip title={t('downloads.close')}>
                                <IconButton size="small" aria-label={t('downloads.close')} onClick={clearFinishedDownloads}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </DownloadsHeader>
                    <Collapse in={isExpanded}>
                        <Divider />
                        {/* OJO: overflowY auto también prende el scroll horizontal ante 1 px de más; se apaga explícito */}
                        <DownloadsList dense disablePadding ownSx={{maxHeight: LIST_MAX_HEIGHT, overflowY: 'auto', overflowX: 'hidden'}}>
                            {downloads.map((download, index) => (
                                <Fragment key={download.id}>
                                    {index > 0 && <Divider component="li" />}
                                    <DownloadRow download={download} />
                                </Fragment>
                            ))}
                        </DownloadsList>
                    </Collapse>
                </DownloadsPanel>
            </Slide>
        </ComponentTexts>
    );
}
