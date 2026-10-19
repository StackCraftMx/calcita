// Agregador interno del administrador de descargas: la lista, cómo arrancar una descarga y el panel.
export {default as DownloadManager} from '@/downloads/DownloadManager.jsx';
export {cancelDownload, clearFinishedDownloads, startDownload} from '@/downloads/downloadQueue.js';
export {DEFAULT_FILE_TYPES, UNKNOWN_FILE_TYPE, useFileTypes} from '@/downloads/fileTypes.js';
export {DOWNLOAD_STATUS, downloadsMachine} from '@/downloads/downloadsMachine.js';
