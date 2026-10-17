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
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';

import {cancelDownload, clearFinishedDownloads, countActiveDownloads, downloadsActor} from '@/downloads/downloadQueue.js';
import {DOWNLOAD_STATUS} from '@/downloads/downloadsMachine.js';
import {formatFileSize} from '@/formatting.js';
import {glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';

// ícono y color del tipo de archivo (el color sale de la paleta del tema, claro y oscuro)
const FILE_TYPE_APPEARANCE = {
    xlsx: {Icon: TableViewOutlinedIcon, color: 'success.main'},
    csv: {Icon: TextSnippetOutlinedIcon, color: 'info.main'},
    pdf: {Icon: PictureAsPdfOutlinedIcon, color: 'error.main'},
};
const DEFAULT_FILE_TYPE_APPEARANCE = {Icon: InsertDriveFileOutlinedIcon, color: 'text.secondary'};

// cuánto se queda el panel después de que TODAS las descargas terminaron bien
const AUTO_DISMISS_MILLISECONDS = 5000;

// separación del borde derecho y ancho del panel (en el teléfono ocupa el ancho menos los márgenes)
const SCREEN_EDGE_SPACING = 3;
const PANEL_WIDTH_PIXELS = 360;
const LIST_MAX_HEIGHT = '40vh';
const PROGRESS_RING_PIXELS = 22;

/**
 * Tipo de archivo de una descarga: el que dijo quien la arrancó o, al terminar, la extensión del nombre.
 *
 * @param {object} download renglón de la lista (downloadsMachine)
 * @returns {{Icon: import('react').ElementType, color: string}}
 */
function fileTypeAppearanceOf(download) {
    const extension = download.fileName?.split('.').pop()?.toLowerCase();
    return FILE_TYPE_APPEARANCE[download.format ?? extension] ?? DEFAULT_FILE_TYPE_APPEARANCE;
}

/**
 * Segunda línea del renglón: cuánto lleva, cuánto pesó o por qué no se pudo.
 *
 * @param {object} download
 * @param {Function} t traductor de common
 * @returns {string}
 */
function detailTextOf(download, t) {
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
        return <CheckCircleIcon sx={{color: 'success.main'}} aria-label={t('downloads.completedOf', {name: displayName})} />;
    }
    if (download.status === DOWNLOAD_STATUS.failed) {
        return <ErrorOutlineIcon sx={{color: 'error.main'}} aria-label={t('downloads.failedOf', {name: displayName})} />;
    }
    if (download.status === DOWNLOAD_STATUS.canceled) {
        return <BlockOutlinedIcon sx={{color: 'text.disabled'}} aria-label={t('downloads.canceledOf', {name: displayName})} />;
    }

    const hasKnownSize = Boolean(download.totalBytes);
    // el anillo y, encima, la X para cancelar: como en Drive, un solo lugar para ver y detener
    return (
        <Tooltip title={t('downloads.cancel')}>
            <IconButton size="small" aria-label={t('downloads.cancelOf', {name: displayName})} onClick={() => cancelDownload(download.id)}
                        sx={{position: 'relative', width: PROGRESS_RING_PIXELS + 10, height: PROGRESS_RING_PIXELS + 10}}>
                <CircularProgress
                    size={PROGRESS_RING_PIXELS}
                    thickness={4}
                    variant={hasKnownSize ? 'determinate' : 'indeterminate'}
                    value={hasKnownSize ? Math.min(100, (download.loadedBytes * 100) / download.totalBytes) : undefined}
                    sx={{position: 'absolute'}}
                />
                <CloseIcon sx={{fontSize: 12}} />
            </IconButton>
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
    const {Icon, color} = fileTypeAppearanceOf(download);
    const displayName = download.fileName ?? download.label;
    const isFailed = download.status === DOWNLOAD_STATUS.failed;

    return (
        // minWidth 0: sin él un nombre largo empuja el renglón y la lista enseña una barra horizontal
        <ListItem disableGutters sx={{gap: 1.5, px: 2, py: 1, minWidth: 0}}>
            <Icon fontSize="small" sx={{color, flexShrink: 0}} />
            <Box sx={{minWidth: 0, flex: 1}}>
                <Tooltip title={displayName}>
                    <Typography variant="body2" noWrap>{displayName}</Typography>
                </Tooltip>
                <Typography variant="caption" component="p" noWrap={!isFailed}
                            sx={{color: isFailed ? 'error.main' : 'text.secondary'}}>
                    {detailTextOf(download, t)}
                </Typography>
            </Box>
            <Box sx={{flexShrink: 0, display: 'flex', alignItems: 'center'}}>
                <DownloadStatusIndicator download={download} displayName={displayName} />
            </Box>
        </ListItem>
    );
}

export default function DownloadManager() {
    const {t} = useToolkitTranslation('common');
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
        <Slide direction="up" in={downloads.length > 0} mountOnEnter unmountOnExit>
            <Paper
                elevation={8}
                role="region"
                aria-label={t('downloads.title')}
                sx={[{
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
                <Stack direction="row" sx={{alignItems: 'center', gap: 0.5, pl: 2, pr: 1, py: 1, bgcolor: 'action.hover'}}>
                    <Typography variant="subtitle2" component="h2" noWrap sx={{flex: 1}} aria-live="polite">
                        {summaryTextOf(downloads, t)}
                    </Typography>
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
                </Stack>
                <Collapse in={isExpanded}>
                    <Divider />
                    {/* OJO: overflowY auto también prende el scroll horizontal ante 1 px de más; se apaga explícito */}
                    <List dense disablePadding sx={{maxHeight: LIST_MAX_HEIGHT, overflowY: 'auto', overflowX: 'hidden'}}>
                        {downloads.map((download, index) => (
                            <Fragment key={download.id}>
                                {index > 0 && <Divider component="li" />}
                                <DownloadRow download={download} />
                            </Fragment>
                        ))}
                    </List>
                </Collapse>
            </Paper>
        </Slide>
    );
}
